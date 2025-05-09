import type { CollectionConfig, PayloadRequest, AuthStrategyFunction, AuthStrategyResult } from 'payload'
import type { User } from '@/payload-types'

const adminAccessControl = ({ req: { user } }: { req: PayloadRequest }) => {
  if (user && (user.role?.includes('admin') || user.role?.includes('super-admin'))) {
    return true
  }
  return false
}

const isSuperAdmin = ({ req: { user } }: { req: PayloadRequest }) => user?.role === 'super-admin'
const isOwnRecord = ({ req: { user }, id }: { req: PayloadRequest, id: string }) => Boolean(user && String(user.id) === String(id))

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    maxLoginAttempts: 3,
    strategies: [
      {
        name: 'custom-strategy',
        authenticate: async ({ payload, headers }): Promise<AuthStrategyResult> => {
          const authHeader = headers.get('Authorization')
          if (!authHeader?.startsWith('Bearer ')) {
            return { user: null }
          }

          try {
            const { user } = await payload.auth({ headers })
            if (!user) return { user: null }

            return {
              user: {
                _strategy: 'custom-strategy',
                collection: 'users',
                ...(user as User), 
              },
              responseHeaders: new Headers({
                'Authorization': `Bearer ${authHeader.split(' ')[1]}`,
                'Access-Control-Expose-Headers': 'Authorization'
              })
            }
          } catch (error) {
            return { user: null }
          }
        }
      }
    ]
  },
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: isSuperAdmin,
    admin: adminAccessControl,
    unlock: ({ req: { user }, id }) => {
      if (adminAccessControl({ req: { user } })) return true
      return isOwnRecord({ req: { user }, id })
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email'],
    group: 'Admin',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'phoneNumber', // default phone number
      type: 'text',
      required: false,
    },
    {
      name: 'phoneNumbers', // support multi phone numbers
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
        {
          label: "Event Admin",
          value: "event-admin"
        }

      ],
      required: false,
    },
    {
      name: 'lastActive',
      type: 'date',
      required: false,
    },
  ],
  timestamps: true,
}
