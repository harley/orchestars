import type { CollectionConfig } from 'payload'
import { AFFILIATE_RANK, AFFILIATE_RANK_STATUSES, AFFILIATE_RANKS } from './constants'
import { rankNameLabel } from './fields/rankNameLabel'
/**
 * Collection configuration for Event Affiliate Ranks in PayloadCMS
 */
export const EventAffiliateRanks: CollectionConfig = {
  slug: 'event-affiliate-ranks',
  admin: {
    useAsTitle: 'rankNameLabel',
    defaultColumns: ['event', 'rankName', 'eventRewards', 'status'],
    description: 'Cấu hình hạng của Affiliate Seller trong từng event cụ thể',
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
      name: 'rankName',
      type: 'select',
      label: 'Tên Hạng',
      required: true,
      options: AFFILIATE_RANKS,
      admin: {
        description: 'Hạng được gán cho Affiliate User trong event',
      },
    },
    rankNameLabel,
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
      name: 'eventRewards',
      type: 'group',
      label: 'Cấu Hình Thưởng Trong Event',
      fields: [
        {
          name: 'ticketRewards',
          type: 'array',
          label: 'Thưởng Vé (Dành cho Fan trong Event)',
          admin: {
            condition: (data) => [AFFILIATE_RANK.Tier2.value].includes(data.rankName),
          },
          fields: [
            {
              name: 'minTickets',
              type: 'number',
              label: 'Số Vé Bán Tối Thiểu',
              required: false,
              hidden: true,
            },
            {
              name: 'maxTickets',
              type: 'number',
              label: 'Số Vé Bán Tối Đa',
              required: false,
              hidden: true,
            },
            {
              name: 'minRevenue',
              type: 'number',
              label: 'Doanh Thu Tối Thiểu (VND)',
              required: true,
              min: 0,
            },
            {
              name: 'maxRevenue',
              type: 'number',
              label: 'Doanh Thu Tối Đa (VND)',
              required: false,
              min: 0,
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
              [AFFILIATE_RANK.Tier3.value, AFFILIATE_RANK.Tier4.value].includes(data.rankName),
          },
          fields: [
            {
              name: 'minTickets',
              type: 'number',
              label: 'Số Vé Bán Tối Thiểu',
              required: false,
              hidden: true,
            },
            {
              name: 'maxTickets',
              type: 'number',
              label: 'Số Vé Bán Tối Đa',
              required: false,
              hidden: true,
            },
            {
              name: 'minRevenue',
              type: 'number',
              label: 'Doanh Thu Tối Thiểu (VND)',
              required: true,
              min: 0,
            },
            {
              name: 'maxRevenue',
              type: 'number',
              label: 'Doanh Thu Tối Đa (VND)',
              required: false,
              min: 0,
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
}
