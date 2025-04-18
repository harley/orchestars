import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { TICKET_STATUS } from '@/collections/Tickets/constants'
import { Event, User } from '@/payload-types'

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

    // Create check-in record
    const checkInRecord = await payload.create({
      collection: 'checkinRecords',
      data: {
        event: eventId,
        user: userId,
        ticket: ticket.id,
        ticketCode: ticket.ticketCode as string,
        eventScheduleId: ticket.eventScheduleId,
        checkInTime: new Date().toISOString(),
      },
    })

    // Get zone information from ticket price info
    const ticketPriceInfo = ticket.ticketPriceInfo as Record<string, any>

    let zoneId = ticketPriceInfo?.key || 'unknown'
    if (!zoneId && eventRecord?.ticketPrices) {
      const ticketPrice = eventRecord.ticketPrices.find(
        (price: any) => price.id === (ticketPriceInfo?.id || ticketPriceInfo?.ticketPriceId),
      )
      zoneId = ticketPrice?.key || 'unknown'
    }
    // Return success response
    return NextResponse.json({
      message: 'Check-in successful',
      data: {
        zoneId,
        email: ticket.userEmail,
        ticketCode: ticket.ticketCode,
        attendeeName: ticket.attendeeName,
        eventName: eventRecord?.title,
        checkedInAt: checkInRecord.checkInTime,
        ticketPriceInfo,
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
