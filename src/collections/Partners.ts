import { revalidateTag } from 'next/cache'
import type { CollectionConfig } from 'payload'

export const Partners: CollectionConfig = {
  slug: 'partners',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'text',
      required: false,
    },
    {
      name: 'link',
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
  ],
  hooks: {
    afterChange: [
      () => {
        // revalidate home data on client side
        revalidateTag('home-partners')
      },
    ],
  },
}
