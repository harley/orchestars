import type { CollectionConfig } from 'payload'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  fields: [
    {
      name: 'attendeeName',
      type: 'text',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'ticketCode',
      type: 'text',
    },
    {
      name: 'seat',
      type: 'text',
    },
    {
      name: 'ticketPriceInfo',
      type: 'json',
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
    },
    {
      name: 'orderItem',
      type: 'relationship',
      relationTo: 'orderItems',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Booked', //  The seat has been paid for and confirmed
          value: 'booked',
        },
        {
          label: 'Pending Payment', // The seat is held while payment is being processed
          value: 'pending_payment',
        },
        {
          label: 'Hold', // The seat is hold while pending user continue to pay
          value: 'hold',
        },
        {
          label: 'Cancelled', // The seat has been cancelled by user: eg user has not paid for this ticket
          value: 'cancelled',
        },
      ],
      required: false,
    },
  ],
}
