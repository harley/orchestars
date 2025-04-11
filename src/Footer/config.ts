import type { GlobalConfig } from 'payload'
import { revalidateFooter } from './hooks/revalidateFooter'
import { link } from '@/fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      required: false,
      relationTo: 'media',
    },
    {
      name: 'title',
      type: 'text',
      required: false,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      localized: true,
    },
    {
      name: 'address',
      type: 'text',
      required: false,
      localized: true,
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
      name: 'contactTitle',
      type: 'text',
      required: false,
      defaultValue: 'Contact Us',
      localized: true,
    },
    {
      name: 'connectUsTitle',
      type: 'text',
      required: false,
      defaultValue: 'Connect with us',
      localized: true,
    },
    {
      name: 'aboutUsTitle',
      type: 'text',
      required: false,
      defaultValue: 'About Us',
      localized: true,
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
