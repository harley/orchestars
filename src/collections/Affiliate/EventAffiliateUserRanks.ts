import { APIError, type CollectionConfig } from 'payload'
import {
  AFFILIATE_RANK_STATUS,
  AFFILIATE_RANK_STATUSES,
  AFFILIATE_RANKS,
  AffiliateRank,
} from './constants'
import * as dateFns from 'date-fns'
import { AFFILIATE_ACTION_TYPE_LOG } from './constants/actionTypeLog'

export const EventAffiliateUserRanks: CollectionConfig = {
  slug: 'event-affiliate-user-ranks',
  admin: {
    // useAsTitle: 'eventAffiliateRank',
    defaultColumns: ['eventAffiliateRank', 'affiliateUser', 'status', 'isLocked'],
    description: 'Quản lý hạng của Affiliate Seller trong từng event cụ thể',
    components: {
      beforeList: [
        '@/components/AdminViews/ManagementAffiliate/BackToManagementAffiliate#BackToManagementAffiliate',
      ],
    },
  },

  fields: [
    {
      name: 'eventAffiliateRank',
      type: 'relationship',
      label: 'Event Affiliate Rank',
      relationTo: 'event-affiliate-ranks',
      required: true,
      admin: {
        description:
          'Hạng được gán cho Affiliate Seller trong sự kiện này (ví dụ: Fan, Ambassador)',
      },
      filterOptions: () => {
        return {
          status: {
            equals: AFFILIATE_RANK_STATUS.active.value,
          },
        }
      },
    },
    {
      name: 'event',
      type: 'relationship',
      label: 'Sự Kiện',
      relationTo: 'events',
      required: true,
      admin: {
        description: 'Sự kiện mà hạng này được áp dụng',
      },
    },
    {
      name: 'affiliateUser',
      type: 'relationship',
      label: 'Affiliate User',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Affiliate User',
      },
      filterOptions: () => {
        return {
          role: {
            equals: 'affiliate',
          },
        }
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Trạng Thái',
      required: true,
      defaultValue: 'draft',
      options: AFFILIATE_RANK_STATUSES,
      admin: {
        description:
          'Trạng thái của hạng trong event: Draft (bản nháp), Active (hoạt động), Disabled (vô hiệu hóa)',
      },
    },
    {
      name: 'isLocked',
      type: 'checkbox',
      label: 'Khóa Hạng',
      defaultValue: true,
      admin: {
        description: 'Khi khóa, hạng này sẽ không thay đổi trong suốt event',
      },
    },
    {
      name: 'totalPoints',
      type: 'number',
      label: 'Tổng Điểm Tích Lũy',
      required: true,
      defaultValue: 0,
      admin: {
        description:
          'Tổng số điểm tích lũy (1 điểm = 1000 VND doanh thu) của Affiliate User trong event này',
      },
    },
    {
      name: 'totalRevenue',
      type: 'number',
      label: 'Tổng Doanh Thu (VND)',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng doanh thu từ các đơn hàng của Affiliate User',
      },
    },
    {
      name: 'totalRevenueBeforeDiscount',
      type: 'number',
      label: 'Tổng Doanh Thu Trước Giảm Giá (VND)',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng doanh thu trước giảm giá từ các đơn hàng của Affiliate User',
      },
    },
    {
      name: 'totalTicketsSold',
      type: 'number',
      label: 'Tổng Số Vé Bán Được',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng số vé đã bán được trong tất cả sự kiện',
      },
    },
    {
      name: 'totalCommissionEarned',
      type: 'number',
      label: 'Tổng Hoa Hồng Nhận Được (VND)',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng số tiền hoa hồng có thể nhận được từ sự kiện',
      },
    },
    {
      name: 'totalTicketsRewarded',
      type: 'number',
      label: 'Tổng Số Vé Thưởng',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng số vé thưởng có thể nhận được từ sự kiện',
      },
    },
    {
      name: 'lastActivityDate',
      type: 'date',
      label: 'Ngày Hoạt Động Gần Nhất',
      admin: {
        description:
          'Thời điểm Affiliate User thực hiện hành động gần nhất (bán vé, tích điểm, v.v.) trong event này',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'isCompleted',
      type: 'checkbox',
      label: 'Đã Hoàn Thành',
      defaultValue: false,
      admin: {
        description:
          'Khi đã hoàn thành, những giá trị sẽ được tính toán và lưu vào các thông số hạng tổng của Affiliate User. Chỉ thực hiện hành động này sau khi event đã kết thúc',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        // Đảm bảo hạng không thay đổi nếu đã khóa
        if (originalDoc?.isLocked && data?.eventAffiliateRank !== originalDoc.eventAffiliateRank) {
          throw new APIError(
            'Hạng đã bị khóa và không thể thay đổi trong suốt event.',
            400,
            {},
            true,
          )
        }

        // can not update is completed from true to false
        if (originalDoc?.isCompleted && !data?.isCompleted) {
          throw new APIError('Không thể cập nhật trạng thái đã hoàn thành', 400, {}, true)
        }

        const isChecked = data?.isCompleted && !originalDoc?.isCompleted

        // validate isCompleted, just updated to true if the event has been completed
        if (isChecked) {
          // check if the event has been completed
          const event = await req.payload
            .find({
              collection: 'events',
              where: { id: { equals: data.event } },
              depth: 0,
              limit: 1,
            })
            .then((res) => res.docs?.[0])

          if (!event) {
            throw new APIError('Event not found', 400, {}, true)
          }

          if (
            event.status === 'completed' ||
            (event.endDatetime && dateFns.isAfter(new Date(), event.endDatetime))
          ) {
            data.isCompleted = true
          } else {
            throw new APIError('Event is not completed', 400, {}, true)
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ req, operation, doc, previousDoc }) => {
        if (operation !== 'update') return

        const isChecked = doc?.isCompleted && !previousDoc?.isCompleted

        // update totalPoints, totalRevenue, totalRevenueBeforeDiscount, totalTicketsSold, totalCommissionEarned, totalTicketsRewarded to affiliate-user-ranks colleciton
        if (isChecked) {
          const affiliateUserId = doc.affiliateUser?.id || doc.affiliateUser

          // save to affiliate-user-ranks, if it is not exist, create a new one
          const affiliateUserRank = await req.payload
            .find({
              collection: 'affiliate-user-ranks',
              where: { affiliateUser: { equals: affiliateUserId } },
              limit: 1,
              depth: 0,
            })
            .then((res) => res.docs?.[0])

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

          const sortedRanks = affiliateRanks.sort((a, b) => b.minPoints - a.minPoints)

          const newRank = sortedRanks.find((rank) => doc.totalPoints >= rank.minPoints)
          if (!affiliateUserRank) {
            // create a new one

            await req.payload.create({
              collection: 'affiliate-user-ranks',
              data: {
                affiliateUser: affiliateUserId,
                currentRank: newRank?.rankName as AffiliateRank,
                totalPoints: doc.totalPoints,
                totalRevenue: doc.totalRevenue,
                totalRevenueBeforeDiscount: doc.totalRevenueBeforeDiscount,
                totalTicketsSold: doc.totalTicketsSold,
                totalCommissionEarned: doc.totalCommissionEarned,
                totalTicketsRewarded: doc.totalTicketsRewarded,
                lastActivityDate: new Date().toISOString(),
                rankAchievedDate: new Date().toISOString(),
              },
            })
          } else {
            // update affiliate user rank
            let pendingRankUpgrade: AffiliateRank | null = null
            if (newRank && newRank.rankName !== affiliateUserRank.currentRank) {
              pendingRankUpgrade = newRank.rankName as AffiliateRank
            }
            await req.payload.update({
              collection: 'affiliate-user-ranks',
              id: affiliateUserRank.id,
              data: {
                pendingRankUpgrade,
                lastActivityDate: new Date().toISOString(),
                totalPoints: (affiliateUserRank.totalPoints || 0) + (doc.totalPoints || 0),
                totalRevenue: (affiliateUserRank.totalRevenue || 0) + (doc.totalRevenue || 0),
                totalRevenueBeforeDiscount: (affiliateUserRank.totalRevenueBeforeDiscount || 0) + (doc.totalRevenueBeforeDiscount || 0),
                totalTicketsSold: (affiliateUserRank.totalTicketsSold || 0) + (doc.totalTicketsSold || 0),
                totalCommissionEarned: (affiliateUserRank.totalCommissionEarned || 0) + (doc.totalCommissionEarned || 0),
                totalTicketsRewarded: (affiliateUserRank.totalTicketsRewarded || 0) + (doc.totalTicketsRewarded || 0),
              },
            })
          }

          const pointsBefore = affiliateUserRank?.totalPoints || 0
          const pointsAfter = pointsBefore + (doc.totalPoints || 0)
          const pointsChange = pointsAfter - pointsBefore
          // need to write log
          await req.payload.create({
            collection: 'affiliate-rank-logs',
            data: {
              affiliateUser: affiliateUserId,
              eventAffiliateRank: doc.eventAffiliateRank,
              rankContext: 'user',
              pointsChange,
              pointsBefore,
              pointsAfter,
              rankBefore: affiliateUserRank?.currentRank,
              rankAfter: newRank?.rankName as AffiliateRank,
              actionType: AFFILIATE_ACTION_TYPE_LOG.event_completed.value,
              occurredAt: new Date().toISOString(),
              description: `Cập nhật điểm tích lũy, doanh thu, số vé bán được, hoa hồng nhận được, số vé thưởng có thể nhận được từ sự kiện sau khi event đã hoàn thành`,
            },
          })
        }
      },
    ],
  },
  indexes: [{ fields: ['eventAffiliateRank', 'affiliateUser'], unique: true }],
}
