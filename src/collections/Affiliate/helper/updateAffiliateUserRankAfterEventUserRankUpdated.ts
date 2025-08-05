import { FieldHookArgs } from 'payload'
import { sql } from '@payloadcms/db-postgres'
import { AFFILIATE_RANKS, EVENT_AFFILIATE_RANK_STATUS } from '../constants'
import { AFFILIATE_ACTION_TYPE_LOG } from '../constants/actionTypeLog'
import { AffiliateRank as AffiliateRankType } from '../constants'
import { EventAffiliateUserRank } from '@/payload-types'

/**
 * Count total tickets rewarded and total commission earned from event affiliate user ranks
 * for a specific affiliate user across all events using raw SQL
 */
export const countEventAffiliateUserRankTotals = async ({
  affiliateUserId,
  notInEventAffiliateUserRankIds,
  req,
}: {
  affiliateUserId: number
  notInEventAffiliateUserRankIds?: number[]
  req: FieldHookArgs['req']
}): Promise<{
  totalTicketsRewarded: number
  totalCommissionEarned: number
  totalPoints: number
  totalRevenue: number
  totalRevenueBeforeTax: number
  totalRevenueAfterTax: number
  totalRevenueBeforeDiscount: number
  totalTicketsSold: number
}> => {
  try {
    // Use raw SQL for better performance
    const result = await req.payload.db.drizzle.transaction((tx) => {
      return tx.execute(sql`
        SELECT 
          COALESCE(SUM(total_tickets_rewarded), 0) as total_tickets_rewarded,
          COALESCE(SUM(total_commission_earned), 0) as total_commission_earned,
          COALESCE(SUM(total_points), 0) as total_points,
          COALESCE(SUM(total_revenue), 0) as total_revenue,
          COALESCE(SUM(total_revenue_before_tax), 0) as total_revenue_before_tax,
          COALESCE(SUM(total_revenue_after_tax), 0) as total_revenue_after_tax,
          COALESCE(SUM(total_revenue_before_discount), 0) as total_revenue_before_discount,
          COALESCE(SUM(total_tickets_sold), 0) as total_tickets_sold
        FROM event_affiliate_user_ranks 
        WHERE affiliate_user_id = ${affiliateUserId}
          ${notInEventAffiliateUserRankIds?.length ? sql`AND id NOT IN (${notInEventAffiliateUserRankIds?.map((id) => id).join(',')})` : ''}
          AND (
            status = ${EVENT_AFFILIATE_RANK_STATUS.active.value} 
            OR status = ${EVENT_AFFILIATE_RANK_STATUS.completed.value}
          )
      `)
    })

    console.log('result', result)

    // Extract the first row result
    const rows = (result as { rows: any[] }).rows
    const totals = rows[0] as {
      total_tickets_rewarded: number
      total_commission_earned: number
      total_points: number
      total_revenue: number
      total_revenue_before_tax: number
      total_revenue_after_tax: number
      total_revenue_before_discount: number
      total_tickets_sold: number
    }

    return {
      totalTicketsRewarded: Number(totals.total_tickets_rewarded) || 0,
      totalCommissionEarned: Number(totals.total_commission_earned) || 0,
      totalPoints: Number(totals.total_points) || 0,
      totalRevenue: Number(totals.total_revenue) || 0,
      totalRevenueBeforeTax: Number(totals.total_revenue_before_tax) || 0,
      totalRevenueAfterTax: Number(totals.total_revenue_after_tax) || 0,
      totalRevenueBeforeDiscount: Number(totals.total_revenue_before_discount) || 0,
      totalTicketsSold: Number(totals.total_tickets_sold) || 0,
    }
  } catch (error) {
    console.error('Error counting event affiliate user rank totals:', error)
    req.payload.logger.error({
      msg: `Error counting event affiliate user rank totals for user ${affiliateUserId}`,
      error,
      affiliateUserId,
    })
    return {
      totalTicketsRewarded: 0,
      totalCommissionEarned: 0,
      totalPoints: 0,
      totalRevenue: 0,
      totalRevenueBeforeTax: 0,
      totalRevenueAfterTax: 0,
      totalRevenueBeforeDiscount: 0,
      totalTicketsSold: 0,
    }
  }
}

