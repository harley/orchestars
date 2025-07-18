import type { CollectionConfig } from 'payload'

export const CheckInRecords: CollectionConfig = {
  slug: 'checkinRecords',
  timestamps: true,
  access: {
    // read: () => true,
    // create: () => true,
    // update: () => true,
    // delete: () => true,
  },
  admin: {
    useAsTitle: 'ticketCode',
    defaultColumns: ['ticketCode', 'event', 'checkInTime', 'seat', 'eventDate'],
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
    },
    {
      name: 'seat',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'ticketCode',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'eventScheduleId',
      type: 'text',
      required: false,
      index: true,
    },
    {
      name: 'eventDate',
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
    {
      name: 'ticketGivenTime',
      type: 'text',
      required: false,
    },
    {
      name: 'ticketGivenBy',
      type: 'text',
      required: false,
    },
    {
      name: 'manual',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      admin: {
        description: 'True if this record was created from manual entry, false if via QR scan',
      },
    },
    {
      name: 'checkinMethod',
      type: 'select',
      required: true,
      defaultValue: 'qr',
      options: [
        {
          label: 'QR Code',
          value: 'qr',
        },
        {
          label: 'Paper',
          value: 'paper',
        },
        {
          label: 'Search',
          value: 'search',
        },
      ],
      admin: {
        description: 'Method used for check-in: QR scan, paper ticket entry, or search',
      },
    },
    {
      name: 'deletedAt',
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
  indexes: [
    { fields: ['ticketCode', 'seat'] },
    { fields: ['event', 'eventScheduleId'] },
    { fields: ['ticketCode', 'seat', 'eventScheduleId'] },
    { fields: ['ticketCode', 'eventScheduleId', 'event'] },
    { fields: ['ticketCode', 'seat', 'eventScheduleId', 'event'] },
  ],
}
