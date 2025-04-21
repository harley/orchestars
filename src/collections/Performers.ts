import { revalidateTag } from 'next/cache'
import type { CollectionConfig } from 'payload'

export const Performers: CollectionConfig = {
  slug: 'performers',
  access: {
    // read: () => true,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'displayOrder',
      type: 'number',
      required: false,
      defaultValue: 0,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'genre',
      type: 'text',
      required: false,
      localized: true,
    },
    {
      name: 'role',
      type: 'text',
      required: false,
      localized: true,
    },
    {
      name: 'description',
      type: 'text',
      required: false,
      localized: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Inactive',
          value: 'inactive',
        },
      ],
      required: false,
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, req: { payload, context } }) => {
        if (!context.disableRevalidate) {
          payload.logger.info(`Revalidating home-performers`)

          revalidateTag('home-performers')
          revalidateTag('event-performers')
        }

        return doc
      },
    ],
  },
}