export const updateAffiliateUserRankAfterOrderCompleted = async ({
  affiliateUserId,
  activeEventAffiliateUserRank,
  req,
}: {
  affiliateUserId: number
  activeEventAffiliateUserRank?: EventAffiliateUserRank
  req: FieldHookArgs['req']
}) => {
  try {
    // Get current affiliate user rank
    const currentAffiliateUserRank = await req.payload
      .find({
        collection: 'affiliate-user-ranks',
        where: {
          affiliateUser: { equals: Number(affiliateUserId) },
        },
        limit: 1,
        depth: 0,
      })
      .then((res) => res.docs?.[0])

    console.log('currentAffiliateUserRank', currentAffiliateUserRank)

    // count the total ticket reward and total commission from event affiliate user rank
    const notInEventAffiliateUserRankIds = activeEventAffiliateUserRank
      ? [activeEventAffiliateUserRank.id]
      : []
    const eventRankTotals = await countEventAffiliateUserRankTotals({
      affiliateUserId,
      notInEventAffiliateUserRankIds,
      req,
    })
    console.log('eventRankTotals dsfs', eventRankTotals)

    eventRankTotals.totalPoints =
      eventRankTotals.totalPoints + (activeEventAffiliateUserRank?.totalPoints || 0)
    eventRankTotals.totalTicketsRewarded =
      eventRankTotals.totalTicketsRewarded +
      (activeEventAffiliateUserRank?.totalTicketsRewarded || 0)
    eventRankTotals.totalCommissionEarned =
      eventRankTotals.totalCommissionEarned +
      (activeEventAffiliateUserRank?.totalCommissionEarned || 0)
    eventRankTotals.totalTicketsSold =
      eventRankTotals.totalTicketsSold + (activeEventAffiliateUserRank?.totalTicketsSold || 0)
    eventRankTotals.totalRevenue =
      eventRankTotals.totalRevenue + (activeEventAffiliateUserRank?.totalRevenue || 0)
    eventRankTotals.totalRevenueBeforeTax =
      eventRankTotals.totalRevenueBeforeTax +
      (activeEventAffiliateUserRank?.totalRevenueBeforeTax || 0)
    eventRankTotals.totalRevenueAfterTax =
      eventRankTotals.totalRevenueAfterTax +
      (activeEventAffiliateUserRank?.totalRevenueAfterTax || 0)
    eventRankTotals.totalRevenueBeforeDiscount =
      eventRankTotals.totalRevenueBeforeDiscount +
      (activeEventAffiliateUserRank?.totalRevenueBeforeDiscount || 0)

      console.log('eventRankTotals dsfs', eventRankTotals)
    // Get all affiliate ranks to determine the appropriate rank
    const affiliateRanks = await req.payload
      .find({
        collection: 'affiliate-ranks',
        limit: AFFILIATE_RANKS.length,
        depth: 0,
        where: {
          rankName: { in: AFFILIATE_RANKS.map((rank) => rank.value) },
        },
      })
      .then((res) => res.docs)

    // Sort ranks by minPoints descending to find the highest achievable rank
    const sortedRanks = affiliateRanks.sort((a, b) => b.minPoints - a.minPoints)

    const newRank = sortedRanks.find((rank) => eventRankTotals.totalPoints >= rank.minPoints)
    // write log for update affiliate user rank
    await req.payload.create({
      collection: 'affiliate-rank-logs',
      data: {
        affiliateUser: affiliateUserId,
        rankContext: 'user',
        actionType: AFFILIATE_ACTION_TYPE_LOG.add_points.value,
        occurredAt: new Date().toISOString(),
        pointsChange: eventRankTotals.totalPoints - (currentAffiliateUserRank?.totalPoints || 0),
        pointsBefore: currentAffiliateUserRank?.totalPoints || 0,
        pointsAfter: eventRankTotals.totalPoints,
        rankBefore: currentAffiliateUserRank?.currentRank,
        rankAfter:
          (newRank?.rankName as AffiliateRankType) || currentAffiliateUserRank?.currentRank,
        description: `Cập nhật điểm tích lũy cho người dùng affiliate sau khi event affiliate user rank được cập nhật`,
      },
      req,
    })

    if (!currentAffiliateUserRank) {
      // create a new one
      await req.payload.create({
        collection: 'affiliate-user-ranks',
        data: {
          affiliateUser: affiliateUserId,
          currentRank: newRank?.rankName as AffiliateRankType,
          totalPoints: eventRankTotals.totalPoints,
          totalRevenue: eventRankTotals.totalRevenue,
          totalRevenueBeforeTax: eventRankTotals.totalRevenueBeforeTax,
          totalRevenueAfterTax: eventRankTotals.totalRevenueAfterTax,
          totalRevenueBeforeDiscount: eventRankTotals.totalRevenueBeforeDiscount,
          totalTicketsSold: eventRankTotals.totalTicketsSold,
          totalCommissionEarned: eventRankTotals.totalCommissionEarned,
          totalTicketsRewarded: eventRankTotals.totalTicketsRewarded,
          lastActivityDate: new Date().toISOString(),
          rankAchievedDate: new Date().toISOString(),
        },
        req,
      })
    } else {
      // update affiliate user rank
      let newRank: AffiliateRankType | null = null
      const nextRankCanReach = sortedRanks.find(
        (rank) => eventRankTotals.totalPoints >= rank.minPoints,
      )
      if (nextRankCanReach && nextRankCanReach.rankName !== currentAffiliateUserRank.currentRank) {
        newRank = nextRankCanReach.rankName
      }
      // for now, auto upgrade rank if the condition is valid
      await req.payload.update({
        collection: 'affiliate-user-ranks',
        id: currentAffiliateUserRank.id,
        data: {
          currentRank: newRank ? newRank : currentAffiliateUserRank.currentRank,
          lastActivityDate: new Date().toISOString(),
          totalPoints: eventRankTotals.totalPoints,
          totalRevenue: eventRankTotals.totalRevenue,
          totalRevenueBeforeTax: eventRankTotals.totalRevenueBeforeTax,
          totalRevenueAfterTax: eventRankTotals.totalRevenueAfterTax,
          totalRevenueBeforeDiscount: eventRankTotals.totalRevenueBeforeDiscount,
          totalTicketsSold: eventRankTotals.totalTicketsSold,
          totalCommissionEarned: eventRankTotals.totalCommissionEarned,
          totalTicketsRewarded: eventRankTotals.totalTicketsRewarded,
        },
        req,
      })

      // Create log entry for rank change if applicable
      if (newRank) {
        await req.payload.create({
          collection: 'affiliate-rank-logs',
          data: {
            rankContext: 'user',
            affiliateUser: Number(affiliateUserId),
            actionType: AFFILIATE_ACTION_TYPE_LOG.rank_upgrade.value,
            occurredAt: new Date().toISOString(),
            pointsChange:
              eventRankTotals.totalPoints - (currentAffiliateUserRank?.totalPoints || 0),
            pointsBefore: currentAffiliateUserRank?.totalPoints || 0,
            pointsAfter: eventRankTotals.totalPoints,
            rankBefore: currentAffiliateUserRank.currentRank,
            rankAfter: newRank,
            description: `Nâng hạng từ ${currentAffiliateUserRank.currentRank} lên ${newRank} dựa trên tổng điểm tích lũy từ tất cả các sự kiện`,
          },
          req,
        })
      }
    }
  } catch (error) {
    console.error('Error updating affiliate user rank:', error)
    req.payload.logger.error({
      msg: `Error updating affiliate user rank for user ${affiliateUserId}`,
      error,
      affiliateUserId,
    })
    return null
  }
}
