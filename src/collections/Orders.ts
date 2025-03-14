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
      type: 'text',
      // options: [
      //   { label: 'Processing', value: 'processing' },
      //   { label: 'Canceled', value: 'canceled' },
      //   { label: 'Completed', value: 'completed' },
      //   { label: 'Failed', value: 'failed' },
      // ],
      hooks: {
        afterChange: [
          async ({ value, originalDoc, req }) => {
            // When an order's status is updated to 'paid'
            if (value === 'paid' && originalDoc.orderCode) {
              try {
                // Find orderItems matching the orderCode
                const { docs: orderItems } = await req.payload.find({
                  collection: 'orderItems',
                  where: {
                    orderCode: {
                      equals: originalDoc.orderCode,
                    },
                  },
                });

                if (orderItems.length > 0) {
                  // For each orderItem, find the related ticket(s)
                  for (const orderItem of orderItems) {
                    const { docs: tickets } = await req.payload.find({
                      collection: 'tickets',
                      where: {
                        orderItem: { equals: orderItem.id },
                      },
                    });
                    // For each ticket, update its status to 'booked'
                    for (const ticket of tickets) {
                      await req.payload.update({
                        collection: 'tickets',
                        id: ticket.id,
                        data: { status: 'booked' },
                      });
                    }
                  }
                } else {
                  console.warn(`No orderItems found for orderCode: ${originalDoc.orderCode}`);
                }
              } catch (error) {
                console.error('Error updating ticket status:', error);
              }
            }
            return value;
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
