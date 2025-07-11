// POST /api/checkin-app/checkin/scan
// Validate ticket by ticket code for check-in eligibility
// Returns:
// - 400 if validation fails (ticket not found, not booked, order not completed, already checked in)
// - 200 if ticket is valid and ready for check-in

import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'
// Use sql tag from @payloadcms/db-postgres for parameterized queries to prevent SQL injection
import { sql } from '@payloadcms/db-postgres'

interface TicketValidationRecord {
  id: number
  ticket_code: string
  attendee_name: string
  seat: string
  ticket_price_info: any
  event_id: number
  event_schedule_id: string
  status: string
  user_id: number | null
  email: string | null
  phone_number: string | null
  first_name: string | null
  last_name: string | null
  order_id: number | null
  order_status: string | null
  is_checked_in: boolean
  check_in_time: string | null
  checked_in_by_id: number | null
  checked_in_by_email: string | null
  ticket_given_time: string | null
  ticket_given_by: string | null
  event_title: string | null
  event_date: string | null
  event_start_datetime: string | null
  event_end_datetime: string | null
}

export async function POST(req: NextRequest) {
  try {
    // Get authorization header and authenticate user
    const payload = await getPayload()
    const headers = await getHeaders()
    // const { user } = await payload.auth({ headers })

    // if (!user) {
    //   throw new Error('CHECKIN005')
    // }

    const body = await req.json()
    const { ticketCode, eventId, eventScheduleId } = body

    if (!ticketCode) {
      throw new Error('CHECKIN010')
    }

    // if (!eventId) {
    //   throw new Error('CHECKIN014')
    // }

    // Optimize: Use a single SQL query with JOINs to get all required data
    // This reduces database round trips and improves performance
    const query = sql`
      SELECT
        t.id,
        t.ticket_code,
        t.attendee_name,
        t.seat,
        t.ticket_price_info,
        t.event_id,
        t.event_schedule_id,
        t.status,
        t.user_id,
        u.email,
        u.phone_number,
        u.first_name,
        u.last_name,
        t.order_id,
        o.status as order_status,
        CASE WHEN cr.id IS NOT NULL THEN true ELSE false END as is_checked_in,
        cr.check_in_time,
        cr.checked_in_by_id,
        cr.ticket_given_time,
        cr.ticket_given_by,
        a.email as checked_in_by_email,
        COALESCE(el.title) as event_title,
        e.start_datetime as event_start_datetime,
        e.end_datetime as event_end_datetime,
        es.date as event_date
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN orders o ON t.order_id = o.id
      LEFT JOIN checkin_records cr ON cr.ticket_code = t.ticket_code
        AND cr.event_id = t.event_id
        AND cr.deleted_at IS NULL
      LEFT JOIN admins a ON cr.checked_in_by_id = a.id
      LEFT JOIN events e ON t.event_id = e.id
      LEFT JOIN events_locales el ON e.id = el._parent_id AND el._locale = 'en'
      LEFT JOIN events_schedules es ON t.event_schedule_id = es.id AND es._parent_id = t.event_id
      WHERE
        t.ticket_code = ${ticketCode.toUpperCase()}
      ORDER BY t.created_at DESC
      LIMIT 1
    `

    const result = await payload.db.drizzle.execute(query)
    const tickets = ((result as { rows: any[] }).rows || []) as unknown as TicketValidationRecord[]

    console.log('tickets', tickets)

    // Check if ticket exists
    if (!tickets.length) {
      throw new Error('CHECKIN001')
    }

    const ticket = tickets[0]!

    // Validate ticket status - must be booked
    if (ticket.status !== 'booked') {
      throw new Error('CHECKIN015')
    }

    // Validate order exists and is completed
    if (!ticket.order_id || !ticket.order_status) {
      throw new Error('CHECKIN016')
    }

    if (ticket.order_status !== 'completed') {
      throw new Error('CHECKIN017')
    }

    // Check if already checked in
    if (ticket.is_checked_in) {
      throw new Error('CHECKIN018')
    }

    // All validations passed - return ticket details
    return NextResponse.json({
      success: true,
      message: 'Ticket is valid for check-in',
      ticket: {
        id: ticket.id,
        ticketCode: ticket.ticket_code,
        attendeeName: ticket.attendee_name,
        seat: ticket.seat,
        ticketPriceInfo: ticket.ticket_price_info,
        eventId: ticket.event_id,
        eventScheduleId: ticket.event_schedule_id,
        eventTitle: ticket.event_title,
        eventDate: ticket.event_date,
        eventStartDatetime: ticket.event_start_datetime,
        eventEndDatetime: ticket.event_end_datetime,
        status: ticket.status,
        user: ticket.user_id ? {
          id: ticket.user_id,
          email: ticket.email,
          phoneNumber: ticket.phone_number,
          firstName: ticket.first_name,
          lastName: ticket.last_name,
        } : null,
        order: {
          id: ticket.order_id,
          status: ticket.order_status,
        },
        isCheckedIn: false,
        checkinRecord: null,
      },
    })
  } catch (error: any) {
    console.error('Checkin scan validation error:', error)
    return NextResponse.json({
      success: false,
      message: await handleNextErrorMsgResponse(error)
    }, { status: 400 })
  }
}
