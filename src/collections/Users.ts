import type { CollectionConfig, PayloadRequest, AuthStrategyResult } from 'payload'
import type { User } from '@/payload-types'
import { getPayload } from '@/payload-config/getPayloadConfig'

const adminAccessControl = async ({ req: { user } }: { req: PayloadRequest }) => {
  const payload = await getPayload();
  
  const adminFind = await payload.find({
    collection: 'admins',
    where: {
      id: {
        equals: user?.id,
      },
    },
  })

  if (adminFind) {
    const admin = adminFind.docs[0]
  if (admin && (admin.role?.includes('admin') || admin.role?.includes('super-admin'))) {
    return true
  }
  return false
}
}

const isSuperAdmin = async ({ req: { user } }: { req: PayloadRequest }) => {
  const payload = await getPayload();
  
  const adminFind = await payload.find({
    collection: 'admins',
    where: {
      id: {
        equals: user?.id,
      },
    },
  })

  if (adminFind) {
    const admin = adminFind.docs[0]
  if (admin && (admin.role?.includes('super-admin'))) {
    return true
  }
}
}
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
                ...user,
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
    ],
    tokenExpiration: 60 * 60 * 24 * 1, 
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: "None",
      domain: "localhost",
    },

    forgotPassword: {
      generateEmailSubject: (args) => {
        return `Hey ${args?.user?.firstName ? args?.user.firstName : args?.user.email}! Reset your password.`
      },
      generateEmailHTML: (args) => {
        return `<div><h1>Hey ${args?.user?.firstName ? args?.user.firstName : args?.user.email}!</h1><br /><p>You (or someone else) requested to reset your password. If this wasn't you, you can safely ignore this email. Otherwise, reset your password by going to ${getServerSideURL()}/password-reset?token=${args?.token}</p></div>`
      }
    },
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: true,
      requireUsername: false,
    },
  },
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: isSuperAdmin,
    admin: adminAccessControl,
    unlock: async ({ req: { user }, id }) => {
      if (await adminAccessControl({ req: { user } })) return true
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
      name: 'lastActive',
      type: 'date',
      required: false,
    },
  ],
  timestamps: true,
}
