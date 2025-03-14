import type { CollectionConfig } from 'payload'

export const Payments: CollectionConfig = {
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
      type: 'group',
      name: 'transaction',
      fields: [
        {
          type: 'text',
          name: 'code',
        },
      ],
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
      hooks: {
        afterChange: [
          async ({ value, originalDoc, req }) => {
            if (value === 'paid' && originalDoc.order) {
              try {
                await req.payload.update({
                  collection: 'orders',
                  id: originalDoc.order,
                  data: { status: 'completed' },
                })
              } catch (error) {
                console.error('Error updating order status:', error)
              }
            }
            return value
          },
        ],
      },
    },
    {
      name: 'paidAt',
      type: 'date',
      required: false,
    },
  ],
}
