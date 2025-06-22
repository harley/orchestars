import type { CollectionConfig } from 'payload'
import { AFFILIATE_RANK, AFFILIATE_RANK_STATUSES, AFFILIATE_RANKS } from './constants'
/**
 * Collection configuration for Event Affiliate Ranks in PayloadCMS
 */
export const EventAffiliateRanks: CollectionConfig = {
  slug: 'event-affiliate-ranks',
  admin: {
    useAsTitle: 'event',
    description: 'Quản lý hạng của Affiliate Seller trong từng event cụ thể',
    components: {
      beforeList: ['@/components/AdminViews/ManagementAffiliate/BackToManagementAffiliate#BackToManagementAffiliate'],
    }
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
        description: 'Chọn Affiliate User (chỉ hiển thị users có role là affiliate)',
      },
    },
    {
      name: 'rankName',
      type: 'select',
      label: 'Tên Hạng',
      required: true,
      options: AFFILIATE_RANKS,
      admin: {
        description: 'Hạng được gán cho Affiliate User trong event',
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
      name: 'eventRewards',
      type: 'group',
      label: 'Cấu Hình Thưởng Trong Event',
      fields: [
        {
          name: 'ticketRewards',
          type: 'array',
          label: 'Thưởng Vé (Dành cho Fan trong Event)',
          admin: {
            condition: (data) => data.rankName === 'fan',
          },
          fields: [
            {
              name: 'minTickets',
              type: 'number',
              label: 'Số Vé Bán Tối Thiểu',
              required: true,
            },
            {
              name: 'maxTickets',
              type: 'number',
              label: 'Số Vé Bán Tối Đa',
              required: false,
            },
            {
              name: 'minRevenue',
              type: 'number',
              label: 'Doanh Thu Tối Thiểu (VND)',
              required: true,
            },
            {
              name: 'maxRevenue',
              type: 'number',
              label: 'Doanh Thu Tối Đa (VND)',
              required: false,
            },
            {
              name: 'rewardTickets',
              type: 'number',
              label: 'Số Vé Thưởng',
              required: true,
              defaultValue: 0,
            },
          ],
        },
        {
          name: 'commissionRewards',
          type: 'array',
          label: 'Thưởng Hoa Hồng dành cho hạng đã chọn',
          admin: {
            condition: (data) =>
              [AFFILIATE_RANK.ambassador.value, AFFILIATE_RANK.patron.value].includes(
                data.rankName,
              ),
          },
          fields: [
            {
              name: 'minTickets',
              type: 'number',
              label: 'Số Vé Bán Tối Thiểu',
              required: true,
            },
            {
              name: 'maxTickets',
              type: 'number',
              label: 'Số Vé Bán Tối Đa',
              required: false,
            },
            {
              name: 'minRevenue',
              type: 'number',
              label: 'Doanh Thu Tối Thiểu (VND)',
              required: true,
            },
            {
              name: 'maxRevenue',
              type: 'number',
              label: 'Doanh Thu Tối Đa (VND)',
              required: false,
            },
            {
              name: 'commissionRate',
              type: 'number',
              label: 'Phần Trăm Hoa Hồng (%)',
              required: true,
              min: 0,
              max: 100,
              defaultValue: 0,
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // Đảm bảo hạng không thay đổi nếu đã khóa
        if (originalDoc?.isLocked && data.rankName !== originalDoc.rankName) {
          throw new Error('Hạng đã bị khóa và không thể thay đổi trong suốt event.')
        }
        return data
      },
    ],
  },
}
