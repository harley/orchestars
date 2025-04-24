import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { TICKET_STATUS } from '@/collections/Tickets/constants'
import { Event, User } from '@/payload-types'

export async function POST(request: Request) {
  try {
    const { email, ticketCodeList } = await request.json()

    if (!email || !ticketCodeList || !Array.isArray(ticketCodeList)) {
      return NextResponse.json(
        { message: 'Email and ticket codes are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Fetch tickets by code
    const tickets = await payload.find({
      collection: 'tickets',
      where: {
        ticketCode: { in: ticketCodeList },
        status: { equals: TICKET_STATUS.booked.value },
      },
      depth: 2,
    }).then(res => res.docs)

    if (!tickets || tickets.length === 0) {
      return NextResponse.json(
        { message: 'No valid tickets found' },
        { status: 400 },
      )
    }

    const primaryTicket = tickets[0]
    const event = primaryTicket?.event as Event
    const user = primaryTicket?.user as User

    // Validate all tickets match the same user and event
    const invalidTickets = tickets.filter(
      (t) => t.userEmail !== email || (t.event as Event)?.id !== event.id
    )
    if (invalidTickets.length > 0) {
      return NextResponse.json(
        { message: 'All tickets must belong to the same user and event' },
        { status: 400 },
      )
    }

    // Fetch already checked-in tickets
    const existingCheckIns = await payload.find({
      collection: 'checkinRecords',
      where: {
        ticketCode: { in: ticketCodeList },
        deletedAt: { equals: null },
      },
    }).then(res => res.docs)

    const alreadyCheckedInCodes = new Set(existingCheckIns.map(r => r.ticketCode))
    const ticketsToCheckIn = tickets.filter(t => !alreadyCheckedInCodes.has(t?.ticketCode || ""))

    const checkInRecords = []

    for (const ticket of ticketsToCheckIn) {
      const eventDate = event.schedules?.find(
        (schedule) => schedule.id === ticket.eventScheduleId,
      )?.date

      const checkInRecord = await payload.create({
        collection: 'checkinRecords',
        data: {
          event: event.id,
          seat: ticket.seat!,
          eventDate: eventDate || null,
          user: user.id,
          ticket: ticket.id,
          ticketCode: ticket.ticketCode!,
          eventScheduleId: ticket.eventScheduleId,
          checkInTime: new Date().toISOString(),
        },
      })

      const ticketPriceInfo = ticket.ticketPriceInfo as Record<string, any>
      let zoneId = ticketPriceInfo?.key || 'unknown'

      if (!zoneId && event.ticketPrices) {
        const priceMatch = event.ticketPrices.find(
          (price: any) =>
            price.id === (ticketPriceInfo?.id || ticketPriceInfo?.ticketPriceId)
        )
        zoneId = priceMatch?.key || 'unknown'
      }

      checkInRecords.push({
        ticketCode: checkInRecord.ticketCode,
      })
    }

    return NextResponse.json({
      message: 'Check-in complete',
      data: {
        email,
        eventName: event.title,
        checkIns: checkInRecords,
        alreadyCheckedIn: Array.from(alreadyCheckedInCodes),
      },
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 },
    )
  }
}
