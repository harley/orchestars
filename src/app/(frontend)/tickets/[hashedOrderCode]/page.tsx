import type { Metadata } from 'next'
import { cache } from 'react'
import type { Ticket } from '@/payload-types'

import { sql } from '@payloadcms/db-postgres/drizzle'
import TicketsSwipeViewer from './page.client'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { ORDER_STATUS } from '@/collections/Orders/constants'

import { decodeOrderCode } from '@/utilities/orderCodeHash'

const getTicketsByOrderCode = cache(
  async ({
    hashedOrderCode,
  }: {
    hashedOrderCode: string
  }): Promise<{ ticket: Ticket; isCheckedIn: boolean; checkedInAt: string | null }[]> => {
   
    const decoded = decodeOrderCode(hashedOrderCode)
    if (!decoded) {
      throw new Error('Invalid order code')
    }
    const { orderCode, userId } = decoded

    const payload = await getPayload()
    const query = sql`
      SELECT t.id as id, 
        t.ticket_code as "ticketCode",
        t.attendee_name as "attendeeName",
        t.seat as "seat", 
        t.status, 
        t.order_id as "orderId",
        es.date as "eventDate",
        ord.order_code as "orderCode",
        evt.id as "eventId",
        el.title as "eventTitle",
        evt.start_datetime as "eventStartDatetime",
        evt.end_datetime as "eventEndDatetime",
        el.event_location as "eventLocation",
        t.ticket_price_info as "ticketPriceInfo",
        t.ticket_price_name as "ticketPriceName",
        cr.check_in_time as "checkInTime", 
        cr.created_at as "checkinCreatedAt", 
        cr.id as "checkinId"
      FROM tickets t
      LEFT JOIN orders ord ON t.order_id = ord.id
      LEFT JOIN events evt ON t.event_id = evt.id
      LEFT JOIN events_locales el ON evt.id = el._parent_id AND el._locale = 'vi'
      LEFT JOIN events_schedules es ON t.event_schedule_id = es.id
      LEFT JOIN checkin_records cr ON t.id = cr.ticket_id
      WHERE ord.order_code = ${orderCode} AND ord.status = ${ORDER_STATUS.completed.value}
        AND (
          (t.gift_info_is_gifted = 'FALSE' AND t.user_id = ${userId})
          OR 
          (t.gift_info_is_gifted = 'TRUE' AND t.gift_info_gift_recipient_id = ${userId})
        )
      ORDER BY t.created_at ASC
    `
    const result = await payload.db.drizzle.execute(query)

    return ((result as { rows: any[] }).rows || []).map((ticket) => ({
      ticket: {
        ...ticket,
        event: {
          id: ticket.eventId,
          title: ticket.eventTitle,
          startDatetime: ticket.eventStartDatetime,
          endDatetime: ticket.eventEndDatetime,
          eventLocation: ticket.eventLocation,
        },
      },
      isCheckedIn: Boolean(ticket.checkinId),
      checkedInAt: ticket?.checkInTime ?? ticket?.checkinCreatedAt ?? null,
    }))
  },
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hashedOrderCode: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const tickets = await getTicketsByOrderCode({ hashedOrderCode: resolvedParams.hashedOrderCode })

  const pageTitle: string =
    tickets.length > 0 ? `Order ${resolvedParams.hashedOrderCode} Tickets` : 'Tickets'
  return {
    title: pageTitle,
  }
}

export default async function TicketsPage({
  params,
}: {
  params: Promise<{ hashedOrderCode: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params
  const { hashedOrderCode } = resolvedParams
  const tickets = await getTicketsByOrderCode({ hashedOrderCode })

  if (!tickets.length) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">No tickets found</h1>
      </div>
    )
  }

  return (
    <div className="-mt-[72px]">
      <TicketsSwipeViewer tickets={tickets} />
    </div>
  )
}
