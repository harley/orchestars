import type { CollectionConfig } from 'payload'
import { format as formatDate } from 'date-fns'
import { TICKET_STATUSES } from './constants'
import { afterChangeSeat } from './hooks/afterChangeSeat'
import { getBookedSeat } from './handler/getBookedSeat'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'

import { createGiftTicket } from './handler/createGiftTicket'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  access: {
    create: () => false,
    delete: () => false,
  },
  admin: {
    components: {
      edit: {
        SaveButton: '@/components/Tickets/Actions/SendMailButton',
      },
    },
  },
  fields: [
    {
      name: 'attendeeName',
      type: 'text',
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
      name: 'userEmail',
      type: 'text',
      virtual: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async ({ req, data }) => {
            if (!data?.user) return null

            const user = await req.payload
              .findByID({
                collection: 'users',
                depth: 0,
                id: data.user,
              })
              .then((res) => res)
              .catch(() => null)

            return user?.email || null
          },
        ],
      },
    },
    {
      name: 'ticketCode',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'seat',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        afterChange: [afterChangeSeat],
      },
    },
    {
      name: 'ticketPriceName',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'ticketPriceInfo',
      type: 'json',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'eventScheduleId',
      type: 'text',
      required: false,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'eventDate',
      type: 'text',
      virtual: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async ({ req, data }) => {
            const schedules = await req.payload
              .findByID({
                collection: 'events',
                depth: 0,
                id: data?.event,
              })
              .then((res) => res?.schedules || [])
              .catch(() => [])

            const scheduleDate = schedules.find((sch) => sch.id === data?.eventScheduleId)?.date

            if (scheduleDate) {
              return formatDate(scheduleDate, 'dd/MM/yyyy')
            }

            return null
          },
        ],
      },
    },
    {
      name: 'orderItem',
      type: 'relationship',
      relationTo: 'orderItems',
      maxDepth: 1,
      hasMany: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      maxDepth: 1,
      hasMany: false,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'orderCode',
      type: 'text',
      virtual: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async ({ req, data }) => {
            if (data?.order) {
              const order = await req.payload
                .findByID({
                  collection: 'orders',
                  depth: 0,
                  id: data.order,
                })
                .then((res) => res?.orderCode)
                .catch(() => null)

              return order
            }

            return null
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      options: TICKET_STATUSES,
      required: false,
      admin: {
        readOnly: true,
      },
      hooks: {
        // afterChange: [afterChangeStatus],
      },
    },
    {
      name: 'CheckedIn Time',
      type: 'text',
      virtual: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async ({ req, data }) => {
            const checkinRecord = await req.payload
              .find({
                collection: 'checkinRecords',
                where: {
                  ticket: {
                    equals: data?.id,
                  },
                },
                depth: 0,
                limit: 1,
              })
              .then((res) => res?.docs?.[0])
              .catch(() => null)

            if (checkinRecord?.checkInTime) {
              return tzFormat(
                toZonedTime(new Date(checkinRecord?.checkInTime), 'Asia/Ho_Chi_Minh'),
                'dd/MM/yyyy HH:mm:ss',
              )
            }

            return null
          },
        ],
      },
    },
    {
      name: 'qr_link',
      type: 'text',
      virtual: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async ({ data }) => {
            if (!data?.ticketCode) return null;
            return `/ticket/${data.ticketCode}`;
          },
        ],
      },
    },
    {
      name: 'giftInfo',
      type: 'group',
      admin: {
        description: 'Thông tin liên quan người được tặng vé',
      },
      fields: [
        {
          name: 'isGifted',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            readOnly: true,
            description: 'Đánh dấu vé có phải là vé tặng hay không',
          },
        },
        {
          name: 'attendeeName',
          type: 'text',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'giftRecipient',
          type: 'relationship',
          relationTo: 'users',
          required: false,
          index: true,
          admin: {
            readOnly: true,
            description: 'Người nhận vé tặng',
            condition: (data) => data.giftInfo?.isGifted,
          },
        },
        {
          name: 'giftDate',
          type: 'date',
          required: false,
          admin: {
            readOnly: true,
            description: 'Ngày tặng vé',
            condition: (data) => data.giftInfo?.isGifted,
            date: {
              pickerAppearance: 'dayAndTime',
              timeFormat: 'HH:mm a',
            },
          },
        },
      ],
    },

    // todo: can add log for logging the transfer history
  ],
  indexes: [
    {
      fields: ['ticketCode', 'seat', 'event', 'eventScheduleId', 'status'],
    },
    {
      fields: ['ticketCode', 'event', 'eventScheduleId', 'status'],
    },
    {
      fields: ['seat', 'event', 'eventScheduleId', 'status'],
    },
    {
      fields: ['event', 'eventScheduleId'],
    },
    {
      fields: ['ticketCode', 'status'],
    },
  ],
  endpoints: [
    {
      path: '/booked-seats',
      method: 'get',
      handler: getBookedSeat,
    },
    {
      path: '/gift-ticket',
      method: 'post',
      handler: createGiftTicket,
    },
  ],
}
