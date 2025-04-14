import type { CollectionConfig } from 'payload'

export const Emails: CollectionConfig = {
  slug: 'emails',
  access: {
    // read: ({ req: { user } }) => user?.role === 'admin',
    read: () => true,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'subject',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: false,
    },
    {
      name: 'ticket',
      type: 'relationship',
      relationTo: 'tickets',
      required: false,
    },
    { name: 'to', type: 'email', required: true },
    { name: 'cc', type: 'text', required: false },
    { name: 'subject', type: 'text', required: true },
    { name: 'html', type: 'textarea' },
    { name: 'text', type: 'textarea' },
    { name: 'provider', type: 'text', defaultValue: 'RESEND' },
    { name: 'extraData', type: 'json' },
    {
      name: 'sentAt',
      type: 'date',
      defaultValue: () => new Date(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
  ],
}
