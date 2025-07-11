// POST /api/checkin-app/validate/:ticket-code
// Validate if a ticket exists and can be checked in
// Returns:
// - 404 if ticket not found
// - 409 if ticket already checked in
// - 200 if ticket valid and ready for check-in
// - 300 if multiple ticket found if searched by seat label

import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'
// Use sql tag from @payloadcms/db-postgres for parameterized queries to prevent SQL injection
import { sql } from '@payloadcms/db-postgres'

interface TicketRecord {
  id: number
  ticket_code: string
  attendee_name: string
  seat: string
  ticket_price_info: any
  event_schedule_id: string
  status: string
  email: string
  phone_number: string
  is_checked_in: boolean
  check_in_time: string | null
  checked_in_by_id: number | null
  checked_in_by_email: string | null
  ticket_given_time: string | null
  ticket_given_by: string | null
}

export async function POST(req: NextRequest) {
  try {
    // Get authorization header
    const payload = await getPayload()
    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    //Get params event-id and event-scheduler-id by url
    let body: { eventId?: string, eventScheduleId?: string } = {}
    try {
      body = await req.json()
    } catch (e) {
      // The scanner page may not send a body.
    }
    const eventId = body.eventId
    const eventScheduleId = body.eventScheduleId

    if (!user) {
      throw new Error('CHECKIN005')
    }
    const ticketCode = req.nextUrl.pathname.split('/').pop()

    if (!ticketCode) {
      throw new Error('CHECKIN013')
    }

    // Determine search type (seat label or ticket code)
    const isSearchBySeat = ticketCode.length <= 4

    // Optimize: Use a single query with JOIN to get ticket and check-in status

    const ticketCodeParam = isSearchBySeat ? ticketCode.toUpperCase() : ticketCode.toUpperCase()

    const query = sql`
      SELECT
        t.id,
        t.ticket_code,
        t.attendee_name,
        t.seat,
        t.ticket_price_info,
        t.event_schedule_id,
        t.status,
        u.email,
        u.phone_number,
        CASE WHEN cr.id IS NOT NULL THEN true ELSE false END as is_checked_in,
        cr.check_in_time,
        cr.checked_in_by_id,
        cr.ticket_given_time,
        cr.ticket_given_by,
        a.email as checked_in_by_email
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN checkin_records cr ON cr.ticket_code = t.ticket_code AND cr.deleted_at IS NULL
      LEFT JOIN admins a ON cr.checked_in_by_id = a.id
      WHERE
        ${
          isSearchBySeat
            ? sql`UPPER(t.seat) = ${ticketCodeParam}`
            : sql`t.ticket_code = ${ticketCodeParam}`
        }
        ${eventId ? sql`AND t.event_id = ${eventId}` : sql``}
        ${eventScheduleId ? sql`AND t.event_schedule_id = ${eventScheduleId}` : sql``}
        AND t.status = 'booked'
      ORDER BY t.created_at DESC
    `

    const ticketResult = await payload.db.drizzle.execute(query)

    const tickets = ((ticketResult as { rows: any[] }).rows || []) as unknown as TicketRecord[]

    // Return 404 if no tickets found
    if (!tickets.length) {
      throw new Error('CHECKIN001')
    }

    // If searching by seat label and found multiple tickets
    if (isSearchBySeat && tickets.length > 1) {
      return NextResponse.json(
        {
          tickets: tickets.map((ticket) => ({
            id: ticket.id,
            attendeeName: ticket.attendee_name,
            email: ticket.email,
            phoneNumber: ticket.phone_number,
            ticketCode: ticket.ticket_code,
            seat: ticket.seat,
            status: ticket.status,
            isCheckedIn: ticket.is_checked_in,
            ticketPriceInfo: ticket.ticket_price_info,
            checkinRecord: ticket.is_checked_in
              ? {
                  checkInTime: ticket.check_in_time,
                  checkedInBy: {
                    email: ticket.checked_in_by_email,
                  },
                  ticketGivenTime: ticket.ticket_given_time,
                  ticketGivenBy: ticket.ticket_given_by,
                }
              : null,
          })),
        },
        { status: 300 },
      )
    }

    // We know tickets has at least one element from the check above
    const ticket = tickets[0]!

    if (ticket.is_checked_in) {
      return NextResponse.json({
        ticket: {
          id: ticket.id,
          attendeeName: ticket.attendee_name,
          email: ticket.email,
          phoneNumber: ticket.phone_number,
          ticketCode: ticket.ticket_code,
          seat: ticket.seat,
          status: ticket.status,
          ticketPriceInfo: ticket.ticket_price_info,
          isCheckedIn: true,
          checkinRecord: {
            checkInTime: ticket.check_in_time,
            checkedInBy: {
              email: ticket.checked_in_by_email,
            },
            ticketGivenTime: ticket.ticket_given_time,
            ticketGivenBy: ticket.ticket_given_by,
          },
        },
      })
    }

    // Return 200 if ticket valid and not checked in
    return NextResponse.json(
      {
        ticket: {
          id: ticket.id,
          attendeeName: ticket.attendee_name,
          email: ticket.email,
          phoneNumber: ticket.phone_number,
          ticketCode: ticket.ticket_code,
          seat: ticket.seat,
          status: ticket.status,
          ticketPriceInfo: ticket.ticket_price_info,
          isCheckedIn: false,
          checkinRecord: null,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}
