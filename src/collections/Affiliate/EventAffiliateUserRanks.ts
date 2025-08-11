import { APIError, type CollectionConfig } from 'payload'
import { AFFILIATE_RANK_STATUS, EVENT_AFFILIATE_RANK_STATUSES } from './constants'

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
      name: 'eventAffiliateRank',
      type: 'relationship',
      label: 'Event Affiliate Rank',
      relationTo: 'event-affiliate-ranks',
      required: true,
      admin: {
        description:
          'Hạng được gán cho Affiliate Seller trong sự kiện này (ví dụ: Fan, Ambassador)',
      },
      filterOptions: ({ data }) => {
        const eventId = data.event || -1

        return {
          status: {
            equals: AFFILIATE_RANK_STATUS.active.value,
          },
          event: {
            equals: eventId,
          },
        }
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
      options: EVENT_AFFILIATE_RANK_STATUSES,
      admin: {
        description:
          'Trạng thái của hạng trong event: Draft (bản nháp), Active (hoạt động), Disabled (vô hiệu hóa), Completed (Đã hoàn thành)',
      },
    },
    {
      name: 'isLocked',
      type: 'checkbox',
      label: 'Khóa Hạng',
      defaultValue: true,
      admin: {
        description: 'Khi khóa, hạng này sẽ không thay đổi trong suốt event',
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
        description:
          'Tổng số điểm tích lũy (1 điểm = 1000 VND doanh thu) của Affiliate User trong event này',
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
        description: 'Tổng số vé đã bán được trong tất cả sự kiện',
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
        description: 'Tổng số tiền hoa hồng có thể nhận được từ sự kiện',
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
        description: 'Tổng số vé thưởng có thể nhận được từ sự kiện',
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
          'Thời điểm Affiliate User thực hiện hành động gần nhất (bán vé, tích điểm, v.v.) trong event này',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        readOnly: true,
        // disabled: true,
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc }) => {
        // Đảm bảo hạng không thay đổi nếu đã khóa
        if (originalDoc?.isLocked && data?.eventAffiliateRank !== originalDoc.eventAffiliateRank) {
          throw new APIError(
            'Hạng đã bị khóa và không thể thay đổi trong suốt event.',
            400,
            {},
            true,
          )
        }

        return data
      },
    ],
  },
  indexes: [{ fields: ['eventAffiliateRank', 'affiliateUser'], unique: true }],
}
