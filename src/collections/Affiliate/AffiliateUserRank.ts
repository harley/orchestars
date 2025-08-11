import type { CollectionConfig } from 'payload'
import { AFFILIATE_RANK, AFFILIATE_RANKS } from './constants'

export const AffiliateUserRanks: CollectionConfig = {
  slug: 'affiliate-user-ranks',
  admin: {
    useAsTitle: 'affiliateUser',
    description: 'Lưu trữ thông tin hạng tổng của Affiliate User',
    components: {
      beforeList: [
        '@/components/AdminViews/ManagementAffiliate/BackToManagementAffiliate#BackToManagementAffiliate',
      ],
    },
  },
  access: {},
  fields: [
    {
      name: 'affiliateUser',
      type: 'relationship',
      label: 'Affiliate User',
      relationTo: 'users',
      required: true,
      unique: true,
      filterOptions: () => {
        return {
          role: {
            equals: 'affiliate',
          },
        }
      },
      admin: {
        description: 'Chọn Affiliate User (chỉ hiển thị users có role là affiliate)',
      },
    },
    {
      name: 'currentRank',
      type: 'select',
      label: 'Hạng Hiện Tại',
      required: true,
      defaultValue: AFFILIATE_RANK.Tier1.value,
      options: AFFILIATE_RANKS,
      admin: {
        description: 'Hạng hiện tại của Affiliate User',
        readOnly: true,
        // disabled: true,
      },
    },
    {
      name: 'totalPoints',
      type: 'number',
      label: 'Tổng Điểm Tích Lũy',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng số điểm tích lũy (1 điểm = 1000 VND doanh thu)',
        readOnly: true,
        // disabled: true,
      },
    },
    {
      name: 'totalRevenue',
      type: 'number',
      label: 'Tổng Doanh Thu Trước Thuế (VND) (Chưa trừ VAT) (Đã tính giảm giá nếu có)',
      required: true,
      defaultValue: 0,
      admin: {
        description:
          'Tổng doanh thu từ các đơn hàng của Affiliate User. Sẽ tính phần thưởng dựa trên giá trị này',
        readOnly: true,
        // disabled: true,
      },
    },
    {
      name: 'totalRevenueBeforeTax',
      type: 'number',
      label: 'Tổng Tiền Trước Thuế (VND) (Chưa trừ VAT) (Đã tính giảm giá nếu có)',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng tiền trước khi trừ thuế VAT của Affiliate User',
        readOnly: true,
        // disabled: true,
      },
    },
    {
      name: 'totalRevenueAfterTax',
      type: 'number',
      label: 'Tổng Tiền Sau Thuế (VND) (Đã bao gồm VAT) (Đã tính giảm giá nếu có)',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng tiền từ các đơn hàng của Affiliate User.',
        readOnly: true,
        // disabled: true,
      },
    },
    {
      name: 'totalRevenueBeforeDiscount',
      type: 'number',
      label: 'Tổng Tiền Trước Giảm Giá (VND) (Đã bao gồm VAT)',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng tiền trước giảm giá từ các đơn hàng của Affiliate User',
        readOnly: true,
        // disabled: true,
      },
    },
    {
      name: 'totalTicketsSold',
      type: 'number',
      label: 'Tổng Số Vé Bán Được',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng số vé đã bán được trong tất cả các sự kiện',
        readOnly: true,
        // disabled: true,
      },
    },
    {
      name: 'totalCommissionEarned',
      type: 'number',
      label: 'Tổng Hoa Hồng Nhận Được (VND)',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng số tiền hoa hồng đã nhận được từ các sự kiện',
        readOnly: true,
        // disabled: true,
      },
    },
    {
      name: 'totalTicketsRewarded',
      type: 'number',
      label: 'Tổng Số Vé Thưởng',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng số vé thưởng đã nhận được từ các sự kiện',
        readOnly: true,
        // disabled: true,
      },
    },
    {
      name: 'rankAchievedDate',
      type: 'date',
      label: 'Ngày Đạt Hạng Hiện Tại',
      admin: {
        description: 'Ngày Affiliate User đạt được hạng hiện tại',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
        // disabled: true,
      },
    },
    {
      name: 'lastActivityDate',
      type: 'date',
      label: 'Ngày Hoạt Động Gần Nhất',
      admin: {
        description:
          'Thời điểm Affiliate User thực hiện hành động gần nhất (bán vé, tích điểm, nâng hạng, v.v.)',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
        // disabled: true,
      },
    },
    {
      name: 'pendingRankUpgrade',
      type: 'select',
      label: 'Hạng Chờ Xác Nhận',
      options: AFFILIATE_RANKS,
      admin: {
        description: 'Hạng mà Affiliate User đủ điều kiện nâng cấp nhưng chưa xác nhận',
        readOnly: true,
        // disabled: true,
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation != 'update') return
        // Fetch all affiliate ranks and sort by minimum points in ascending order
        const affiliateRanks = await req.payload
          .find({
            collection: 'affiliate-ranks',
            limit: AFFILIATE_RANKS.length,
            depth: 0,
            where: {
              rankName: { in: AFFILIATE_RANKS.map((rank) => rank.value) },
            },
          })
          .then((res) => res.docs.sort((a, b) => b.minPoints - a.minPoints))
        // Determine the highest eligible rank based on total points
        const currentPoints = doc.totalPoints || 0
        const highestEligibleRank = affiliateRanks.find((rank) => currentPoints >= rank.minPoints)
        // If highest eligible rank != current rank
        if (highestEligibleRank && highestEligibleRank.rankName !== doc.currentRank) {
          // update the affiliate user rank
          await req.payload.update({
            collection: 'affiliate-user-ranks',
            id: doc.id,
            data: {
              currentRank: highestEligibleRank.rankName,
            },
          })
          // // Find elegible event aff user ranks to be updated
          // const eligibleEvents = await req.payload
          //   .find({
          //     collection: 'event-affiliate-user-ranks',
          //     where: {
          //       affiliateUser: { equals: doc.affiliateUser },
          //       eventAffiliateRank: { not_equals: highestEligibleRank.rankName },
          //     },
          //   })
          //   .then((res) => res.docs)
          // // Send eligible events to notify-event-rank-upgrade endpoint to notify user
          // if (eligibleEvents.length > 0) {
          //   await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/notify-event-rank-upgrade`, {
          //     method: 'POST',
          //     headers: { 'Content-Type': 'application/json' },
          //     body: JSON.stringify({
          //       eligibleRank: highestEligibleRank.rankName,
          //       eligibleEvents: eligibleEvents.map((e) => ({
          //         eventId: e.id,
          //         oldRank: e.eventAffiliateRank,
          //       })),
          //     }),
          //   })
          // }
        }
      },
    ],
  },
}
