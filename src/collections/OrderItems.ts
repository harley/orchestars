import type { CollectionConfig } from 'payload'

export const OrderItems: CollectionConfig = {
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
