import { FieldHookArgs } from 'payload'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
import { sql } from '@payloadcms/db-postgres/drizzle'

import {
  Event,
  User,
  Order,
  AffiliateUserRank as AffiliateUserRankType,
  EventAffiliateUserRank,
  EventAffiliateRank,
} from '@/payload-types'
import { sendTicketMail } from '../helper/sendTicketMail'
import { AFFILIATE_RANKS, AFFILIATE_RANK } from '@/collections/Affiliate/constants'
import { POINT_PER_VND } from '@/config/affiliate'
import { AFFILIATE_ACTION_TYPE_LOG } from '@/collections/Affiliate/constants/actionTypeLog'
import { TAX_PERCENTAGE_DEFAULT } from '@/collections/Events/constants/tax'
import { calculatePointCompletedOrder } from '@/collections/Membership/hooks/calculatePointCompletedOrder'
import { ORDER_ITEM_STATUS } from '../constants'

const updateTicketsAndSendEmail = async (originalDoc: Order, req: FieldHookArgs['req']) => {
  const orderItems = await req.payload
    .find({
      collection: 'orderItems',
      where: { order: { equals: originalDoc.id } },
      limit: 100,
    })
    .then((res) => res.docs)

  if (!orderItems?.length) {
    return { tickets: [], event: null, user: null }
  }

  const orConditions = orderItems.map((oItem) => ({
    orderItem: { equals: oItem.id },
    event: { equals: (oItem.event as Event).id },
  }))

  // update order items to completed status

  const [, tickets] = await Promise.all([
    req.payload.update({
      collection: 'orderItems',
      where: {
        id: { in: orderItems.map((oItem) => oItem.id) },
      },
      data: {
        status: ORDER_ITEM_STATUS.completed.value,
      },
      req: {
        transactionID: req.transactionID,
      },
    }),
    req.payload
      .update({
        collection: 'tickets',
        where: {
          or: orConditions,
        },
        data: {
          status: 'booked',
        },
        req: {
          transactionID: req.transactionID,
        },
      })
      .then((res) => res.docs || []),
  ])

  const user = tickets?.[0]?.user as User
  const event = tickets?.[0]?.event as Event
  const userEmail = user?.email

  if (userEmail) {
    const startTime = event?.startDatetime
      ? tzFormat(toZonedTime(new Date(event.startDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')
      : ''
    const endTime = event?.endDatetime
      ? tzFormat(toZonedTime(new Date(event.endDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')
      : ''
    const eventLocation = event?.eventLocation as string

    const ticketData = tickets
      .filter((tk) => !!tk.ticketCode)
      .map((tk) => ({
        ticketCode: tk.ticketCode as string,
        seat: tk.seat as string,
        ticketId: tk.id,
        eventDate: `${startTime || 'N/A'} - ${endTime || 'N/A'}, ${tk.eventDate || 'N/A'} (Giờ Việt Nam | Vietnam Time, GMT+7)`,
        eventLocation,
      }))

    await sendTicketMail({
      event,
      user,
      ticketData,
      payload: req.payload,
      transactionID: req?.transactionID,
    })
  }

  return { tickets, event, user }
}

// const updateTicketStatusesBasedOnOrder = async (
//   orderStatus: string,
//   originalDoc: Order,
//   req: FieldHookArgs['req'],
// ) => {
//   // Determine new ticket status based on order status
//   const statusMap: Record<string, 'pending_payment' | 'cancelled' | 'booked' | null> = {
//     processing: 'pending_payment',
//     cancelled: 'cancelled',
//     failed: 'cancelled',
//     completed: 'booked',
//   }

//   const newTicketStatus = statusMap[orderStatus] || null

//   if (!newTicketStatus) return

//   // Update only tickets in 'pending' status
//   const updatedTickets = await req.payload.update({
//     collection: 'tickets',
//     where: {
//       order: { equals: originalDoc.id },
//       status: { equals: 'pending_payment' },
//     },
//     data: {
//       status: newTicketStatus,
//     },
//     req: {
//       transactionID: req.transactionID,
//     },
//   })

//   console.log(`Updated ${updatedTickets.docs?.length || 0} tickets to ${newTicketStatus}`)
// }

const getAffiliateOrderWhereClause = (affiliateUserId: number, orderId: string | number) => {
  return sql`WHERE (
    (ord.affiliate_affiliate_user_id = ${affiliateUserId} AND ord.status = 'completed') OR 
    (ord.affiliate_affiliate_user_id = ${affiliateUserId} AND ord.id = ${orderId})
  )`
}

const getAffiliateAggregates = async (
  affiliateUserId: number,
  orderId: string | number,
  event: Event,
  db: FieldHookArgs['req']['payload']['db'],
) => {
  const whereClause = getAffiliateOrderWhereClause(affiliateUserId, orderId)
  const eventId = event?.id as number
  const valueQuery = sql`
      SELECT 
        SUM(ord.total) AS total_after_discount_value, 
        SUM(ord.total_before_discount) AS total_before_discount_value
      FROM orders ord
      WHERE ord.id IN (
        SELECT DISTINCT oi.order_id
        FROM order_items oi
        WHERE oi.event_id = ${eventId}
      )
      AND (
        (ord.affiliate_affiliate_user_id = ${affiliateUserId} AND ord.status = 'completed') OR 
        (ord.affiliate_affiliate_user_id = ${affiliateUserId} AND ord.id = ${orderId})
      )
  `

  const ticketsQuery = sql`
      SELECT 
        COUNT(ticket.id) AS total_ticket_sold
      FROM tickets ticket
      LEFT JOIN orders ord ON ord.id = ticket.order_id
      ${whereClause} AND ticket.event_id = ${eventId}
  `

  const [resultCountTotal, resultCountTotalTicketSold] = await Promise.all([
    db.drizzle.execute(valueQuery).then(
      (res) =>
        (
          res as {
            rows: Array<{
              total_after_discount_value?: string
              total_before_discount_value?: string
            }>
          }
        ).rows?.[0],
    ),
    db.drizzle
      .execute(ticketsQuery)
      .then((res) => (res as { rows?: Array<{ total_ticket_sold?: string }> }).rows?.[0]),
  ])

  const totalBeforeDiscountValue = Number(resultCountTotal?.total_before_discount_value) || 0
  const totalAfterDiscountValue = Number(resultCountTotal?.total_after_discount_value) || 0

  // totalAfterDiscountValue = total after tax + total after discount value

  const taxPercentage = event?.vat?.enabled ? event.vat?.percentage || TAX_PERCENTAGE_DEFAULT : 0

  // total beforeVATAndAfterDiscountValue = totalAfterDiscountValue / 1 + (taxPercentage / 100)

  const totalValueAfterTaxAfterDiscount = totalAfterDiscountValue
  const totalValueBeforeTaxAfterDiscount = Number(
    (totalAfterDiscountValue / (1 + taxPercentage / 100)).toFixed(2),
  )
  const totalTicketSold = Number(resultCountTotalTicketSold?.total_ticket_sold) || 0

  return {
    totalValueAfterTaxAfterDiscount,
    totalValueBeforeTaxAfterDiscount,
    totalAfterDiscountValue,
    totalBeforeDiscountValue,
    totalTicketSold,
  }
}

const upsertEventAffiliateUserRank = async (
  {
    eventAffiliateUserRank,
    affiliateUserId,
    exchangedToPoints,
    totalBeforeDiscountValue,
    totalValueAfterTaxAfterDiscount,
    totalValueBeforeTaxAfterDiscount,
    totalTicketSold,
    eventAffiliateRank,
  }: {
    eventAffiliateUserRank?: EventAffiliateUserRank
    affiliateUserId: string
    exchangedToPoints: number
    totalBeforeDiscountValue: number
    totalValueAfterTaxAfterDiscount: number
    totalValueBeforeTaxAfterDiscount: number
    totalTicketSold: number
    eventAffiliateRank: EventAffiliateRank
  },
  req: FieldHookArgs['req'],
) => {
  const commonData = {
    totalPoints: exchangedToPoints,
    totalRevenue: totalValueBeforeTaxAfterDiscount,
    totalRevenueBeforeTax: totalValueBeforeTaxAfterDiscount,
    totalRevenueAfterTax: totalValueAfterTaxAfterDiscount,
    totalRevenueBeforeDiscount: totalBeforeDiscountValue,
    totalTicketsSold: totalTicketSold,
    totalCommissionEarned: 0, // todo
    totalTicketsRewarded: 0, // todo
    lastActivityDate: new Date().toISOString(),
  }

  // get total totalTicketsRewarded based on the current eventAffiliateRank
  if (eventAffiliateRank.eventRewards?.ticketRewards) {
    // now check by totalRevenueBeforeDiscount first in eventAffiliateRank.eventRewards?.ticketRewards array
    // sort by minRevenue desc first
    const ticketRewards = eventAffiliateRank.eventRewards?.ticketRewards?.sort(
      (a, b) => b.minRevenue - a.minRevenue,
    )
    const ticketReward = ticketRewards?.find(
      (reward) => reward.minRevenue <= totalValueBeforeTaxAfterDiscount,
    )
    if (ticketReward) {
      commonData.totalTicketsRewarded = ticketReward.rewardTickets || 0
    }
  }

  if (eventAffiliateRank.eventRewards?.commissionRewards) {
    // sort by minRevenue desc first
    const commissionRewards = eventAffiliateRank.eventRewards?.commissionRewards?.sort(
      (a, b) => b.minRevenue - a.minRevenue,
    )
    const commissionReward = commissionRewards?.find(
      (reward) => reward.minRevenue <= totalValueBeforeTaxAfterDiscount,
    )
    if (commissionReward) {
      const commissionRate = commissionReward.commissionRate || 0

      commonData.totalCommissionEarned = Number(
        ((totalValueBeforeTaxAfterDiscount * commissionRate) / 100).toFixed(2),
      )
    }
  }

  if (!eventAffiliateUserRank) {
    // create affiliate user rank
    return req.payload.create({
      collection: 'event-affiliate-user-ranks',
      data: {
        ...commonData,
        affiliateUser: Number(affiliateUserId),
        eventAffiliateRank: eventAffiliateRank.id,
        event: eventAffiliateRank.event,
        status: 'active',
      },
      req,
    })
  }

  return req.payload.update({
    collection: 'event-affiliate-user-ranks',
    id: eventAffiliateUserRank.id,
    data: {
      ...commonData,
    },
    req,
  })
}

const createAffiliateRankLog = (
  {
    affiliateUserId,
    exchangedToPoints,
    eventAffiliateUserRank,
    originalDoc,
    event,
    eventAffiliateRank,
  }: {
    affiliateUserId: string
    exchangedToPoints: number
    eventAffiliateUserRank: EventAffiliateUserRank | undefined
    originalDoc: Order
    event: Event | null
    eventAffiliateRank: EventAffiliateRank | null
  },
  req: FieldHookArgs['req'],
) => {
  const pointsBefore = eventAffiliateUserRank?.totalPoints || 0
  const pointsChange = exchangedToPoints - pointsBefore

  return req.payload.create({
    collection: 'affiliate-rank-logs',
    data: {
      rankContext: 'event',
      affiliateUser: Number(affiliateUserId),
      actionType: AFFILIATE_ACTION_TYPE_LOG.add_points.value,
      eventAffiliateRank: eventAffiliateRank?.id,
      occurredAt: new Date().toISOString(),
      pointsChange: pointsChange,
      pointsBefore: pointsBefore,
      pointsAfter: exchangedToPoints,
      rankBefore:
        (eventAffiliateUserRank?.eventAffiliateRank as EventAffiliateRank)?.rankName || null,
      order: originalDoc.id,
      event: event?.id,
      description: `Cập nhật điểm tích lũy cho người dùng affiliate sau khi Đơn hàng #${originalDoc.orderCode} được hoàn thành`,
    },
    req,
  })
}

const updateAffiliateStats = async (
  originalDoc: Order,
  event: Event | null,
  req: FieldHookArgs['req'],
) => {
  const affiliateUserIdValue =
    (originalDoc?.affiliate?.affiliateUser as User)?.id || originalDoc?.affiliate?.affiliateUser

  if (!affiliateUserIdValue) {
    return
  }

  const affiliateUserId = String(affiliateUserIdValue)

  const [eventAffiliateUserRank, affiliateRanks] = await Promise.all([
    req.payload
      .find({
        collection: 'event-affiliate-user-ranks',
        where: {
          affiliateUser: { equals: Number(affiliateUserId) },
          event: { equals: event?.id },
        },
        limit: 1,
        depth: 1,
      })
      .then((res) => res.docs?.[0]),
    req.payload
      .find({
        collection: 'affiliate-ranks',
        limit: AFFILIATE_RANKS.length,
        depth: 0,
        where: {
          rankName: { in: AFFILIATE_RANKS.map((rank) => rank.value) },
        },
      })
      .then((res) => res.docs),
  ])

  const {
    totalBeforeDiscountValue,
    totalValueAfterTaxAfterDiscount,
    totalValueBeforeTaxAfterDiscount,
    totalTicketSold,
  } = await getAffiliateAggregates(
    Number(affiliateUserId),
    originalDoc.id,
    event as Event,
    req.payload.db,
  )

  const exchangedToPoints = Math.ceil(totalValueBeforeTaxAfterDiscount / POINT_PER_VND)
  const sortedRanks = affiliateRanks.sort((a, b) => b.minPoints - a.minPoints)

  // if eventAffiliateUserRank is not set, get default rank of user
  let eventAffiliateRank: EventAffiliateRank | null =
    eventAffiliateUserRank?.eventAffiliateRank as EventAffiliateRank | null
  let affiliateUserRank: AffiliateUserRankType | undefined = undefined
  if (!eventAffiliateRank) {
    // 1. Fetch the user's currentRank from affiliate-user-ranks
    affiliateUserRank = await req.payload
      .find({
        collection: 'affiliate-user-ranks',
        where: {
          affiliateUser: { equals: Number(affiliateUserId) },
        },
        limit: 1,
        depth: 0,
      })
      .then((res) => res.docs?.[0])

    // 2. Use currentRank to get the EventAffiliateRank for this event
    const userCurrentRank = affiliateUserRank?.currentRank || AFFILIATE_RANK.Tier1.value
    eventAffiliateRank = await req.payload
      .find({
        collection: 'event-affiliate-ranks',
        where: {
          event: { equals: event?.id },
          rankName: { equals: userCurrentRank },
          status: { equals: 'active' },
        },
        limit: 1,
        depth: 0,
      })
      .then((res) => res.docs?.[0] || null)

    if (!eventAffiliateRank) {
      // create event affiliate rank based on the affiliate user rank
      eventAffiliateRank = await req.payload.create({
        collection: 'event-affiliate-ranks',
        data: {
          event: event?.id as number,
          rankName: userCurrentRank,
          status: 'active',
          eventRewards: sortedRanks.find((rank) => rank.rankName === userCurrentRank)?.rewards,
        },
      })
    }
  }

  await upsertEventAffiliateUserRank(
    {
      eventAffiliateUserRank,
      affiliateUserId,
      exchangedToPoints,
      totalBeforeDiscountValue,
      totalValueAfterTaxAfterDiscount,
      totalValueBeforeTaxAfterDiscount,
      totalTicketSold,
      eventAffiliateRank,
    },
    req,
  )

  await createAffiliateRankLog(
    {
      affiliateUserId,
      exchangedToPoints,
      eventAffiliateUserRank,
      originalDoc,
      event,
      eventAffiliateRank,
    },
    req,
  )
}

const handleCompletedOrder = async (originalDoc: Order, req: FieldHookArgs['req']) => {
  try {
    const { event } = await updateTicketsAndSendEmail(originalDoc, req)

    await updateAffiliateStats(originalDoc, event, req)
  } catch (error: unknown) {
    console.log('error', error)
    req.payload.logger.error({
      msg: `Error handling completed order ${originalDoc.id}`,
      error,
      orderCode: originalDoc.orderCode,
    })
  }
}

const handleCalculatingPointCompletedOrder = async (
  originalDoc: Order,
  req: FieldHookArgs['req'],
) => {
  try {
    const total = originalDoc.total || 0
    const points = Math.ceil(total / POINT_PER_VND)
    const userId = (originalDoc.user as Order)?.id || originalDoc.user
    if (userId && points > 0) {
      await calculatePointCompletedOrder({
        payload: req.payload,
        userId: userId as number,
        points,
        transactionID: req.transactionID,
        historyData: {
          orderCode: originalDoc.orderCode as string,
          orderId: originalDoc.id,
        },
      })
    }
  } catch (error) {
    req.payload.logger.error({
      msg: `Error calculating point completed order [${originalDoc.id}] #${originalDoc.orderCode}`,
      error,
      orderCode: originalDoc.orderCode,
    })
  }
}

export const afterChangeStatus = async ({
  value,
  originalDoc,
  req,
  context,
  previousValue,
}: FieldHookArgs) => {
  if (context.triggerAfterCreated === false) {
    return value
  }
  // Update ticket status based on order status
  // if (value !== previousValue && originalDoc) {
  //   await updateTicketStatusesBasedOnOrder(value, originalDoc, req)
  // }
  // When an order's status is updated to 'completed'
  if (value === 'completed' && previousValue !== 'completed' && originalDoc) {
    await handleCompletedOrder(originalDoc, req)
    await handleCalculatingPointCompletedOrder(originalDoc, req)
  }
  return value
}
