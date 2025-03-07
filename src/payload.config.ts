// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

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
          name: 'eventLogo',
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
        },
        {
          name: 'total',
          type: 'number',
        },
        {
          name: 'paymentType',
          type: 'text',
        },
        {
          name: 'paidAt',
          type: 'date',
        },
      ],
    },
    {
      slug: 'orderItems',
      admin: {
        useAsTitle: 'ticketType',
      },
      fields: [
        {
          name: 'order',
          type: 'relationship',
          relationTo: 'orders',
          required: true,
        },
        {
          name: 'ticketType',
          type: 'text',
          required: false,
        },
        {
          name: 'ticket',
          type: 'relationship',
          relationTo: 'tickets',
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
          name: 'total',
          type: 'number',
          required: true,
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
          name: 'ticketCode',
          type: 'text',
        },
        {
          name: 'ticketType',
          type: 'text',
        },
        {
          name: 'event',
          type: 'relationship',
          relationTo: 'events',
        },
        {
          name: 'order',
          type: 'relationship',
          relationTo: 'orders',
        },
        {
          name: 'orderStatus',
          type: 'text',
          hooks: {
            beforeChange: [
              async ({ data, findByID }) => {
                const order = await findByID({ collection: 'orders', id: data.orderId })
                return order.status
              },
            ],
          },
        },
      ],
    },
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
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
