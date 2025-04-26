import { NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { TICKET_STATUS } from '@/collections/Tickets/constants'
import { Event, User } from '@/payload-types'
import { getZoneInfo } from './utils'
import { revalidateTag } from 'next/cache'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'

export async function POST(request: Request) {
  try {
    const { email, ticketCode } = await request.json()

    // Validate inputs
    if (!email || !ticketCode) {
      throw new Error('CHECKIN010')
    }
    const payload = await getPayload()
    // Find ticket by code
    const ticket = await payload
      .find({
        collection: 'tickets',
        limit: 1,
        where: {
          ticketCode: {
            equals: ticketCode,
          },
          status: {
            equals: TICKET_STATUS.booked.value,
          },
        },
        depth: 1,
      })
      .then((res) => res.docs?.[0])
    // Validate ticket exists
    if (!ticket) {
      throw new Error('CHECKIN011')
    }

    // Validate email matches
    if (ticket.userEmail !== email) {
      throw new Error('CHECKIN012')
    }
    // Check if ticket is already checked in by looking up check-in records
    const existingCheckIn = await payload
      .find({
        collection: 'checkinRecords',
        depth: 0,
        limit: 1,
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
      return NextResponse.json({
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
      })
    }

    // Create check-in record
    const checkInRecord = await payload.create({
      collection: 'checkinRecords',
      depth: 0,
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
    revalidateTag('checkin-history')

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
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}
