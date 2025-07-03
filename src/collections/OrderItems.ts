import type { CollectionConfig } from 'payload'

export const OrderItems: CollectionConfig = {
  slug: 'orderItems',
  access: {
    create: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'ticketPriceId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'ticketPriceName',
      type: 'text',
      required: false,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'seat',
      type: 'text',
      required: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        readOnly: true,
      },
    },
  ],
}
