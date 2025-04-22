import type { CollectionConfig } from 'payload'

export const Logs: CollectionConfig = {
  slug: 'logs',
  access: {
    // read: () => true,
  },
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'description', 'timestamp', 'status', 'user', 'order', 'payment'],
  },
  fields: [
    {
      name: 'action',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'description',
      type: 'text',
      required: false,
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm:ss a',
        },
      },
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
        { label: 'Warning', value: 'warning' },
        { label: 'Info', value: 'info' },
      ],
      defaultValue: 'info',
      index: true,
    },
    {
      name: 'data',
      type: 'json',
      admin: {
        description: 'Additional data related to this log entry',
      },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: false,
      index: true,
      admin: {
        description: 'Related order (if applicable)',
      },
    },
    {
      name: 'payment',
      type: 'relationship',
      relationTo: 'payments',
      required: false,
      index: true,
      admin: {
        description: 'Related payment (if applicable)',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      required: false,
      admin: {
        description: 'IP address where the action originated',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      required: false,
    },
  ],
}
