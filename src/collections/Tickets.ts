import type { CollectionConfig } from 'payload'

export const Tickets: CollectionConfig = {
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
}
