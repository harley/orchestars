'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { sql } from '@payloadcms/db-postgres/drizzle'
import { Ticket } from './types'
import { Event, OrderItem, User } from '@/payload-types'
import { checkBookedOrPendingPaymentSeats } from '@/app/(payload)/api/bank-transfer/order/utils'
import { getSeatHoldings as getCurrentSeatHoldings } from '@/app/(payload)/api/seat-holding/seat/utils'
import { sendMailAndWriteLog } from '@/collections/Emails/utils'
import { generateTicketBookEmailHtml } from '@/mail/templates/TicketBookedEmail'

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

    const result = await payload.db.drizzle.execute(sql`
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
        ticket.updated_at AS "updatedAt",
        users.email AS "userEmail"
      FROM tickets ticket
      LEFT JOIN orders ord ON ord.id = ticket.order_id
      LEFT JOIN users ON users.id = ticket.user_id
      WHERE 
        ticket.event_id = ${Number(eventId)}
        AND ticket.event_schedule_id = ${scheduleId}
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

  const result = await payload.db.drizzle.execute(sql`
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

export const getSeatHoldings = async (eventId: string, scheduleId: string) => {
  'use server'

  try {
    const payload = await getPayload({
      config,
    })

    const now = new Date().toISOString()
    const res = await payload.find({
      collection: 'seatHoldings',
      where: {
        and: [
          {
            event: {
              equals: eventId,
            },
          },
          {
            eventScheduleId: {
              equals: scheduleId,
            },
          },
          {
            expire_time: {
              greater_than: now,
            },
          },
          {
            closedAt: {
              equals: null,
            },
          },
        ],
      },
    })

    return res.docs
  } catch (error) {
    console.error('Error fetching seat holdings:', error)
    return []
  }
}

export const getBookedSeatsByEventScheduleId = async (eventId: number, eventScheduleId: string) => {
  try {
    const payload = await getPayload({
      config,
    })

    const result = await payload.db.drizzle.execute(sql`
      SELECT 
      ticket.id,
      ticket.ticket_code as "ticketCode",
      ticket.attendee_name as "attendeeName",
      ticket.ticket_price_info as "ticketPriceInfo",
      ticket.ticket_price_name AS "ticketPriceName",
      ticket.event_schedule_id AS "eventScheduleId",
      ticket.seat
      FROM tickets ticket
      WHERE 
        ticket.event_id = ${Number(eventId)}
        AND ticket.event_schedule_id = ${eventScheduleId}
        AND ticket.status = 'booked'
    `)

    return result?.rows || []
  } catch (error) {
    console.log('error', error)

    return []
  }
}

export const getBookedOrPendingPaymentOrHoldingSeats = async ({
  eventId,
  eventScheduleId,
}: {
  eventId: number
  eventScheduleId: string
}) => {
  const payload = await getPayload({
    config,
  })

  const unavailableSeats = await checkBookedOrPendingPaymentSeats({
    eventId: Number(eventId),
    eventScheduleId: eventScheduleId,
    payload,
  }).then((seats) => seats.map((s) => s.seatName))

  const seatHoldings = await getCurrentSeatHoldings({
    eventId: Number(eventId),
    eventScheduleId: eventScheduleId,
    payload,
  })

  return [...unavailableSeats, ...seatHoldings]
}

export const swapSeats = async (
  originalTicket: Ticket,
  changedData: { seat: string; eventId: number; eventScheduleId: string; ticketPriceId: string },
) => {
  const payload = await getPayload({
    config,
  })
  const existOriginalTicket = await payload.findByID({
    collection: 'tickets',
    id: originalTicket.id,
  })

  if (!existOriginalTicket) {
    throw new Error('Original ticket not found')
  }

  const bookedOrHoldingSeats = await getBookedOrPendingPaymentOrHoldingSeats({
    eventId: changedData.eventId,
    eventScheduleId: changedData.eventScheduleId,
  })

  const checkExistChangedSeat = bookedOrHoldingSeats.includes(changedData.seat.toUpperCase())

  if (checkExistChangedSeat) {
    throw new Error(`Seat ${changedData.seat} is holding or already booked`)
  }

  const updatedData: Record<string, any> = {
    seat: changedData.seat.toUpperCase(),
    eventScheduleId: changedData.eventScheduleId,
  }
  if (
    (existOriginalTicket.ticketPriceInfo as Record<string, any>)?.id !== changedData.ticketPriceId
  ) {
    const newTicketPriceInfo = (existOriginalTicket.event as Event).ticketPrices?.find(
      (tPrice) => tPrice.id === changedData.ticketPriceId,
    )
    if (newTicketPriceInfo) {
      updatedData.ticketPriceInfo = { ...newTicketPriceInfo, ticketPriceId: newTicketPriceInfo.id }
      updatedData.ticketPriceName = newTicketPriceInfo?.name
    }
  }

  const transactionID = await payload.db.beginTransaction()
  if (!transactionID) {
    throw new Error('Opps! Something went wrong!')
  }

  try {
    const updatedTicket = await payload.update({
      collection: 'tickets',
      id: originalTicket.id,
      data: updatedData,
      req: { transactionID },
    })
    if ((updatedTicket.orderItem as OrderItem)?.id) {
      const updateOrderItemData = {
        seat: changedData.seat.toUpperCase(),
        ticketPriceName: updatedTicket.ticketPriceName,
        ticketPriceId: updatedData.ticketPriceInfo?.id,
      }

      await payload.update({
        collection: 'orderItems',
        id: (updatedTicket.orderItem as OrderItem).id,
        data: updateOrderItemData,
        req: { transactionID },
      })
    }
    await payload.db.commitTransaction(transactionID)

    const sendUpdateMail = async () => {
      if (updatedTicket.userEmail) {
        const user = updatedTicket.user as User
        const event = updatedTicket.event as Event
        const html = await generateTicketBookEmailHtml({
          ticketCode: updatedTicket.ticketCode || '',
          eventName: event?.title || '',
          eventDate: updatedTicket?.eventDate || '',
          seat: updatedTicket.seat || '',
        })

        const resendMailData = {
          to: updatedTicket.userEmail,
          subject: `Update_${event?.title || ''}: Ticket Confirmation`,
          cc: 'receipts@orchestars.vn',
          html,
        }

        sendMailAndWriteLog({
          payload: payload,
          resendMailData,
          emailData: {
            user: user.id,
            event: event?.id,
            ticket: updatedTicket.id,
          },
        })
      }
    }

    sendUpdateMail()
  } catch (error: any) {
    await payload.db.rollbackTransaction(transactionID)

    throw new Error(error?.message)
  }
}
