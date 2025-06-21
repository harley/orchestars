import { FieldHookArgs } from 'payload'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
import { sql } from '@payloadcms/db-postgres/drizzle'

import { Event, User, Order, AffiliateUserRank as AffiliateUserRankType } from '@/payload-types'
import { sendTicketMail } from '../helper/sendTicketMail'
import { AFFILIATE_RANKS, AffiliateRank } from '@/collections/Affiliate/constants'
import { POINT_PER_VND } from '@/config/affiliate'
import { AFFILIATE_ACTION_TYPE_LOG } from '@/collections/Affiliate/constants/actionTypeLog'

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

  const tickets = await req.payload
    .update({
      collection: 'tickets',
      where: {
        or: orConditions,
      },
      data: {
        status: 'booked',
      },
      req: {
        transactionID: req.transactionID
      },
    })
    .then((res) => res.docs || [])

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
      transactionID: req?.transactionID
    })
  }

  return { tickets, event, user }
}

const getAffiliateOrderWhereClause = (affiliateUserId: number, orderId: string | number) => {
  return sql`WHERE (
    (ord.affiliate_affiliate_user_id = ${affiliateUserId} AND ord.status = 'completed') OR 
    (ord.affiliate_affiliate_user_id = ${affiliateUserId} AND ord.id = ${orderId})
  )`
}

const getAffiliateAggregates = async (
  affiliateUserId: number,
  orderId: string | number,
  db: FieldHookArgs['req']['payload']['db'],
) => {
  const whereClause = getAffiliateOrderWhereClause(affiliateUserId, orderId)

  const valueQuery = sql`
      SELECT 
        SUM(ord.total) AS total_net_value, 
        SUM(ord.total_before_discount) AS total_gross_value
      FROM orders ord
      ${whereClause}
  `

  const ticketsQuery = sql`
      SELECT 
        COUNT(ticket.id) AS total_ticket_sold
      FROM tickets ticket
      LEFT JOIN orders ord ON ord.id = ticket.order_id
      ${whereClause}
  `

  const [resultCountTotal, resultCountTotalTicketSold] = await Promise.all([
    db.drizzle.execute(valueQuery).then((res: any) => res.rows?.[0]),
    db.drizzle.execute(ticketsQuery).then((res: any) => res.rows?.[0]),
  ])

  const totalNetValue = Number(resultCountTotal?.total_net_value) || 0
  const totalGrossValue = Number(resultCountTotal?.total_gross_value) || 0
  const totalTicketSold = Number(resultCountTotalTicketSold?.total_ticket_sold) || 0

  return { totalNetValue, totalGrossValue, totalTicketSold }
}

const upsertAffiliateUserRank = async (
  {
    affiliateUserRank,
    affiliateUserId,
    newRank,
    exchangedToPoints,
    totalNetValue,
    totalGrossValue,
    totalTicketSold,
  }: {
    affiliateUserRank: AffiliateUserRankType | undefined
    affiliateUserId: string
    newRank: any
    exchangedToPoints: number
    totalNetValue: number
    totalGrossValue: number
    totalTicketSold: number
  },
  req: FieldHookArgs['req'],
) => {
  const commonData = {
    totalPoints: exchangedToPoints,
    totalRevenue: totalNetValue,
    totalRevenueBeforeDiscount: totalGrossValue,
    totalTicketsSold: totalTicketSold,
    totalCommissionEarned: 0, // todo
    totalTicketsRewarded: 0, // todo
    lastActivityDate: new Date().toISOString(),
  }

  if (!affiliateUserRank) {
    // create affiliate user rank
    return req.payload.create({
      collection: 'affiliate-user-ranks',
      data: {
        ...commonData,
        affiliateUser: Number(affiliateUserId),
        currentRank: newRank?.rankName as AffiliateRank,
        rankAchievedDate: new Date().toISOString(),
      },
      req,
    })
  }

  // update affiliate user rank
  let pendingRankUpgrade: AffiliateRank | null = null
  if (newRank && newRank.rankName !== affiliateUserRank.currentRank) {
    pendingRankUpgrade = newRank.rankName as AffiliateRank
  }

  return req.payload.update({
    collection: 'affiliate-user-ranks',
    id: affiliateUserRank.id,
    data: {
      ...commonData,
      pendingRankUpgrade,
    },
    req,
  })
}

const createAffiliateRankLog = (
  {
    affiliateUserId,
    exchangedToPoints,
    affiliateUserRank,
    newRank,
    originalDoc,
    event,
  }: {
    affiliateUserId: string
    exchangedToPoints: number
    affiliateUserRank: AffiliateUserRankType | undefined
    newRank: any
    originalDoc: Order
    event: Event | null
  },
  req: FieldHookArgs['req'],
) => {
  const pointsBefore = affiliateUserRank?.totalPoints || 0
  const pointsChange = exchangedToPoints - pointsBefore

  return req.payload.create({
    collection: 'affiliate-rank-logs',
    data: {
      affiliateUser: Number(affiliateUserId),
      actionType: AFFILIATE_ACTION_TYPE_LOG.add_points.value,
      occurredAt: new Date().toISOString(),
      pointsChange: pointsChange,
      pointsBefore: pointsBefore,
      pointsAfter: exchangedToPoints,
      rankBefore: affiliateUserRank?.currentRank || null,
      rankAfter: newRank?.rankName as AffiliateRank,
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

  const [affiliateUserRank, affiliateRanks] = await Promise.all([
    req.payload
      .find({
        collection: 'affiliate-user-ranks',
        where: {
          affiliateUser: { equals: Number(affiliateUserId) },
        },
        limit: 1,
        depth: 0,
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

  const { totalNetValue, totalGrossValue, totalTicketSold } = await getAffiliateAggregates(
    Number(affiliateUserId),
    originalDoc.id,
    req.payload.db,
  )

  const exchangedToPoints = Math.ceil(totalNetValue / POINT_PER_VND)
  const sortedRanks = affiliateRanks.sort((a, b) => b.minPoints - a.minPoints)
  const newRank = sortedRanks.find((rank) => exchangedToPoints >= rank.minPoints)

  await upsertAffiliateUserRank(
    {
      affiliateUserRank,
      affiliateUserId,
      newRank,
      exchangedToPoints,
      totalNetValue,
      totalGrossValue,
      totalTicketSold,
    },
    req,
  )

  await createAffiliateRankLog(
    {
      affiliateUserId,
      exchangedToPoints,
      affiliateUserRank,
      newRank,
      originalDoc,
      event,
    },
    req,
  )
}

const handleCompletedOrder = async (originalDoc: Order, req: FieldHookArgs['req']) => {
  try {
    const { event } = await updateTicketsAndSendEmail(originalDoc, req)

    await updateAffiliateStats(originalDoc, event, req)
  } catch (error: unknown) {
    req.payload.logger.error({
      msg: `Error handling completed order ${originalDoc.id}`,
      error,
      orderCode: originalDoc.orderCode,
    })
  }
}

export const afterChangeStatus = async ({ value, originalDoc, req, context }: FieldHookArgs) => {
  if (context.triggerAfterCreated === false) {
    return value
  }
  // When an order's status is updated to 'completed'
  if (value === 'completed' && originalDoc) {
    await handleCompletedOrder(originalDoc, req)
  }
  return value
}
