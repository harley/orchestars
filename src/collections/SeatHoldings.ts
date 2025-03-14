import type { CollectionConfig } from 'payload'

export const SeatHoldings: CollectionConfig = {
  slug: 'seatHoldings',
  admin: {
    useAsTitle: 'seatName',
  },
  fields: [
    {
      name: 'seatName',
      type: 'text',
      required: true,
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
    },
    {
      name: 'userInfo',
      type: 'json',
      required: false,
    },
    {
      name: 'closedAt', // compatible if expire_time > now and closedAt == null
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
    {
      name: 'expire_time',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      required: false,
    },
    {
      name: 'userAgent',
      type: 'text',
      required: false,
    },
  ],
}
