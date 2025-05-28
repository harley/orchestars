import type { CollectionConfig } from 'payload'

export const MarketingTracking: CollectionConfig = {
  slug: 'marketingTrackings',
  admin: {
    useAsTitle: 'utmSource',
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'utmSource',
      type: 'text',
      index: true,
    },
    {
      name: 'utmMedium',
      type: 'text',
      index: true,
    },
    {
      name: 'utmCampaign',
      type: 'text',
      index: true,
    },
    {
      name: 'utmTerm',
      type: 'text',
    },
    {
      name: 'utmContent',
      type: 'text',
    },
    {
      name: 'conversionType',
      type: 'text',
      index: true,
    },
  ],
}
