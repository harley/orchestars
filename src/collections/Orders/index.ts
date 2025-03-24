import type { CollectionConfig } from 'payload'
import { afterChangeStatus } from './hooks/afterChangeStatus'
import { ORDER_STATUSES } from './constants'

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
      options: ORDER_STATUSES,
      hooks: {
        afterChange: [afterChangeStatus],
      },
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
    },
    {
      name: 'promotionCode',
      type: 'text',
      required: false,
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
    },
    {
      name: 'customerData',
      type: 'json',
    },
    {
      name: 'expireAt', // order will be expired in time
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
