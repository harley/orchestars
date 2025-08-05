import { FieldHookArgs } from 'payload'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
import { sql } from '@payloadcms/db-postgres/drizzle'

import { Event, User, Order } from '@/payload-types'
import { sendTicketMail } from '../helper/sendTicketMail'
import { AFFILIATE_RANKS, EVENT_AFFILIATE_RANK_STATUS } from '@/collections/Affiliate/constants'
import { TAX_PERCENTAGE_DEFAULT } from '@/collections/Events/constants/tax'
import { calculatePointCompletedOrder } from '@/collections/Membership/hooks/calculatePointCompletedOrder'
import { ORDER_ITEM_STATUS } from '../constants'
import { updateAffiliateUserRankAfterOrderCompleted } from '@/collections/Affiliate/helper/updateAffiliateUserRankAfterEventUserRankUpdated'
import { upsertEventAffiliateUserRankAfterCompletedOrder } from '@/collections/Affiliate/helper/upsertEventAffiliateUserRankAfterCompletedOrder'
import { updateEventAffiliateRankLogAfterCompletedOrder } from '@/collections/Affiliate/helper/updateEventAffiliateRankLogAfterCompletedOrder'
import { exchangeVNDToPoint } from '@/utilities/exchangeVNDToPoint'
import { createEventAffiliateRankIfNotExists } from '@/collections/Affiliate/helper/createEventAffiliateRank'

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

