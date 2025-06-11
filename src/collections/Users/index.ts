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
    {
      name: 'salt',
      type: 'text',
      hidden: true,
    },
    {
      name: 'hash',
      type: 'text',
      hidden: true,
    },
    {
      name: 'resetPasswordToken',
      type: 'text',
      hidden: true,
    },
    {
      name: 'resetPasswordExpiration',
      type: 'date',
      hidden: true,
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
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Affiliate', value: 'affiliate' },
        { label: 'User', value: 'user' },
      ],
      // required: true,
      defaultValue: 'user',
      // admin: { position: 'sidebar' },
    },
  ],
}
