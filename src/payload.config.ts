// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
// import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { seoPlugin } from '@payloadcms/plugin-seo'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Partners } from './collections/Partners'
import { AppInformation } from './collections/AppInformation'
import { Performers } from './collections/Performers'
import { FAQs } from './collections/FAQ'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    {
      slug: 'seatingCharts',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'chartMap',
          type: 'json',
          required: true,
        },
        {
          name: 'event',
          type: 'relationship',
          relationTo: 'events',
          required: false,
        },
      ],
    },
    {
      slug: 'events',
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
          name: 'keyword',
          type: 'text',
        },
        {
          name: 'startDatetime',
          type: 'date',
        },
        {
          name: 'endDatetime',
          type: 'date',
        },
        {
          type: 'array',
          name: 'schedules',
          fields: [
            {
              type: 'text',
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
      ],
    },
    {
      slug: 'orders',
      admin: {
        useAsTitle: 'orderCode',
      },
      fields: [
        {
          name: 'orderCode',
          type: 'text',
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'status',
          type: 'text',
          // options: [
          //   { label: 'Processing', value: 'processing' },
          //   { label: 'Canceled', value: 'canceled' },
          //   { label: 'Completed', value: 'completed' },
          //   { label: 'Failed', value: 'failed' },
          // ],
        },
        {
          name: 'total',
          type: 'number',
        },
        {
          name: 'currency',
          type: 'text',
        },
      ],
    },
    {
      slug: 'orderItems',
      fields: [
        {
          name: 'order',
          type: 'relationship',
          relationTo: 'orders',
          required: true,
        },
        {
          name: 'event',
          type: 'relationship',
          relationTo: 'events',
          required: true,
        },
        {
          name: 'ticketPriceId',
          type: 'text',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
        },
      ],
    },
    {
      slug: 'payments',
      admin: {
        useAsTitle: 'total',
      },
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'order',
          type: 'relationship',
          relationTo: 'orders',
          required: true,
        },
        {
          name: 'paymentMethod',
          type: 'text',
        },
        {
          name: 'currency',
          type: 'text',
        },
        {
          name: 'total',
          type: 'number',
          required: true,
        },
        {
          name: 'appTransId',
          type: 'text',
        },
        {
          name: 'paymentData',
          type: 'json',
          // jsonSchema: {
          //   fileMatch: [''],
          //   uri: '',
          //   schema: {
          //     type: 'object',
          //     properties: {
          //       app_trans_id: { type: 'string' },
          //       app_id: { type: 'string' },
          //       app_time: { type: 'number' },
          //       app_user: { type: 'string' },
          //       channel: { type: 'string' },
          //       discount_amount: { type: 'number' },
          //       embed_data: { type: 'string' },
          //       item: { type: 'string' },
          //       merchant_user_id: { type: 'string' },
          //       server_time: { type: 'number' },
          //       user_fee_amount: { type: 'number' },
          //       zp_trans_id: { type: 'string' },
          //       zp_user_id: { type: 'string' },
          //       amount: { type: 'number' },
          //     },
          //     additionalProperties: true,
          //   },
          // },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          options: [
            { label: 'Processing', value: 'processing' },
            { label: 'Canceled', value: 'canceled' },
            { label: 'Paid', value: 'paid' },
            { label: 'Failed', value: 'failed' },
          ],
        },
        {
          name: 'paidAt',
          type: 'date',
          required: false,
        },
      ],
    },
    {
      slug: 'tickets',
      fields: [
        {
          name: 'attendeeName',
          type: 'text',
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'ticketCode',
          type: 'text',
        },
        {
          name: 'ticketPriceInfo',
          type: 'json',
        },
        {
          name: 'event',
          type: 'relationship',
          relationTo: 'events',
        },
        {
          name: 'orderItem',
          type: 'relationship',
          relationTo: 'orderItems',
        },
        {
          name: 'orderStatus',
          type: 'text',
          hooks: {
            beforeChange: [
              async ({ data, req }) => {
                if (!data?.order) return null
                const order = await req.payload.findByID({
                  collection: 'orders',
                  id: data.order,
                })
                return order.status
              },
            ],
          },
        },
      ],
    },
    AppInformation,
    Partners,
    Performers,
    FAQs,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    // payloadCloudPlugin(),
    // storage-adapter-placeholder
    vercelBlobStorage({
      enabled: true, // Optional, defaults to true
      // Specify which collections should use Vercel Blob
      collections: {
        media: true,
        // 'media-with-prefix': {
        //   prefix: 'my-prefix',
        // },
      },
      // Token provided by Vercel once Blob storage is added to your Vercel project
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
    seoPlugin({
      collections: ['events'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `orchestars.com — ${doc.title}`,
      generateImage: ({ doc }) => doc?.featuredImage,
      generateDescription: ({ doc }) => doc.plaintext,
    })
  ],

})
