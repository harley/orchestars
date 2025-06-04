import type { CollectionConfig } from 'payload'
import { EMAIL_STATUSES } from './constant'
import { executeSendingMailHandler } from './handler/executeSendingMail'

export const Emails: CollectionConfig = {
  slug: 'emails',
  // access: {},
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
    { name: 'from', type: 'email', required: false },
    { name: 'cc', type: 'text', required: false },
    { name: 'subject', type: 'text', required: true },
    { name: 'html', type: 'textarea' },
    { name: 'text', type: 'textarea' },
    { name: 'provider', type: 'text', defaultValue: 'RESEND' },
    { name: 'extraData', type: 'json' },
    { name: 'status', type: 'select', options: EMAIL_STATUSES },
    {
      name: 'sentAt',
      type: 'date',
      // defaultValue: () => new Date(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
  ],
  endpoints: [
    {
      path: '/job/send-mail',
      method: 'get',
      handler: executeSendingMailHandler,
    },
  ],
}
