import type { CollectionConfig } from 'payload'

export const AffiliateClickLogs: CollectionConfig = {
  slug: 'affiliate-click-logs',
  admin: {
    useAsTitle: 'id',
    description: 'Track affiliate link clicks and user interactions'
  },
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
      name: 'sessionId',
      type: 'text',
      required: false,
      index: true,
      admin: {
        description: 'Unique session identifier to prevent duplicate tracking'
      }
    },
    {
      name: 'ip',
      type: 'text',
      required: false,
      admin: {
        description: 'Client IP address'
      }
    },
    {
      name: 'location',
      type: 'text',
      required: false,
      admin: {
        description: 'Geographic location (if available)'
      }
    },
    {
      name: 'referrer',
      type: 'text',
      required: false,
      admin: {
        description: 'HTTP referrer header'
      }
    },
    {
      name: 'userAgent',
      type: 'text',
      required: false,
      admin: {
        description: 'Browser user agent string'
      }
    },
    {
      name: 'moreInformation',
      type: 'json',
      required: false,
      admin: {
        description: 'Additional tracking data including device info, promo codes, etc.'
      }
    },
  ],
};

