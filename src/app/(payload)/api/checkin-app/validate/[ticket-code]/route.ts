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
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { getClientSideURL } from '@/utilities/getURL'

export async function POST(req: NextRequest) {
  try {
    // Get authorization header
    const payload = await getPayload({ config })
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('JWT ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 },
      )
    }

    const ticketCode = req.nextUrl.pathname.split('/').pop()

    if (!ticketCode) {
      return NextResponse.json({ error: 'Ticket code is required' }, { status: 400 })
    }

    // Determine search type (seat label or ticket code)
    const isSearchBySeat = ticketCode.length <= 4

    // Find ticket with event and schedule info using SQL
    const ticketResult = await payload.db.pool.query<{
      id: string
      event_id: number
      event_schedule_id: string
      attendee_name: string
      ticket_code: string
      seat: string | null
      status: string
      event_title: string
      event_schedules: string
      event_location: string
      schedule_date: string | null
    }>(`
      WITH schedule_info AS (
        SELECT 
          e.id as event_id,
          e.title as event_title,
          e.event_location as event_location,
          json_agg(es.*) as event_schedules
        FROM events e
        LEFT JOIN events_schedules es ON es._parent_id = e.id
        GROUP BY e.id, e.title, e.event_location
      )
      SELECT 
        t.id,
        t.event_id,
        t.event_schedule_id,
        t.attendee_name,
        t.ticket_code,
        t.seat,
        t.status,
        s.event_title,
        s.event_schedules,
        s.event_location,
        es.date::text AS schedule_date
      FROM tickets t
      JOIN schedule_info s ON s.event_id = t.event_id
      LEFT JOIN events_schedules es ON es.id = t.event_schedule_id
      WHERE ${isSearchBySeat ? 't.seat = $1' : 't.ticket_code = $1'}
    `, [ticketCode])
    

    console.log(ticketResult.rows)

    // Return 404 if no tickets found
    if (!ticketResult.rows.length) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // If searching by seat label and found multiple tickets
    if (isSearchBySeat && ticketResult.rows.length > 1) {
      // Get check-in records for all found tickets
      const ticketIds = ticketResult.rows.map(t => t.id)
      const checkinRecordsResult = await payload.find({
        collection: 'checkinRecords',
        where: {
          ticket: {
            in: ticketIds
          }
        }
      })

      // Get checked in ticket IDs
      const checkedInTicketIds = new Set(checkinRecordsResult.docs.map(r => r.ticketCode))

        return NextResponse.json(
          {
            tickets: ticketResult.rows.map(ticketDoc => ({
              id: ticketDoc.id,
              attendeeName: ticketDoc.attendee_name,
              ticketCode: ticketDoc.ticket_code,
              seat: ticketDoc.seat,
              status: ticketDoc.status,
              eventTitle: ticketDoc.event_title,
              eventLocation: ticketDoc.event_location,
              scheduleDate: ticketDoc.schedule_date,
              isCheckedIn: checkedInTicketIds.has(ticketDoc.ticket_code),
              checkinRecord: checkinRecordsResult.docs.find(r => r.ticketCode === ticketDoc.ticket_code)
            })),
          },
          { status: 300 }
        )
    }

    // Get the first matching ticket
    const ticketDoc = ticketResult.rows[0]

    console.log(ticketDoc)
    // Find any existing check-in record for this ticket
    const checkinRecordResult = await payload.find({
      collection: 'checkinRecords',
      where: {
        ticketCode: {
          equals: ticketDoc?.ticket_code
        }
      }
    })

    // Return 409 if ticket already checked in
    if (checkinRecordResult.docs.length > 0 && ticketDoc) {
      return NextResponse.json(
        {
          ticket: {
            id: ticketDoc.id,
            attendeeName: ticketDoc.attendee_name,
            ticketCode: ticketDoc.ticket_code,
            seat: ticketDoc.seat,
            status: ticketDoc.status,
            eventTitle: ticketDoc.event_title,
            eventLocation: ticketDoc.event_location,
            scheduleDate: ticketDoc.schedule_date
          },
          error: 'Ticket has already been checked in',
        },
        { status: 409 },
      )
    }

    // Return 200 if ticket valid and not checked in
    return NextResponse.json({
      ticket: {
        id: ticketDoc.id,
        attendeeName: ticketDoc.attendee_name,
        ticketCode: ticketDoc.ticket_code,
        seat: ticketDoc.seat,
        status: ticketDoc.status,
        eventTitle: ticketDoc.event_title,
        eventLocation: ticketDoc.event_location,
        scheduleDate: ticketDoc.schedule_date
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
