import type { CollectionConfig } from 'payload'

export const CheckInRecords: CollectionConfig = {
  slug: 'checkinRecords',
  timestamps: true,
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'ticketCode',
    defaultColumns: ['ticketCode', 'event', 'checkInTime'],
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'ticket',
      type: 'relationship',
      relationTo: 'tickets',
      required: true,
      unique: true,
    },
    {
      name: 'ticketCode',
      type: 'text',
      required: true,
    },
    {
      name: 'eventScheduleId',
      type: 'text',
      required: false,
    },
    {
      name: 'checkInTime',
      type: 'date',
      required: false,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
    {
      name: 'checkedInBy',
      type: 'relationship',
      relationTo: 'admins',
      required: false,
    },
    { name:'deletedAt',
      type: 'date',
      required: false,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
  ],
}
