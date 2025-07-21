import type { CollectionConfig } from 'payload'
import { isAdminOrSuperAdmin, isSuperAdmin } from '@/access/isAdminOrSuperAdmin'
import { ADMIN_TOKEN_EXPIRATION_IN_SECONDS } from '@/config/app'

const Admins: CollectionConfig = {
  slug: 'admins',
  admin: {
    useAsTitle: 'email',
    group: 'System',
  },
  auth: {
    tokenExpiration: ADMIN_TOKEN_EXPIRATION_IN_SECONDS,
  }, // Enable authentication for this collection
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      return {
        id: {
          equals: user.id,
        },
      }
    },
    create: isSuperAdmin,
    update: isSuperAdmin,
    delete: isSuperAdmin,
    admin: isAdminOrSuperAdmin,
  },
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
          label: 'Event Admin',
          value: 'event-admin',
        },
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
