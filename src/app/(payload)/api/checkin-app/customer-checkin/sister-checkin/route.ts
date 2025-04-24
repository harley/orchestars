import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { TICKET_STATUS } from '@/collections/Tickets/constants'
import { Event, User } from '@/payload-types'
import { getZoneInfo } from '../utils'

export async function POST(request: Request) {
  try {
    const { email, ticketCodeList } = await request.json()

    if (!email || !ticketCodeList || !Array.isArray(ticketCodeList)) {
      return NextResponse.json({ message: 'Email and ticket codes are required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Fetch tickets by code
    const tickets = await payload
      .find({
        collection: 'tickets',
        where: {
          ticketCode: { in: ticketCodeList },
          status: { equals: TICKET_STATUS.booked.value },
        },
        depth: 2,
      })
      .then((res) => res.docs)

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ message: 'No valid tickets found' }, { status: 400 })
    }

    const primaryTicket = tickets[0]
    const event = primaryTicket?.event as Event
    const user = primaryTicket?.user as User

    // Validate all tickets match the same user and event
    const invalidTickets = tickets.filter(
      (t) => t.userEmail !== email || (t.event as Event)?.id !== event.id,
    )
    if (invalidTickets.length > 0) {
      return NextResponse.json(
        { message: 'All tickets must belong to the same user and event' },
        { status: 400 },
      )
    }

    // Fetch already checked-in tickets
    const existingCheckIns = await payload
      .find({
        collection: 'checkinRecords',
        where: {
          ticketCode: { in: ticketCodeList },
          deletedAt: { equals: null },
        },
      })
      .then((res) => res.docs)

    const alreadyCheckedInCodes = new Set(existingCheckIns.map((r) => r.ticketCode))
    const ticketsToCheckIn = tickets.filter((t) => !alreadyCheckedInCodes.has(t?.ticketCode || ''))

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
          (price: any) => price.id === (ticketPriceInfo?.id || ticketPriceInfo?.ticketPriceId),
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

// get sister tickets
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ticketCode = searchParams.get('ticketCode')
    if (!ticketCode) {
      return NextResponse.json({ data: { sisterTickets: [] } })
    }

    const payload = await getPayload({ config })

    const ticket = await payload
      .find({
        collection: 'tickets',
        where: {
          ticketCode: {
            equals: ticketCode,
          },
          status: {
            equals: TICKET_STATUS.booked.value,
          },
        },
        depth: 2,
      })
      .then((res) => res.docs?.[0])

    if (!ticket) {
      return NextResponse.json({ data: { sisterTickets: [] } })
    }

    const sisterTickets = await payload
      .find({
        collection: 'tickets',
        limit: 1000,
        where: {
          ticketCode: { not_equals: ticketCode },
          status: { equals: TICKET_STATUS.booked.value },
          user: { equals: (ticket.user as User)?.id }, // ensure this is ID, not object
          eventScheduleId: { equals: ticket.eventScheduleId },
        },
      })
      .then((res) => res.docs)

    const checkInRecords = await payload
      .find({
        collection: 'checkinRecords',
        limit: sisterTickets.length,
        where: {
          ticketCode: { in: sisterTickets.map((t) => t.ticketCode) },
          deletedAt: { equals: null },
        },
        depth: 0,
      })
      .then((res) => res.docs)

    const eventRecord = sisterTickets[0]?.event as Event
    const sisterTicketsOutput = sisterTickets.map((t) => {
      const { zoneId: sisterZoneId, zoneName: sisterZoneName } = getZoneInfo(t, eventRecord)
      return {
        ticketCode: t.ticketCode,
        attendeeName: t.attendeeName,
        seat: t.seat,
        zoneId: sisterZoneId,
        zoneName: sisterZoneName,
        checkinRecord: checkInRecords.find((r) => r.ticketCode === t.ticketCode),
      }
    })

    return NextResponse.json({ data: { sisterTickets: sisterTicketsOutput } })
  } catch (error) {
    console.error('get sister tickets error:', error)
    return NextResponse.json({ data: { sisterTickets: [] } })
  }
}
