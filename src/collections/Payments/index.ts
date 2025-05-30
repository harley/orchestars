import type { CollectionConfig } from 'payload'
import { afterChangeStatus } from './hooks/afterChangeStatus'
import { PAYMENT_STATUSES } from './constants'

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
      index: true,
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      index: true,
    },
    {
      name: 'paymentMethod',
      type: 'text',
      index: true,
    },
    {
      name: 'currency',
      type: 'text',
    },
    {
      name: 'promotion',
      type: 'relationship',
      relationTo: 'promotions',
      required: false,
      admin: {
        description: 'Legacy field for a single promotion. Use "promotionsApplied" instead.',
      },
    },
    {
      name: 'promotionCode',
      type: 'text',
      index: true,
      required: false,
      admin: {
        description: 'Legacy field for a single promotion. Use "promotionsApplied" instead.',
      },
    },
    {
      name: 'promotionsApplied',
      type: 'array',
      required: false,
      label: 'Applied Promotions',
      admin: {
        description: 'List of promotions applied to this order',
      },
      fields: [
        {
          name: 'promotion',
          type: 'relationship',
          relationTo: 'promotions',
          required: true,
          index: true,
        },
        {
          name: 'promotionCode',
          type: 'text',
          required: true,
          index: true,
        },
        {
          name: 'discountAmount',
          type: 'number',
          required: true,
          min: 0,
        },
      ],
    },
    {
      name: 'totalBeforeDiscount',
      type: 'number',
      required: false,
    },
    {
      name: 'totalDiscount',
      type: 'number',
      required: false,
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
      index: true,
      options: PAYMENT_STATUSES,
      hooks: {
        afterChange: [afterChangeStatus],
      },
    },
    {
      name: 'paidAt',
      type: 'date',
      required: false,
    },
    {
      name: 'expireAt', // payment will be expired in time
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
  ],
}
