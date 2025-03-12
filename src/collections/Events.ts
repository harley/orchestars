import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'slug',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'keyword',
      type: 'text',
    },
    {
      name: 'startDatetime',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
    {
      name: 'endDatetime',
      type: 'date',
      // timezone: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
      },
    },
    {
      type: 'array',
      name: 'schedules',
      fields: [
        {
          type: 'text',
          name: 'date',
        },
        {
          type: 'array',
          name: 'details',
          fields: [
            {
              type: 'text',
              name: 'time',
            },
            {
              type: 'text',
              name: 'name',
            },
            {
              type: 'text',
              name: 'description',
            },
          ],
        },
      ],
    },
    {
      name: 'showAfterExpiration',
      type: 'checkbox',
    },
    {
      name: 'showTicketsAutomatically',
      type: 'checkbox',
    },
    {
      name: 'eventLocation',
      type: 'text',
    },
    {
      name: 'eventTermsAndConditions',
      type: 'textarea',
    },
    {
      type: 'array',
      name: 'ticketPrices',
      fields: [
        {
          type: 'text',
          name: 'name',
        },
        {
          type: 'number',
          min: 0,
          name: 'price',
        },
        {
          type: 'text',
          name: 'currency',
          defaultValue: 'VND',
        },
      ],
    },
    {
      name: 'eventLogo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'eventBanner',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'sponsorLogo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'ticketQuantityLimitation',
      type: 'radio',
      options: [
        {
          label: 'Per Ticket Type',
          value: 'perTicketType',
        },
        {
          label: 'Per Event',
          value: 'perEvent',
        },
      ],
    },
  ],
}
