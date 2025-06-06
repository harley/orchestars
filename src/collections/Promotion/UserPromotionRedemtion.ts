import type { CollectionConfig } from 'payload'
import {
  USER_PROMOTION_REDEMPTION_STATUS,
  USER_PROMOTION_REDEMPTION_STATUSES,
} from './constants/status'
import { updateTotalUsedPromotionAfterChangeStatus } from './hooks/updateTotalUsedPromotion'
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
      options: USER_PROMOTION_REDEMPTION_STATUSES,
      required: true,
      defaultValue: USER_PROMOTION_REDEMPTION_STATUS.pending.value,
      hooks: {
        afterChange: [updateTotalUsedPromotionAfterChangeStatus],
      },
    },
  ],
}
