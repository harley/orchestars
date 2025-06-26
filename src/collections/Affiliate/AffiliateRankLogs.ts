import type { CollectionConfig } from 'payload'
import { AFFILIATE_RANKS } from './constants'
import { AFFILIATE_ACTION_TYPE_LOGS } from './constants/actionTypeLog'

export const AffiliateRankLogs: CollectionConfig = {
  slug: 'affiliate-rank-logs',
  admin: {
    useAsTitle: 'affiliateUser',
    description: 'Lưu trữ lịch sử các thay đổi điểm và hạng của Affiliate User',
    components: {
      beforeList: ['@/components/AdminViews/ManagementAffiliate/BackToManagementAffiliate#BackToManagementAffiliate'],
    },
  },
  fields: [
    {
      name: 'affiliateUser',
      type: 'relationship',
      label: 'Affiliate User',
      relationTo: 'users',
      required: true,
      filterOptions: () => {
        return {
          role: {
            equals: 'affiliate',
          },
        }
      },
      admin: {
        description: 'Affiliate User liên quan đến log này',
      },
    },
    {
      name: 'rankContext',
      type: 'select',
      label: 'Ngữ Cảnh Hạng',
      required: true,
      defaultValue: 'user',
      options: [
        { value: 'user', label: 'Rank Tổng (Affiliate User)' },
        { value: 'event', label: 'Rank Theo Event' },
      ],
      admin: {
        description: 'Xác định log này liên quan đến hạng tổng hay hạng theo sự kiện',
      },
    },
    {
      name: 'actionType',
      type: 'select',
      label: 'Loại Hành Động',
      required: true,
      options: AFFILIATE_ACTION_TYPE_LOGS,
      admin: {
        description: 'Loại hành động liên quan đến điểm hoặc hạng',
      },
    },
    {
      name: 'pointsChange',
      type: 'number',
      label: 'Thay Đổi Điểm',
      defaultValue: 0,
      admin: {
        description: 'Số điểm thay đổi (dương hoặc âm, 0 nếu không thay đổi điểm)',
      },
    },
    {
      name: 'pointsBefore',
      type: 'number',
      label: 'Điểm Trước Khi Thay Đổi',
      admin: {
        description: 'Số điểm của Affiliate User trước khi sự kiện xảy ra',
      },
    },
    {
      name: 'pointsAfter',
      type: 'number',
      label: 'Điểm Sau Khi Thay Đổi',
      admin: {
        description: 'Số điểm của Affiliate User sau khi sự kiện xảy ra',
      },
    },
    {
      name: 'rankBefore',
      type: 'select',
      label: 'Hạng Trước',
      options: AFFILIATE_RANKS,
      admin: {
        description: 'Hạng trước khi sự kiện xảy ra (nếu có, áp dụng cho rank tổng)',
      },
    },
    {
      name: 'rankAfter',
      type: 'select',
      label: 'Hạng Sau',
      options: AFFILIATE_RANKS,
      admin: {
        description: 'Hạng sau khi sự kiện xảy ra (nếu có, áp dụng cho rank tổng)',
      },
    },
    {
      name: 'eventAffiliateRank',
      type: 'relationship',
      label: 'Hạng Theo Event',
      relationTo: 'event-affiliate-ranks',
      admin: {
        description: 'Hạng trong event nếu log liên quan đến EventAffiliateUserRanks',
        condition: (data) => data.rankContext === 'event',
      },
    },
    {
      name: 'description',
      type: 'text',
      label: 'Mô Tả',
      admin: {
        description: 'Mô tả chi tiết về sự kiện (ví dụ: lý do thay đổi điểm hoặc hạng)',
      },
    },
    {
      name: 'occurredAt',
      type: 'date',
      label: 'Thời Điểm Xảy Ra',
      required: true,
      admin: {
        description: 'Thời gian xảy ra hành động.',
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'event',
      type: 'relationship',
      label: 'Sự Kiện Liên Quan',
      relationTo: 'events',
      admin: {
        description: 'Sự kiện liên quan đến thay đổi này (nếu có)',
      },
    },
    {
      name: 'order',
      type: 'relationship',
      label: 'Đơn Hàng Liên Quan',
      relationTo: 'orders',
      admin: {
        description: 'Đơn hàng liên quan đến thay đổi này (nếu có)',
      },
    },
    {
      name: 'adminUser',
      type: 'relationship',
      label: 'Admin Thực Hiện',
      relationTo: 'admins',
      filterOptions: () => {
        return {
          role: {
            equals: 'admin',
            or: ['super-admin', 'admin'],
          },
        }
      },
      admin: {
        description: 'Admin thực hiện hành động này (nếu có)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Tính pointsAfter nếu có thay đổi điểm
        if (data.pointsBefore !== undefined && data.pointsChange !== undefined) {
          data.pointsAfter = (data.pointsBefore || 0) + (data.pointsChange || 0);
        }
        // Đảm bảo rankContext được gán
        if (!data.rankContext) {
          data.rankContext = 'user'; // Mặc định là rank tổng
        }
        // Nếu là rank event, kiểm tra eventAffiliateRank
        if (data.rankContext === 'event' && !data.event && !data.eventAffiliateRank) {
          throw new Error('Log cho rank event phải có sự kiện hoặc hạng event liên quan');
        }
        return data;
      },
    ],
  },
}