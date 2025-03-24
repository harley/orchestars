import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
    },
    // Email added by default
    {
      name: 'phoneNumber', // default phone number
      type: 'text',
      required: false,
    },
    {
      name: 'phoneNumbers', //support multi phone numbers
      type: 'array',
      required: false,
      fields: [
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'createdAt',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
              timeFormat: 'HH:mm a',
            },
          },
        },
        {
          name: 'isUsing',
          type: 'checkbox',
        },
      ],
    },
    {
      name: 'username',
      type: 'text',
      required: false,
    },
    {
      name: 'firstName',
      type: 'text',
      required: false,
    },
    {
      name: 'lastName',
      type: 'text',
      required: false,
    },
    {
      name: 'lastActive',
      type: 'date',
      required: false,
    },
  ],
}
