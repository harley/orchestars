import type { CollectionConfig } from 'payload'
// import { afterChangeStatus } from './hooks/afterChangeStatus'

export const UserPromotionRedemptions: CollectionConfig = {
  slug: 'userPromotionRedemptions',
  fields: [
    {
      name: 'promotion',
      type: 'relationship',
      relationTo: 'promotions',
      required: true,
    },
    {
      name: 'payment',
      type: 'relationship',
      relationTo: 'payments',
      required: true,
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: false,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'redeemAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
    {
      name: 'expireAt', // the time if user not redeem the promotion, this user promotion will uncompatible
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Pending', // user has been processing the order for payment
          value: 'pending',
        },
        {
          label: 'Used', // user has been succeed the payment
          value: 'used',
        },
        {
          label: 'Cancelled', // user canceled order or the payment is expire
          value: 'cancelled',
        },
      ],
      required: false,
    },
  ],
}
