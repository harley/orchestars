import type { CollectionConfig } from 'payload'
import { AFFILIATE_RANKS } from './constants'

export const AffiliateUserProfiles: CollectionConfig = {
  slug: 'affiliate-user-profiles',
  admin: {
    useAsTitle: 'affiliateUser',
    description: 'Lưu trữ thông tin hạng tổng của Affiliate User',
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
      defaultValue: 'seller',
      options: AFFILIATE_RANKS,
      admin: {
        description: 'Hạng hiện tại của Affiliate User',
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
      name: 'totalTicketsSold',
      type: 'number',
      label: 'Tổng Số Vé Bán Được',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng số vé đã bán được trong tất cả các sự kiện',
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
      },
    },
    {
      name: 'rankAchievedDate',
      type: 'date',
      label: 'Ngày Đạt Hạng Hiện Tại',
      admin: {
        description: 'Ngày Affiliate User đạt được hạng hiện tại',
      },
    },
    {
      name: 'lastActivityDate',
      type: 'date',
      label: 'Ngày Hoạt Động Gần Nhất',
      admin: {
        description:
          'Thời điểm Affiliate User thực hiện hành động gần nhất (bán vé, tích điểm, nâng hạng, v.v.)',
      },
    },
  ],
}
