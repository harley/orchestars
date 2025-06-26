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
      label: 'Tổng Doanh Thu (VND)',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Tổng doanh thu từ các đơn hàng của Affiliate User',
        readOnly: true,
        // disabled: true,
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
}
