import type { CollectionConfig } from 'payload'
import { afterChangeStatus } from './hooks/afterChangeStatus'
import { ORDER_STATUSES } from './constants'
import { createOrderHandler } from './handler/createOrder'

export const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    create: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'orderCode',
    components: {
      beforeListTable: ['@/components/AdminViews/Order/ActionViews#ActionViews'],
    },
  },
  fields: [
    {
      name: 'orderCode',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'category',
      type: 'text',
      defaultValue: 'order_payment',
      index: true,
      admin: {
        components: {
          Field:
            '@/components/AdminViews/Order/SelectOrderCategory/SelectOrderCategoryPayloadComponent#SelectOrderCategory',
        },
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'processing',
      options: ORDER_STATUSES,
      index: true,
      hooks: {
        afterChange: [afterChangeStatus],
      },
    },
    {
      name: 'currency',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'promotion',
      type: 'relationship',
      relationTo: 'promotions',
      required: false,
      index: true,
      admin: {
        description: 'Legacy field for a single promotion. Use "promotionsApplied" instead.',
      },
      hidden: true,
    },
    {
      name: 'promotionCode',
      type: 'text',
      required: false,
      index: true,
      admin: {
        description: 'Legacy field for a single promotion. Use "promotionsApplied" instead.',
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async ({ data }) => {
            if (data?.promotionsApplied?.length) {
              return data.promotionsApplied
                .map((promo: any) => promo.promotionCode)
                .filter((exist: string) => !!exist)
                .join(', ')
            }

            return data?.promotionCode
          },
        ],
      },
    },
    {
      name: 'promotionsApplied',
      type: 'array',
      required: false,
      label: 'Applied Promotions',
      admin: {
        description: 'List of promotions applied to this order',
        readOnly: true,
      },
      fields: [
        {
          name: 'promotion',
          type: 'relationship',
          relationTo: 'promotions',
          required: true,
          index: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'promotionCode',
          type: 'text',
          required: true,
          index: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'discountAmount',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'totalBeforeDiscount',
      type: 'number',
      required: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'totalDiscount',
      type: 'number',
      required: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'total',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'customerData',
      type: 'json',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'note',
      type: 'textarea',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'affiliate',
      type: 'group',
      admin: {
        description: 'Affiliate information',
        readOnly: true,
      },
      fields: [
        {
          name: 'affiliateLink',
          type: 'relationship',
          relationTo: 'affiliate-links',
          required: false,
          index: true,
          admin: {
            description: 'Affiliate link used for this order',
            readOnly: true,
          },
        },
        {
          name: 'affiliateCode',
          type: 'text',
          required: false,
          index: true,
          admin: {
            description: 'Affiliate code used for this order',
            readOnly: true,
          },
        },
        {
          name: 'affiliateUser',
          type: 'relationship',
          relationTo: 'users',
          required: false,
          index: true,
          admin: {
            description: 'Affiliate user who referred this order',
            readOnly: true,
          },
          filterOptions: () => {
            return {
              role: {
                equals: 'affiliate',
              },
            }
          },
        },
      ],
    },
    {
      name: 'expireAt', // order will be expired in time
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
        readOnly: true,
      },
    },
    {
      name: 'createdByAdmin',
      type: 'relationship',
      relationTo: 'admins',
      index: true,
      admin: {
        readOnly: true,
      },
    },
  ],
  endpoints: [
    {
      path: '/custom/create-order',
      method: 'post',
      handler: createOrderHandler,
    },
  ],
}
