import type { CollectionConfig } from 'payload'
import { afterChangeStatus } from './hooks/afterChangeStatus'
import { ORDER_STATUSES } from './constants'
import { createOrderHandler } from './handler/createOrder'

export const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    create: () => false,
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
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      index: true,
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
      },
      fields: [
        {
          name: 'promotion',
          type: 'relationship',
          relationTo: 'promotions',
          required: true,
          index: true,
        },
        {
          name: 'promotionCode',
          type: 'text',
          required: true,
          index: true,
        },
        {
          name: 'discountAmount',
          type: 'number',
          required: true,
          min: 0,
        },
      ],
    },
    {
      name: 'totalBeforeDiscount',
      type: 'number',
      required: false,
    },
    {
      name: 'totalDiscount',
      type: 'number',
      required: false,
    },
    {
      name: 'total',
      type: 'number',
    },
    {
      name: 'customerData',
      type: 'json',
    },
    {
      name: 'note',
      type: 'textarea',
    },
    {
      name: 'affiliate',
      type: 'group',
      admin: {
        description: 'Affiliate information'
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
          },
        },
        {
          name: 'affiliateCode',
          type: 'text',
          required: false,
          index: true,
          admin: {
            description: 'Affiliate code used for this order',
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
      },
    },
    {
      name: 'createdByAdmin',
      type: 'relationship',
      relationTo: 'admins',
      index: true,
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
