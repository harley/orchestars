import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { TICKET_STATUS } from '@/collections/Tickets/constants'
import { Event, User } from '@/payload-types'

// Helper function to extract zoneId and zoneName
function getZoneInfo(ticket: any, eventRecord: Event): { zoneId: string; zoneName: string } {
  const ticketPriceInfo = ticket.ticketPriceInfo as Record<string, any>

  let zoneId = ticketPriceInfo?.key || 'unknown'
  let zoneName = ticketPriceInfo?.name || 'unknown'

  // If no zoneId from ticketPriceInfo, try to find it in eventRecord.ticketPrices
  if (zoneId === 'unknown' && eventRecord?.ticketPrices) {
    const ticketPrice = eventRecord.ticketPrices.find(
      (price: any) => price.id === (ticketPriceInfo?.id || ticketPriceInfo?.ticketPriceId),
    )
    zoneId = ticketPrice?.key || 'unknown'
  }

  // If no zoneName from ticketPriceInfo, try to find it in eventRecord.ticketPrices
  if (zoneName === 'unknown' && eventRecord?.ticketPrices) {
    const ticketPrice = eventRecord.ticketPrices.find(
      (price: any) => price.id === (ticketPriceInfo?.id || ticketPriceInfo?.ticketPriceId),
    )
    zoneName = ticketPrice?.name || 'unknown'
  }

  return { zoneId, zoneName }
}

export async function POST(request: Request) {
  try {
    const { email, ticketCode } = await request.json()

    // Validate inputs
    if (!email || !ticketCode) {
      return NextResponse.json(
        {
          message: 'Email and ticket code are required',
        },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Find ticket by code
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

    // Validate ticket exists
    if (!ticket) {
      return NextResponse.json(
        {
          message: 'Invalid ticket code',
        },
        { status: 400 },
      )
    }

    // Validate email matches
    if (ticket.userEmail !== email) {
      return NextResponse.json(
        {
          message: 'Email does not match ticket records',
        },
        { status: 400 },
      )
    }

    const sisterTickets = await payload.find({
      collection: 'tickets',
      where: {
        ticketCode: { not_equals: ticketCode },
        status: { equals: TICKET_STATUS.booked.value },
        user: { equals: (ticket.user as User)?.id }, // ensure this is ID, not object
        eventScheduleId: { equals: ticket.eventScheduleId },
      },
    }).then((res) => res.docs)

    // Check if ticket is already checked in by looking up check-in records
    const existingCheckIn = await payload
      .find({
        collection: 'checkinRecords',
        where: {
          ticketCode: {
            equals: ticketCode,
          },
          deletedAt: { equals: null },
        },
      })
      .then((res) => res.docs[0])

    if (existingCheckIn) {
      return NextResponse.json(
        {
          message: 'This ticket has already been checked in',
        },
        { status: 400 },
      )
    }

    const eventRecord = ticket.event as Event
    const eventId = eventRecord?.id as number
    const userId = (ticket.user as User)?.id as number

    const eventDate = eventRecord?.schedules?.find(
      (schedule) => schedule.id === ticket.eventScheduleId,
    )?.date

    // Create check-in record
    const checkInRecord = await payload.create({
      collection: 'checkinRecords',
      data: {
        event: eventId,
        seat: ticket.seat!,
        eventDate: eventDate || null,
        user: userId,
        ticket: ticket.id,
        ticketCode: ticket.ticketCode as string,
        eventScheduleId: ticket.eventScheduleId,
        checkInTime: new Date().toISOString(),
      },
    })

    // Get zone information using the helper function
    const { zoneId, zoneName } = getZoneInfo(ticket, eventRecord)

    // Return success response
    return NextResponse.json({
      message: 'Check-in successful',
      data: {
        zoneId,
        zoneName,
        email: ticket.userEmail,
        ticketCode: ticket.ticketCode,
        sisterTickets: sisterTickets.map((t) => {
          const { zoneId: sisterZoneId, zoneName: sisterZoneName } = getZoneInfo(t, eventRecord)
          return {
            ticketCode: t.ticketCode,
            attendeeName: t.attendeeName,
            seat: t.seat,
            zoneId: sisterZoneId,
            zoneName: sisterZoneName,
          }
        }),
        attendeeName: ticket.attendeeName,
        eventName: eventRecord?.title,
        checkedInAt: checkInRecord.checkInTime,
        ticketPriceInfo: ticket.ticketPriceInfo,
      },
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      {
        message: 'An error occurred while processing your request',
      },
      { status: 400 },
    )
  }
}