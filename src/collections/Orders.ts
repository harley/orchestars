import { Event } from '@/payload-types'
import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
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
      type: 'select',
      defaultValue: 'processing',
      options: [
        { label: 'Processing', value: 'processing' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      hooks: {
        afterChange: [
          async ({ value, originalDoc, req }) => {
            // When an order's status is updated to 'paid'
            console.log('value', value)
            console.log('originalDoc', originalDoc)
            if (value === 'completed' && originalDoc) {
              try {
                const orderItems = await req.payload
                  .find({
                    collection: 'orderItems',
                    where: { order: { equals: originalDoc.id } },
                  })
                  .then((res) => res.docs)

                if (!orderItems?.length) {
                  return
                }

                await Promise.all(
                  orderItems.map((oItem) =>
                    req.payload.update({
                      collection: 'tickets',
                      where: {
                        orderItem: { equals: oItem.id },
                        event: { equals: (oItem.event as Event).id },
                      },
                      data: {
                        status: 'booked',
                      },
                    }),
                  ),
                )
              } catch (error) {
                console.error('Error updating ticket status:', error)
              }
            }
            return value
          },
        ],
      },
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
}
