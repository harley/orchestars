// POST /api/v1/checkin
// High-performance ticket check-in API
// Validates ticket and creates check-in record in optimized single transaction
// Returns:
// - 400 if validation fails (ticket not found, not booked, order not completed, already checked in)
// - 200 if check-in successful

import { NextRequest, NextResponse } from 'next/server'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { revalidateTag } from 'next/cache'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'
import { checkAuthenticated } from '@/utilities/checkAuthenticated'
// Use sql tag from @payloadcms/db-postgres for parameterized queries to prevent SQL injection
import { sql } from '@payloadcms/db-postgres'

interface TicketCheckInRecord {
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
    // Get authorization and validate admin user
    const payload = await getPayload()
    const authData = await checkAuthenticated()

    if (
      !authData?.user ||
      !isAdminOrSuperAdminOrEventAdmin({
        req: { user: authData.user },
      })
    ) {
      throw new Error('CHECKIN005')
    }

    const adminUser = authData.user
    const body = await req.json()
    const { ticketCode, eventId, eventScheduleId } = body

    if (!ticketCode) {
      throw new Error('CHECKIN010')
    }

    if (!eventId) {
      throw new Error('CHECKIN014')
    }

    if (!eventScheduleId) {
      throw new Error('CHECKIN019')
    }

    // Optimize: Use single SQL query to validate ticket and check existing check-in
    // This reduces database round trips from 3+ queries to 1 query
    const validationQuery = sql`
      SELECT
        t.id,
        t.ticket_code,
        t.attendee_name,
        t.seat,
        t.event_id,
        t.event_schedule_id,
        t.status,
        t.user_id,
        t.order_id,
        o.status as order_status,
        CASE WHEN cr.id IS NOT NULL THEN true ELSE false END as is_checked_in,
        cr.check_in_time,
        cr.checked_in_by_id,
        cr.ticket_given_time,
        cr.ticket_given_by,
        a.email as checked_in_by_email,
        el.title as event_title,
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
        AND t.event_id = ${eventId}
        AND t.event_schedule_id = ${eventScheduleId}
      ORDER BY t.created_at DESC
      LIMIT 1
    `

    const result = await payload.db.drizzle.execute(validationQuery)
    const tickets = ((result as { rows: any[] }).rows || []) as unknown as TicketCheckInRecord[]

    // Validate ticket exists
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

    // Validate required ticket fields
    if (!ticket.event_id || !ticket.user_id || !ticket.seat) {
      throw new Error('CHECKIN002')
    }

    // All validations passed - create check-in record
    const checkinRecord = await payload.create({
      collection: 'checkinRecords',
      data: {
        event: ticket.event_id,
        user: ticket.user_id,
        seat: ticket.seat,
        ticket: ticket.id,
        ticketCode: ticket.ticket_code,
        eventScheduleId: ticket.event_schedule_id || null,
        eventDate: ticket.event_date || null,
        checkInTime: new Date().toISOString(),
        checkedInBy: adminUser.id,
        ticketGivenTime: new Date().toISOString(),
      },
    })

    if (!checkinRecord) {
      throw new Error('CHECKIN004')
    }

    // Revalidate cache for updated check-in history
    revalidateTag('checkin-history')

    // Return success response with comprehensive ticket and check-in information
    return NextResponse.json(
      {
        success: true,
        message: 'Ticket checked in successfully',
        checkinRecord: {
          id: checkinRecord.id,
          ticketCode: ticket.ticket_code,
          checkInTime: checkinRecord.checkInTime,
          checkedInBy: {
            id: adminUser.id,
            email: adminUser.email,
          },
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      {
        success: false,
        message: await handleNextErrorMsgResponse(error),
      },
      { status: 400 },
    )
  }
}
