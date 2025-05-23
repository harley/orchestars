import type { Block, Field } from 'payload'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'heading',
    type: 'text',
    localized: true,
  },
  {
    name: 'cards',
    type: 'array',
    fields: [
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
        required: false,
      },
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      {
        name: 'description',
        type: 'textarea',
        localized: true,
      },
      {
        name: 'enableLink',
        type: 'checkbox',
      },
      link({
        overrides: {
          admin: {
            condition: (_data, siblingData) => {
              return Boolean(siblingData?.enableLink)
            },
          },
        },
      }),
    ],
  },
]

export const CardsBlock: Block = {
  slug: 'cardsBlock',
  interfaceName: 'CardsBlock',
  fields: [
    {
      name: 'sections',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
