'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'

export async function getTicketsForSchedule(eventId: string, scheduleId: string) {
  const payload = await getPayload({
    config,
  })

  const result = await payload.find({
    collection: 'tickets',
    where: {
      event: { equals: eventId },
      eventScheduleId: { equals: scheduleId },
    },
  })

  return result.docs
}

export async function assignSeatToTicket(
  ticketId: number,
  seat: string,
  eventId: string,
  scheduleId: string,
) {
  try {
    const payload = await getPayload({
      config,
    })

    // Check if seat is already taken
    const existingSeats = await payload.find({
      collection: 'tickets',
      where: {
        event: { equals: eventId },
        eventScheduleId: { equals: scheduleId },
        seat: { equals: seat },
        status: {
          not_equals: 'cancelled',
        },
      },
    })

    if (existingSeats.docs.length > 0) {
      throw new Error(`Seat ${seat} is already taken`)
    }

    // Update the ticket with the new seat
    await payload.update({
      collection: 'tickets',
      id: ticketId,
      data: {
        seat,
      },
    })

    return { success: true }
  } catch (error: any) {
    return { error: error.message }
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
