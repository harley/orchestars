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

  const result = await payload.db.drizzle.execute(`
    SELECT
      ticket_price_name,
      COUNT(*) as booked_count
    FROM tickets
    WHERE
      event_id = ${eventId}
      AND status = 'booked'
    GROUP BY ticket_price_name
  `)

  return result.rows.reduce((acc: Record<string, number>, row: any) => {
    acc[row.ticket_price_name] = Number(row.booked_count)
    return acc
  }, {})
}
