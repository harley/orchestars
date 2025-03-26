'use server'

import { getPayload } from 'payload'
import config from '../../../../../payload.config'

export async function getTicketsForSchedule(eventId: string, scheduleId: string) {
  const payload = await getPayload({
    config,
  })

  console.log('Fetching tickets for schedule:', { eventId, scheduleId })

  const result = await payload.db.drizzle.execute(`
    SELECT 
      ticket.id,
      ticket.attendee_name AS "attendeeName",
      ticket.ticket_code AS "ticketCode",
      ticket.seat,
      ticket.ticket_price_name AS "ticketPriceName",
      ticket.status,
      ord.expire_at AS "expire_at",
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

  console.log('Total tickets found:', result.rows.length)

  return result.rows
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

export async function getBookedTicketsCounts(eventId: string) {
  const payload = await getPayload({
    config,
  })

  console.log('Fetching booked tickets for event:', eventId)

  const currentTime = new Date().toISOString()
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

  console.log('SQL query result:', result.rows)

  // Transform the result into the expected format
  const countsByScheduleAndPrice = result.rows.reduce(
    (acc: Record<string, Record<string, number>>, row: any) => {
      const { ticketPriceName, eventScheduleId, count } = row
      if (!acc[ticketPriceName]) {
        acc[ticketPriceName] = {}
      }
      acc[ticketPriceName][eventScheduleId] = Number(count)
      return acc
    },
    {},
  )

  console.log('Final counts:', JSON.stringify(countsByScheduleAndPrice, null, 2))

  return countsByScheduleAndPrice
}
