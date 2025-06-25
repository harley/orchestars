import type { CollectionConfig } from 'payload'
import { AFFILIATE_RANK, AFFILIATE_RANKS } from './constants'

export const AffiliateRanks: CollectionConfig = {
  slug: 'affiliate-ranks',
  admin: {
    useAsTitle: 'rankName',
    description: 'Cấu hình các hạng của Affiliate Seller',
    components: {
      beforeList: ['@/components/AdminViews/ManagementAffiliate/BackToManagementAffiliate#BackToManagementAffiliate'],
    }
  },

  fields: [
    {
      name: 'rankName',
      type: 'select',
      label: 'Tên Hạng',
      required: true,
      options: AFFILIATE_RANKS,
      unique: true,
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description',
      required: false,
    },
    {
      name: 'minPoints',
      type: 'number',
      label: 'Điểm Tích Lũy Tối Thiểu',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Số điểm tối thiểu để đạt hạng này (1 điểm = 1000 VND doanh thu)',
      },
    },
    {
      name: 'rewards',
      type: 'group',
      label: 'Cấu Hình Thưởng',
      fields: [
        {
          name: 'ticketRewards',
          type: 'array',
          label: 'Thưởng Vé (Dành cho Fan)',
          admin: {
            condition: (data) => [AFFILIATE_RANK.Tier2.value].includes(data.rankName),
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
            },
            // {
            //   name: 'ticketOptions',
            //   type: 'relationship',
            //   label: 'Danh Sách Vé Thưởng',
            //   relationTo: 'tickets',
            //   hasMany: true,
            //   admin: {
            //     description: 'Chọn các vé có thể thưởng cho affiliate',
            //   },
            // },
            // {
            //   name: 'cashEquivalent',
            //   type: 'number',
            //   label: 'Quy Đổi Tiền Mặt (VND)',
            //   required: false,
            //   admin: {
            //     description: 'Giá trị tiền mặt thay thế nếu không nhận vé',
            //   },
            // },
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
            },
          ],
        },
      ],
    },
  ],
}
