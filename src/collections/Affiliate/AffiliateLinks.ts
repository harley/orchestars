import { generateCode } from '@/utilities/generateCode'
import type { CollectionConfig } from 'payload'

export const AffiliateLinks: CollectionConfig = {
  slug: 'affiliate-links',
  // admin: { useAsTitle: 'affiliateUser' },
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
      hidden: true,
      hooks: {
        beforeChange: [
          ({ value, operation }) => {
            if (operation === 'create') {
              return generateCode('AFF', { timestampLength: 9 })
            }

            return value
          },
        ],
      },
    },
    {
      name: 'affiliatePromotion',
      type: 'relationship',
      relationTo: 'promotions',
      required: false,
      index: true,
      admin: {
        description: 'Promotion filtered by event',
      },
      filterOptions: ({ data }) => {
        // if data.event is not defined, return empty promotion
        const eventId = data.event || -1

        return {
          event: {
            equals: eventId,
          },
          status: {
            equals: 'active',
          },
        }
      },
    },
    {
      name: 'promotionCode',
      type: 'text',
      required: false,
      index: true,
      access: {
        create: () => false,
      },
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          async ({ value, data, req }) => {
            if (data?.affiliatePromotion) {
              const promotion = await req.payload
                .findByID({
                  collection: 'promotions',
                  depth: 0,
                  id: data.affiliatePromotion,
                })
                .then((res) => res)
                .catch(() => null)

              return promotion?.code
            }

            return value
          },
        ],
      },
    },
    {
      name: 'utmParams',
      type: 'group',
      admin: { description: 'UTM parameters (auto or manual)' },
      fields: [
        {
          name: 'source',
          type: 'text',
          required: false,
          admin: {
            description: 'UTM Source (Optional)',
            placeholder: 'eg: facebook, google, newsletter,...',
          },
        },
        {
          name: 'medium',
          type: 'text',
          required: false,
          admin: {
            description: 'UTM Medium (Optional)',
            placeholder: 'eg: cpc, email, social,...',
          },
        },
        {
          name: 'campaign',
          type: 'text',
          required: false,
          admin: {
            description: 'UTM Campaign (Optional)',
            placeholder: 'eg: summer-promo, holiday-sale,...',
          },
        },
        {
          name: 'term',
          type: 'text',
          required: false,
          admin: {
            description: 'UTM Term (Optional)',
            placeholder: 'eg: classical music, orchestra,...',
          },
        },
        {
          name: 'content',
          type: 'text',
          required: false,
          admin: {
            description: 'UTM Content (Optional)',
            placeholder: 'eg: banner1, textlink2,...',
          },
        },
      ],
    },
    {
      name: 'targetLink',
      type: 'text',
      required: false,
      admin: {
        description: 'Target link for the affiliate',
        components: {
          Field: '@/components/AdminViews/Affiliate/Links/TargetLink#TargetLink',
        },
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
