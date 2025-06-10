import type { CollectionConfig } from 'payload'

export const AffiliateClickLogs: CollectionConfig = {
  slug: 'affiliate-click-logs',
  // admin: { usesAsTitle: 'affiliateLink' },
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
      name: 'affiliateLink',
      type: 'relationship',
      relationTo: 'affiliate-links',
      required: true,
    },
    {
      name: 'ip',
      type: 'text',
      required: false,
    },
    {
      name: 'location',
      type: 'text',
      required: false,
    },
    {
      name: 'referrer',
      type: 'text',
      required: false,
    },
    {
      name: 'userAgent',
      type: 'text',
      required: false,
    },
    {
      name: 'moreInformation',
      type: 'json',
      required: false,
    },
  ],
};

