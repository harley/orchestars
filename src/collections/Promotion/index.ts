import type { CollectionConfig } from 'payload'
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
  ],
}