const getMetricsByOrderId = async ({
  orderId,
  event,
  affiliateUserId,
  db,
}: {
  orderId: number
  event: Event
  affiliateUserId: number
  db: FieldHookArgs['req']['payload']['db']
}) => {
  const eventId = event?.id as number
  const orderQuery = sql`
  SELECT 
    SUM(ord.total) AS total_after_discount_value, 
    SUM(ord.total_before_discount) AS total_before_discount_value
  FROM orders ord
  WHERE ord.id IN (
    SELECT DISTINCT oi.order_id
    FROM order_items oi
    WHERE oi.event_id = ${eventId}
  )
  AND (ord.affiliate_affiliate_user_id = ${affiliateUserId} AND ord.id = ${orderId})
`

  const ticketsQuery = sql`
  SELECT 
    COUNT(ticket.id) AS total_ticket_sold
  FROM tickets ticket
  LEFT JOIN orders ord ON ord.id = ticket.order_id
  WHERE (ord.affiliate_affiliate_user_id = ${affiliateUserId} AND ord.id = ${orderId}) AND ticket.event_id = ${eventId}
`

  const [resultCountTotal, resultCountTotalTicketSold] = await Promise.all([
    db.drizzle.execute(orderQuery).then(
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
  const taxPercentage = event?.vat?.enabled ? event.vat?.percentage || TAX_PERCENTAGE_DEFAULT : 0

  const totalValueAfterTaxAfterDiscount = totalAfterDiscountValue
  const totalValueBeforeTaxAfterDiscount = Number(
    (totalAfterDiscountValue / (1 + taxPercentage / 100)).toFixed(2),
  )
  const totalTicketSold = Number(resultCountTotalTicketSold?.total_ticket_sold) || 0

  return {
    totalBeforeDiscountValue,
    totalValueAfterTaxAfterDiscount,
    totalValueBeforeTaxAfterDiscount,
    totalTicketSold,
    totalPoints: exchangeVNDToPoint(totalValueBeforeTaxAfterDiscount),
  }
}

const getCompletedEventAffiliateUsrRankMetrics = async ({
  affiliateUserId,
  eventId,
  db,
}: {
  affiliateUserId: number
  eventId: number
  db: FieldHookArgs['req']['payload']['db']
}) => {
  const completedEventAffiliateUserRankMetricsQuery = sql`
    SELECT 
      SUM(total_points) AS total_points,
      SUM(total_revenue) AS total_revenue,
      SUM(total_revenue_before_tax) AS total_revenue_before_tax,
      SUM(total_revenue_after_tax) AS total_revenue_after_tax,
      SUM(total_revenue_before_discount) AS total_revenue_before_discount,
      SUM(total_tickets_sold) AS total_tickets_sold
    FROM event_affiliate_user_ranks
    WHERE affiliate_user_id = ${affiliateUserId}
    AND event_id = ${eventId}
    AND status = ${EVENT_AFFILIATE_RANK_STATUS.completed.value}
  `

  const completedEventAffiliateUserRankMetrics = await db.drizzle
    .execute(completedEventAffiliateUserRankMetricsQuery)
    .then(
      (res) =>
        (
          res as {
            rows?: Array<{
              total_points?: string
              total_revenue?: string
              total_revenue_before_tax?: string
              total_revenue_after_tax?: string
              total_revenue_before_discount?: string
              total_tickets_sold?: string
            }>
          }
        ).rows?.[0],
    )

  const totalPoints = Number(completedEventAffiliateUserRankMetrics?.total_points) || 0
  const totalRevenue = Number(completedEventAffiliateUserRankMetrics?.total_revenue) || 0
  const totalRevenueAfterTax =
    Number(completedEventAffiliateUserRankMetrics?.total_revenue_after_tax) || 0
  const totalRevenueBeforeDiscount =
    Number(completedEventAffiliateUserRankMetrics?.total_revenue_before_discount) || 0
  const totalTicketSold = Number(completedEventAffiliateUserRankMetrics?.total_tickets_sold) || 0

  return {
    totalRevenue,
    totalRevenueAfterTax,
    totalRevenueBeforeDiscount,
    totalTicketSold,
    totalPoints,
  }
}

const getCompletedOrderMetricsByAffiliateUser = async ({
  affiliateUserId,
  event,
  db,
}: {
  affiliateUserId: number
  event: Event
  db: FieldHookArgs['req']['payload']['db']
}) => {
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
      AND (ord.affiliate_affiliate_user_id = ${affiliateUserId} AND ord.status = 'completed')
  `

  const ticketsQuery = sql`
      SELECT 
        COUNT(ticket.id) AS total_ticket_sold
      FROM tickets ticket
      LEFT JOIN orders ord ON ord.id = ticket.order_id
      WHERE (ord.affiliate_affiliate_user_id = ${affiliateUserId} AND ord.status = 'completed') AND ticket.event_id = ${eventId}
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
  const taxPercentage = event?.vat?.enabled ? event.vat?.percentage || TAX_PERCENTAGE_DEFAULT : 0

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
    totalPoints: exchangeVNDToPoint(totalValueBeforeTaxAfterDiscount),
  }
}

const getAffiliateAggregates = async (
  affiliateUserId: number,
  orderId: number,
  event: Event,
  db: FieldHookArgs['req']['payload']['db'],
) => {
  const [metricsByOrder, metricsByAllCompletedOrders, metricsByCompletedEventAffiliateUserRank] =
    await Promise.all([
      getMetricsByOrderId({ orderId, event, affiliateUserId, db }),
      getCompletedOrderMetricsByAffiliateUser({ affiliateUserId, event, db }),
      getCompletedEventAffiliateUsrRankMetrics({
        affiliateUserId,
        eventId: event?.id as number,
        db,
      }),
    ])

  const totalValueAfterTaxAfterDiscount =
    metricsByOrder.totalValueAfterTaxAfterDiscount +
    metricsByAllCompletedOrders.totalValueAfterTaxAfterDiscount -
    metricsByCompletedEventAffiliateUserRank.totalRevenueAfterTax

  const totalValueBeforeTaxAfterDiscount =
    metricsByOrder.totalValueBeforeTaxAfterDiscount +
    metricsByAllCompletedOrders.totalValueBeforeTaxAfterDiscount -
    metricsByCompletedEventAffiliateUserRank.totalRevenue

  const totalBeforeDiscountValue =
    metricsByOrder.totalBeforeDiscountValue +
    metricsByAllCompletedOrders.totalBeforeDiscountValue -
    metricsByCompletedEventAffiliateUserRank.totalRevenueBeforeDiscount

  const totalTicketSold =
    metricsByOrder.totalTicketSold +
    metricsByAllCompletedOrders.totalTicketSold -
    metricsByCompletedEventAffiliateUserRank.totalTicketSold

  const totalPoints = exchangeVNDToPoint(totalValueBeforeTaxAfterDiscount)

  return {
    totalValueAfterTaxAfterDiscount: Number(totalValueAfterTaxAfterDiscount.toFixed(2)),
    totalValueBeforeTaxAfterDiscount: Number(totalValueBeforeTaxAfterDiscount.toFixed(2)),
    totalBeforeDiscountValue: Number(totalBeforeDiscountValue.toFixed(2)),
    totalTicketSold: Number(totalTicketSold.toFixed(2)),
    totalPoints,
    metrics: {
      metricsByOrder,
      metricsByAllCompletedOrders,
      metricsByCompletedEventAffiliateUserRank,
    },
  }
}

const getEventAffiliateUserRankAndRanks = async (
  affiliateUserId: number,
  eventId: number,
  req: FieldHookArgs['req'],
) => {
  const [eventAffiliateUserRank, affiliateRanks] = await Promise.all([
    req.payload
      .find({
        collection: 'event-affiliate-user-ranks',
        where: {
          affiliateUser: { equals: affiliateUserId },
          event: { equals: eventId },
          status: { equals: EVENT_AFFILIATE_RANK_STATUS.active.value },
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

  return {
    eventAffiliateUserRank,
    affiliateRanks,
  }
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

  const affiliateUserId = Number(affiliateUserIdValue) as number

  const { eventAffiliateUserRank, affiliateRanks } = await getEventAffiliateUserRankAndRanks(
    affiliateUserId,
    event?.id as number,
    req,
  )

  const {
    totalBeforeDiscountValue,
    totalValueAfterTaxAfterDiscount,
    totalValueBeforeTaxAfterDiscount,
    totalTicketSold,
    totalPoints,
  } = await getAffiliateAggregates(affiliateUserId, originalDoc.id, event as Event, req.payload.db)

  console.log(
    `totalBeforeDiscountValue,
    totalValueAfterTaxAfterDiscount,
    totalValueBeforeTaxAfterDiscount,
    totalTicketSold,`,
    totalBeforeDiscountValue,
    totalValueAfterTaxAfterDiscount,
    totalValueBeforeTaxAfterDiscount,
    totalTicketSold,
  )

  const sortedRanks = affiliateRanks.sort((a, b) => b.minPoints - a.minPoints)

  const eventAffiliateRank = await createEventAffiliateRankIfNotExists({
    eventId: event?.id as number,
    affiliateUserId,
    eventAffiliateUserRank,
    affiliateRanks: sortedRanks,
    req,
  })

  const activeEventAffiliateUserRank = await upsertEventAffiliateUserRankAfterCompletedOrder(
    {
      eventAffiliateUserRank,
      affiliateUserId,
      totalPoints,
      totalBeforeDiscountValue,
      totalValueAfterTaxAfterDiscount,
      totalValueBeforeTaxAfterDiscount,
      totalTicketSold,
      eventAffiliateRank,
    },
    req,
  )

  await updateAffiliateUserRankAfterOrderCompleted({
    affiliateUserId,
    activeEventAffiliateUserRank,
    req,
  })

  await updateEventAffiliateRankLogAfterCompletedOrder(
    {
      affiliateUserId,
      totalPoints,
      eventAffiliateUserRank,
      completedOrder: originalDoc,
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
    const points = exchangeVNDToPoint(total)
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
