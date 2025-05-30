import type { CollectionConfig } from 'payload'

export const PromotionConfigs: CollectionConfig = {
  slug: 'promotionConfigs',
  admin: {
    useAsTitle: 'name',
    description: 'Configure rules and conditions for promotions',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: false,
      admin: {
        description: 'If specified, this config will only apply to promotions for this event',
      },
    },
    {
      name: 'validationRules',
      type: 'group',
      fields: [
        {
          name: 'allowApplyingMultiplePromotions',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Allow applying multiple promotions to the same order',
          },
        },
        {
          name: 'maxAppliedPromotions',
          type: 'number',
          label: 'Max Applied Promotions',
          min: 1,
          defaultValue: 1,
          admin: {
            condition: (_, siblingData) => siblingData.allowApplyingMultiplePromotions
          },
        },
      ],
    },
    {
      name: 'stackingRules',
      type: 'group',
      admin: {
        condition: (_, siblingData) => siblingData.validationRules?.allowApplyingMultiplePromotions,
      },
      fields: [
        {
          name: 'isStackable',
          type: 'checkbox',
          defaultValue: false,
          label: 'Allow Stacking with Other Promotions',
        },
      ],
    },
  ],
}
