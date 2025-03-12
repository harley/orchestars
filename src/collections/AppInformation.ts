import type { CollectionConfig } from 'payload'

export const AppInformation: CollectionConfig = {
  slug: 'app_information',
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
      name: 'address',
      type: 'text',
      required: false,
    },
    {
      name: 'email',
      type: 'text',
      required: false,
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: false,
    },
    {
      name: 'socials',
      type: 'array',
      required: false,
      defaultValue: [
        {
          name: 'Facebook',
          link: '',
        },
        {
          name: 'Instagram',
          link: '',
        },
        {
          name: 'Twitter',
          link: '',
        },
        {
          name: 'Youtube',
          link: '',
        },
      ],
      fields: [
        {
          type: 'text',
          name: 'name',
        },
        {
          type: 'text',
          name: 'link',
        },
      ],
    },
    {
      name: 'aboutUs',
      type: 'richText',
      required: false,
    },
  ],
}
