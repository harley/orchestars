import type { CollectionConfig } from 'payload'

export const AffiliateLinks: CollectionConfig = {
  slug: 'affiliate-links',
  admin: { useAsTitle: 'affiliateCode' },
  fields: [
    {
      name: 'affiliateUser',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      filterOptions: () => {
        return {
          role: {
            equals: 'affiliate',
          },
        }
      },
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: false,
    },
    {
      name: 'affiliateCode',
      type: 'text',
      unique: true,
      required: true,
    },
    {
      name: 'promotionCode',
      type: 'text',
      required: false,
      index: true,
    },
    {
      name: 'utmParams',
      type: 'json',
      admin: { description: 'UTM parameters (auto or manual)' },
      required: false,
    },
    {
      name: 'targetLink',
      type: 'text',
      required: false,
      admin: {
        description: 'Target link for the affiliate',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Disabled', value: 'disabled' },
      ],
      defaultValue: 'active',
    },
  ],
}
