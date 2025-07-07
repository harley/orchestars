import { MembershipRankConfig } from '@/payload-types'
import { BasePayload } from 'payload'
import { DEFAULT_GIFT_EXPIRES_IN, MEMBERSHIP_RANK, MEMBERSHIP_RANK_EXPIRES_IN } from '../constants'
import { TransactionID } from '@/types/TransactionID'
import { MEMBERSHIP_HISTORY_TYPE } from '../constants/membershipHistoryType'

/**
 * Calculate and update user points after an order is completed.
 * If the membership record does not exist, create it.
 * @param payload - The payload instance
 * @param userId - The user ID (number)
 * @param points - The number of points to add (integer)
 * @param transactionID - The transaction ID for DB consistency (optional)
 * @returns The updated or created membership record
 */
export async function calculatePointCompletedOrder({
  payload,
  userId,
  points,
  transactionID,
  historyData,
}: {
  payload: BasePayload
  userId: number
  points: number
  transactionID?: TransactionID
  historyData?: {
    orderCode?: string
    orderId?: number
    paymentId?: number
    [k: string]: any
  }
}) {
  // Find existing membership
  const existing = await payload.find({
    collection: 'memberships',
    where: { user: { equals: userId } },
    limit: 1,
  })
  let membership = existing.docs?.[0]

  //  sort from highest points to lowest points
  const membershipRankConfigs = await payload
    .find({
      collection: 'membership-rank-configs',
      depth: 0,
      sort: '-condition.minPoints',
    })
    .then((res) => res.docs)
    .catch((err) => {
      console.error('Error fetching membership rank configs:', err)
      return [] as MembershipRankConfig[]
    })

  if (!membershipRankConfigs?.length) {
    return
  }

  let pointsUpdated = points

  if (membership) {
    pointsUpdated = (membership.totalPoints || 0) + points
  }

  const currentMembershipRank = membershipRankConfigs.find(
    (config) => pointsUpdated >= config.condition.minPoints,
  )

  if (!currentMembershipRank) {
    return
  }

  let pointsExpirationDate: string | null = null

  //  0 value: since the rank cannot be downgraded.
  const rankExpiresInDays =
    currentMembershipRank.rankName === MEMBERSHIP_RANK.Tier1.value
      ? 0
      : currentMembershipRank.expiresIn || MEMBERSHIP_RANK_EXPIRES_IN

  if (rankExpiresInDays) {
    pointsExpirationDate = new Date(
      new Date().setDate(new Date().getDate() + rankExpiresInDays),
    ).toISOString()
  }

  if (membership) {
    // Update points
    membership = await payload.update({
      collection: 'memberships',
      id: membership.id,
      data: {
        totalPoints: pointsUpdated,
        lastActive: new Date().toISOString(),
        membershipRank: currentMembershipRank.id,
        pointsExpirationDate,
      },
      req: {
        transactionID,
      },
      depth: 0,
    })
  } else {
    // Create new membership
    membership = await payload.create({
      collection: 'memberships',
      data: {
        user: userId,
        totalPoints: pointsUpdated,
        lastActive: new Date().toISOString(),
        membershipRank: currentMembershipRank.id,
        pointsExpirationDate,
      },
      req: {
        transactionID,
      },
      depth: 0,
    })
  }

  // write member ship gift if ticket gift is exist
  if (currentMembershipRank.benefits?.ticketGift) {
    const giftExpiresInDays =
      currentMembershipRank.benefits.giftExpiresIn || DEFAULT_GIFT_EXPIRES_IN
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + giftExpiresInDays)

    await payload.create({
      collection: 'membership-gifts',
      data: {
        user: userId,
        giftType: 'giftTicket',
        ticketGift: currentMembershipRank.benefits.ticketGift,
        expiresAt: expiresAt.toISOString(),
      },
      depth: 0,
      req: { transactionID },
    })
  }

  // write membership history
  const pointsBefore = pointsUpdated - points
  await payload.create({
    collection: 'membership-histories',
    data: {
      user: userId,
      membership: membership.id,
      order: historyData?.orderId,
      type: MEMBERSHIP_HISTORY_TYPE.earned.value,
      pointsChange: points,
      pointsBefore,
      pointsAfter: pointsUpdated,
      description: `Tích điểm từ đơn hàng ${historyData?.orderCode ? `#${historyData.orderCode}` : ''}`,
      moreInformation: {
        ...(historyData || {}),
      },
    },
    depth: 0,
    req: { transactionID },
  })

  return membership
}
