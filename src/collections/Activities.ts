import { revalidateTag } from 'next/cache'
import type { CollectionConfig } from 'payload'

export const Activities: CollectionConfig = {
  slug: 'activities',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'mainTitle',
  },
  fields: [
    {
      name: 'mainTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      required: false,
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
        },
        {
          type: 'text',
          name: 'description',
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
      () => {
        // revalidate home data on client side
        revalidateTag('home-activities')
      },
    ],
  },
}
