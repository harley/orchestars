import type { CollectionConfig } from 'payload'
import { afterChangeStatus } from './hooks/afterChangeStatus'
import { PAYMENT_STATUSES } from './constants'

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'total',
  },
  access: {
    create: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
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
      name: 'paymentMethod',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'currency',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'promotion',
      type: 'relationship',
      relationTo: 'promotions',
      required: false,
      admin: {
        description: 'Legacy field for a single promotion. Use "promotionsApplied" instead.',
      },
      hidden: true,
    },
    {
      name: 'promotionCode',
      type: 'text',
      index: true,
      required: false,
      admin: {
        description: 'Legacy field for a single promotion. Use "promotionsApplied" instead.',
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async ({  data }) => {
            if (data?.promotionsApplied?.length) {
              return data.promotionsApplied
                .map((promo: any) => promo.promotionCode)
                .filter((exist: string) => !!exist)
                .join(', ')
            }

            return data?.promotionCode
          },
        ],
      },
    },
    {
      name: 'promotionsApplied',
      type: 'array',
      required: false,
      label: 'Applied Promotions',
      admin: {
        description: 'List of promotions applied to this order',
        readOnly: true,
      },
      fields: [
        {
          name: 'promotion',
          type: 'relationship',
          relationTo: 'promotions',
          required: true,
          index: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'promotionCode',
          type: 'text',
          required: true,
          index: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'discountAmount',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'totalBeforeDiscount',
      type: 'number',
      required: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'totalDiscount',
      type: 'number',
      required: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'appTransId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'paymentData',
      type: 'json',
      admin: {
        readOnly: true,
      },
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
          admin: {
            readOnly: true,
          },
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
        readOnly: true,
      },
    },
  ],
}
