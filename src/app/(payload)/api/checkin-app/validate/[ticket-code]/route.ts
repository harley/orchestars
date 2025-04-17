// POST /api/checkin-app/validate/:ticket-code
// Validate if a ticket exists and can be checked in
// Returns:
// - 404 if ticket not found
// - 409 if ticket already checked in
// - 200 if ticket valid and ready for check-in
// - 300 if multiple ticket found if searched by seat label

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers as getHeaders } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    // Get authorization header
    const payload = await getPayload({ config })
    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    //Get params event-id and event-scheduler-id by url
    const body = await req.json();
    const eventId = body.eventId;
    const eventScheduleId = body.eventScheduleId;
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin user' },
        { status: 401 },
      )
    }
    const ticketCode = req.nextUrl.pathname.split('/').pop()

    if (!ticketCode) {
      return NextResponse.json({ error: 'Ticket code is required' }, { status: 400 })
    }

    // Determine search type (seat label or ticket code)
    const isSearchBySeat = ticketCode.length <= 4

    const ticketResult = await payload.find({
      collection: 'tickets',
      where: {
        ...(isSearchBySeat
          ? {
              and: [
                { seat: { equals: ticketCode } },
                { event: { equals: eventId } },
                { eventScheduleId: { equals: eventScheduleId } },
                { status: { equals: 'booked' } },
              ],
            }
          : {
              and: [
                { ticketCode: { equals: ticketCode } },
                { event: { equals: eventId } },
                { eventScheduleId: { equals: eventScheduleId } },
                { status: { equals: 'booked' } },
              ],
            }),
      },
      sort: ['-createdAt'],
    });

    // Get the first matching ticket
    const ticketDoc = ticketResult.docs[0]
    // If searching by seat label and found multiple tickets
    if (isSearchBySeat && ticketResult.docs.length > 1) {
      // Get check-in records for all found tickets
      const ticketCodes = ticketResult.docs.map(t => t.ticketCode)
      const checkinRecordsResult = await payload.find({
        collection: 'checkinRecords',
        where: {
          ticketCode: {
            in: ticketCodes
          }
        }
      })

      // Get checked in ticket IDs
      const checkedInTicketIds = new Set(checkinRecordsResult.docs.map(r => r.ticketCode))

        return NextResponse.json(
          {
            tickets: ticketResult.docs.map(ticketDoc => ({
              id: ticketDoc.id,
              attendeeName: ticketDoc.attendeeName,
              ticketCode: ticketDoc.ticketCode,
              seat: ticketDoc.seat,
              status: ticketDoc.status,
              isCheckedIn: checkedInTicketIds.has(ticketDoc.ticketCode!),
              checkinRecord: checkinRecordsResult.docs.find(r => r.ticketCode === ticketDoc.ticketCode)
            })),
          },
          { status: 300 }
        )
    }

    // Find any existing check-in record for this ticket
    const checkinRecordResult = await payload.find({
      collection: 'checkinRecords',
      where: {
        ticketCode: {
          equals: ticketDoc?.ticketCode
        }
      }
    })

    // Return 409 if ticket already checked in
    if (checkinRecordResult.docs.length > 0 && ticketDoc) {
      return NextResponse.json(
        {
          ticket: {
            id: ticketDoc.id,
            attendeeName: ticketDoc.attendeeName,
            ticketCode: ticketDoc.ticketCode,
            seat: ticketDoc.seat,
            status: ticketDoc.status,
            
          },
          error: 'Ticket has already been checked in',
        },
        { status: 409 },
      )
    }

    // Return 200 if ticket valid and not checked in
    return NextResponse.json({
      ticket: {
        id: ticketDoc?.id,
        attendeeName: ticketDoc?.attendeeName,
        ticketCode: ticketDoc?.ticketCode,
        seat: ticketDoc?.seat,
        status: ticketDoc?.status,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
