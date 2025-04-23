import type { CollectionConfig } from 'payload'
import { DISCOUNT_APPLY_SCOPE, DISCOUNT_APPLY_SCOPES } from './constants'
// import { afterChangeStatus } from './hooks/afterChangeStatus'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    useAsTitle: 'code',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: false,
    },
    {
      name: 'appliedTicketClasses',
      type: 'array',
      required: false,
      fields: [
        {
          name: 'ticketClass',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'maxRedemptions',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'totalUsed',
      type: 'number',
    },
    {
      name: 'perUserLimit',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 1,
    },
    {
      name: 'conditions',
      type: 'group',
      fields: [
        {
          name: 'isApplyCondition',
          type: 'checkbox',
          required: false,
          label: 'Apply Condition',
        },
        {
          name: 'minTickets',
          type: 'number',
          required: false,
          label: 'Minimum Tickets Quantity',
          min: 1,
          admin: {
            placeholder: 'Minimum quantity: 1',
          },
        },
      ],
    },
    {
      name: 'discountApplyScope',
      type: 'select',
      label: 'Apply Discount On',
      defaultValue: DISCOUNT_APPLY_SCOPE.totalOrderValue.value,
      required: false,
      options: DISCOUNT_APPLY_SCOPES,
    },
    {
      name: 'discountType',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Percentage',
          value: 'percentage',
        },
        {
          label: 'Fixed Amount',
          value: 'fixed_amount',
        },
      ],
    },
    {
      name: 'discountValue',
      required: true,
      type: 'number',
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Disabled',
          value: 'disabled',
        },
      ],
    },
    {
      name: 'isPrivate',
      type: 'checkbox',
      defaultValue: true,
      label: 'Disable Public Visibility',
    },
  ],
}
