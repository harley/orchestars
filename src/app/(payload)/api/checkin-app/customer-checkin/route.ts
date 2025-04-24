import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { TICKET_STATUS } from '@/collections/Tickets/constants'
import { Event, User } from '@/payload-types'
import { getZoneInfo } from './utils'

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
    const eventRecord = ticket.event as Event
    const eventId = eventRecord?.id as number
    const userId = (ticket.user as User)?.id as number

    const eventDate = eventRecord?.schedules?.find(
      (schedule) => schedule.id === ticket.eventScheduleId,
    )?.date

    const { zoneId, zoneName } = getZoneInfo(ticket, eventRecord)
    if (existingCheckIn) {
      return NextResponse.json(
        {
          message: 'Ticket already checked in',
          data: {
            zoneId,
            zoneName,
            email: ticket.userEmail,
            ticketCode: ticket.ticketCode,
            attendeeName: ticket.attendeeName,
            eventName: eventRecord?.title,
            checkedInAt: existingCheckIn.checkInTime,
            ticketPriceInfo: ticket.ticketPriceInfo,
            seat: ticket.seat,
          },
        },
        { status: 409 },
      )
    }

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

    // Return success response
    return NextResponse.json({
      message: 'Check-in successful',
      data: {
        zoneId,
        zoneName,
        email: ticket.userEmail,
        ticketCode: ticket.ticketCode,
        attendeeName: ticket.attendeeName,
        eventName: eventRecord?.title,
        checkedInAt: checkInRecord.checkInTime,
        ticketPriceInfo: ticket.ticketPriceInfo,
        seat: ticket.seat,
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
