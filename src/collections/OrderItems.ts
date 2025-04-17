import type { CollectionConfig } from 'payload'

export const OrderItems: CollectionConfig = {
  slug: 'orderItems',
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      index: true,
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      index: true,
    },
    {
      name: 'ticketPriceId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'ticketPriceName',
      type: 'text',
      required: false,
      index: true,
    },
    {
      name: 'seat',
      type: 'text',
      required: false,
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
}
