import type { CollectionConfig } from 'payload'
import { AFFILIATE_RANK_STATUS, AFFILIATE_RANK_STATUSES } from './constants'

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
        description: 'Hạng được gán cho Affiliate Seller trong sự kiện này (ví dụ: Fan, Ambassador)',
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
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // Đảm bảo hạng không thay đổi nếu đã khóa
        if (originalDoc?.isLocked && data.eventAffiliateRank !== originalDoc.eventAffiliateRank) {
          throw new Error('Hạng đã bị khóa và không thể thay đổi trong suốt event.')
        }
        return data
      },
    ],
  },
  indexes: [
    { fields: ['eventAffiliateRank', 'affiliateUser'], unique: true },
  ],
}
