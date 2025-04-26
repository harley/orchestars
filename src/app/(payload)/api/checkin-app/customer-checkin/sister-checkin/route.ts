import { NextRequest, NextResponse } from 'next/server'
import { TICKET_STATUS } from '@/collections/Tickets/constants'
import { Event, User } from '@/payload-types'
import { getZoneInfo } from '../utils'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'

// get sister tickets
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ticketCode = searchParams.get('ticketCode')
    if (!ticketCode) {
      return NextResponse.json({ data: { sisterTickets: [] } })
    }

    const payload = await getPayload()

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
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}
