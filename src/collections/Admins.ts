import type { CollectionConfig } from 'payload'

const Admins: CollectionConfig = {
  slug: 'admins',
  admin: {
    useAsTitle: 'email',
    group: 'System',
  },
  auth: true, // Enable authentication for this collection
  fields: [
    // Email added by default by auth: true
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Super Admin',
          value: 'super-admin',
        },
      ],
    },
    {
      name: 'lastActive',
      type: 'date',
      required: false,
    },
  ],
}

export default Admins
