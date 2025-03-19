import { Banner } from '@/blocks/Banner/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import {
  BlocksFeature,
  lexicalEditor,
  LinkFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import { revalidateTag } from 'next/cache'
import type { CollectionConfig } from 'payload'
import { EVENT_STATUSES } from './constants/status'

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'slug',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'detailDescription',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          LinkFeature({
            // Example showing how to customize the built-in fields
            // of the Link feature
            fields: ({ defaultFields }) => [
              ...defaultFields,
              {
                name: 'rel',
                label: 'Rel Attribute',
                type: 'select',
                hasMany: true,
                options: ['noopener', 'noreferrer', 'nofollow'],
                admin: {
                  description:
                    'The rel attribute defines the relationship between a linked resource and the current document. This is a custom link field.',
                },
              },
            ],
          }),
          UploadFeature({
            collections: {
              uploads: {
                // Example showing how to customize the built-in fields
                // of the Upload feature
                fields: [
                  {
                    name: 'caption',
                    type: 'richText',
                    editor: lexicalEditor(),
                  },
                ],
              },
            },
          }),
          // This is incredibly powerful. You can re-use your Payload blocks
          // directly in the Lexical editor as follows:
          BlocksFeature({
            blocks: [Banner, CallToAction],
          }),
        ],
      }),
    },
    {
      name: 'keyword',
      type: 'text',
    },
    {
      name: 'startDatetime',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
    {
      name: 'endDatetime',
      type: 'date',
      // timezone: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
    {
      type: 'array',
      name: 'schedules',
      fields: [
        {
          type: 'date',
          name: 'date',
        },
        {
          type: 'array',
          name: 'details',
          fields: [
            {
              type: 'text',
              name: 'time',
            },
            {
              type: 'text',
              name: 'name',
            },
            {
              type: 'text',
              name: 'description',
            },
          ],
        },
      ],
    },
    {
      name: 'showAfterExpiration',
      type: 'checkbox',
    },
    {
      name: 'showTicketsAutomatically',
      type: 'checkbox',
    },
    {
      name: 'eventLocation',
      type: 'text',
    },
    {
      name: 'eventTermsAndConditions',
      type: 'textarea',
    },
    {
      type: 'array',
      name: 'ticketPrices',
      fields: [
        {
          type: 'text',
          name: 'name',
        },
        {
          type: 'select',
          name: 'key',
          admin: {
            description: 'Giá trị giảm dần theo khu vực, với Zone 1 là vé đắt nhất.',
          },
          options: [
            { label: 'Zone 1', value: 'zone1' },
            { label: 'Zone 2', value: 'zone2' },
            { label: 'Zone 3', value: 'zone3' },
            { label: 'Zone 4', value: 'zone4' },
            { label: 'Zone 5', value: 'zone5' },
          ],
        },
        {
          type: 'number',
          min: 0,
          name: 'price',
        },
        {
          type: 'text',
          name: 'currency',
          defaultValue: 'VND',
        },
      ],
    },
    {
      name: 'eventLogo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'eventBanner',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'eventThumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'sponsorLogo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'ticketQuantityLimitation',
      type: 'radio',
      options: [
        {
          label: 'Per Ticket Type',
          value: 'perTicketType',
        },
        {
          label: 'Per Event',
          value: 'perEvent',
        },
      ],
    },
    {
      name: 'configuration',
      type: 'group',
      fields: [
        {
          name: 'showBannerTitle',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'showBannerTime',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'showBannerLocation',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: false,
      options: EVENT_STATUSES,
    },
  ],
  hooks: {
    afterChange: [
      () => {
        // revalidate home data on client side
        revalidateTag('home-events')
        revalidateTag('event-detail')
      },
    ],
  },
}
