'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'

interface TicketCounts {
  [ticketPriceName: string]: {
    [scheduleId: string]: number
  }
}

export async function getTicketsForSchedule(eventId: string, scheduleId: string) {
  try {
    const payload = await getPayload({
      config,
    })

    const result = await payload.db.drizzle.execute(`
      SELECT 
        ticket.id,
        ticket.attendee_name AS "attendeeName",
        ticket.ticket_code AS "ticketCode",
        ticket.seat,
        ticket.ticket_price_name AS "ticketPriceName",
        ticket.status,
        ord.expire_at AS "expire_at",
        ord.promotion_code AS "promotionCode",
        ticket.created_at AS "createdAt",
        ticket.updated_at AS "updatedAt"
      FROM tickets ticket
      LEFT JOIN orders ord ON ord.id = ticket.order_id
      WHERE 
        ticket.event_id = ${Number(eventId)}
        AND ticket.event_schedule_id = '${scheduleId}'
      ORDER BY 
        CASE 
          WHEN ticket.seat IS NULL THEN 1 
          ELSE 0 
        END,
        ticket.seat
    `)

    // Transform the data to match the expected format
    const tickets = result.rows.map((ticket) => ({
      ...ticket,
      order: ticket.promotionCode ? { promotion_code: ticket.promotionCode } : undefined,
    }))

    return tickets
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return []
  }
}

export async function assignSeatToTicket(ticketId: string, seat: string | null) {
  try {
    const payload = await getPayload({
      config,
    })

    await payload.update({
      collection: 'tickets',
      id: ticketId,
      data: {
        seat: seat ? seat.toUpperCase() : null,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating seat:', error)
    return { error: 'Failed to update seat' }
  }
}

export async function getBookedTicketsCounts(eventId: string): Promise<TicketCounts> {
  const payload = await getPayload({
    config,
  })

  const result = await payload.db.drizzle.execute(`
    SELECT 
      ticket.ticket_price_name AS "ticketPriceName",
      ticket.event_schedule_id AS "eventScheduleId",
      COUNT(*) as count
    FROM tickets ticket
    INNER JOIN orders ord ON ord.id = ticket.order_id
    WHERE 
      ticket.event_id = ${Number(eventId)}
      AND ticket.status = 'booked'
    GROUP BY ticket.ticket_price_name, ticket.event_schedule_id
    ORDER BY ticket.ticket_price_name, ticket.event_schedule_id
  `)

  // Transform the result into the expected format
  const countsByScheduleAndPrice = result.rows.reduce<TicketCounts>((acc, row) => {
    const ticketPriceName = row.ticketPriceName as string
    const eventScheduleId = row.eventScheduleId as string
    const count = Number(row.count)

    if (!acc[ticketPriceName]) {
      acc[ticketPriceName] = {}
    }
    acc[ticketPriceName][eventScheduleId] = count
    return acc
  }, {})

  return countsByScheduleAndPrice
}
