import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
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
      name: 'role',
      type: 'select',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Super Admin',
          value: 'super-admin',
        },
        {
          label: 'Customer',
          value: 'customer',
        },
      ],
      required: false,
    },
    {
      name: 'lastActive',
      type: 'date',
      required: false,
    },
  ],
}
