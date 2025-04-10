import { revalidateTag } from 'next/cache'
import type { CollectionConfig } from 'payload'

export const Activities: CollectionConfig = {
  slug: 'activities',
  access: {
    // read: () => true,
  },
  admin: {
    useAsTitle: 'mainTitle',
  },
  fields: [
    {
      name: 'mainTitle',
      type: 'text',
      required: true,
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
    {
      type: 'array',
      name: 'list',
      fields: [
        {
          type: 'text',
          name: 'title',
          localized: true,
        },
        {
          type: 'text',
          name: 'description',
          localized: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'isShow',
          type: 'checkbox',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, req: { payload, context } }) => {
        if (!context.disableRevalidate) {
          payload.logger.info(`Revalidating home-activities`)

          revalidateTag('home-activities')
        }

        return doc
      },
    ],
  },
}
