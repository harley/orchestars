import { Event, EventAffiliateRank, EventAffiliateUserRank, Order } from '@/payload-types'
import { FieldHookArgs } from 'payload'
import { AFFILIATE_ACTION_TYPE_LOG } from '../constants/actionTypeLog'

export const updateEventAffiliateRankLogAfterCompletedOrder = (
  {
    affiliateUserId,
    totalPoints,
    eventAffiliateUserRank,
    completedOrder,
    event,
    eventAffiliateRank,
  }: {
    affiliateUserId: number
    totalPoints: number
    eventAffiliateUserRank: EventAffiliateUserRank | undefined
    completedOrder: Order
    event: Event | null
    eventAffiliateRank: EventAffiliateRank | null
  },
  req: FieldHookArgs['req'],
) => {
  const pointsBefore = eventAffiliateUserRank?.totalPoints || 0
  const pointsChange = totalPoints - pointsBefore

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
      pointsAfter: totalPoints,
      rankBefore:
        (eventAffiliateUserRank?.eventAffiliateRank as EventAffiliateRank)?.rankName || null,
      order: completedOrder.id,
      event: event?.id,
      description: `Cập nhật điểm tích lũy cho người dùng affiliate sau khi Đơn hàng #${completedOrder.orderCode} được hoàn thành`,
    },
    req,
  })
}
