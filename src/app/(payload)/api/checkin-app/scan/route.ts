// POST /api/checkin-app/scan/:ticket-code
// Optimized single-call validation + check-in
// Returns complete result in one operation

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@payloadcms/db-postgres'
import { getAdminUser } from '@/utilities/getAdminUser'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { revalidateTag } from 'next/cache'
import { withConnectionMonitoring } from '@/utilities/dbConnectionMonitor'
import { CHECKIN_ERROR_CODE } from '@/config/error-code'
import { getTodayInVietnam } from '@/lib/checkin/autoEventSelection'
import { format } from 'date-fns'
import { getLocale, t } from '@/providers/I18n/server'

interface TicketRow {
  ticket_id: string
  ticket_code: string
  attendee_name: string
  seat: string
  ticket_price_info: any
  ticket_price_name: string
  event_id: string
  user_id: string
  event_schedule_id: string | null
  status: string
  existing_checkin_id?: string
  existing_checkin_time?: string
  event_schedule_date?: string
  event_title?: string
}

export async function POST(req: NextRequest) {
  const ticketCode = req.nextUrl.searchParams.get('ticketCode')
  const selectedEventId = req.nextUrl.searchParams.get('eventId')
  const selectedScheduleId = req.nextUrl.searchParams.get('scheduleId')

  if (!ticketCode) {
    return NextResponse.json({
      success: false,
      message: 'ticketCode query parameter is required'
    }, { status: 400 })
  }

  return await withConnectionMonitoring(async () => {
    try {
      const adminUser = await getAdminUser()

      if (
        !adminUser ||
        !isAdminOrSuperAdminOrEventAdmin({
          req: { user: adminUser },
        })
      ) {
        console.warn(`${CHECKIN_ERROR_CODE.CHECKIN005}: Unauthorized access attempt by user ${adminUser?.id || 'unknown'}`)
        return NextResponse.json({
          success: false,
          message: 'Unauthorized access'
        }, { status: 401 })
      }

      const payload = await getPayload()

      // Single optimized query to check ticket status and get all needed data, including event date and details
      const checkQuery = sql`
      SELECT
        t.id as ticket_id,
        t.ticket_code,
        t.attendee_name,
        t.seat,
        t.ticket_price_info,
        t.ticket_price_name,
        t.event_id,
        t.user_id,
        t.event_schedule_id,
        t.status,
        cr.id as existing_checkin_id,
        cr.check_in_time as existing_checkin_time,
        es.date as event_schedule_date,
        COALESCE(el_en.title, el_vi.title, 'Event') as event_title
      FROM tickets t
      LEFT JOIN checkin_records cr ON cr.ticket_code = t.ticket_code AND cr.deleted_at IS NULL
      LEFT JOIN events_schedules es ON es.id = t.event_schedule_id
      LEFT JOIN events e ON e.id = t.event_id
      LEFT JOIN events_locales el_en ON el_en._parent_id = e.id AND el_en._locale = 'en'
      LEFT JOIN events_locales el_vi ON el_vi._parent_id = e.id AND el_vi._locale = 'vi'
      WHERE
        t.ticket_code = ${ticketCode.toUpperCase()}
        AND t.status = 'booked'
      LIMIT 1
    `

      const result = await payload.db.drizzle.execute(checkQuery)
      const rows = (result as { rows: TicketRow[] }).rows || []

      if (!rows.length) {
        return NextResponse.json({
          success: false,
          message: 'Ticket not found',
          userValidationError: true
        }, { status: 404 })
      }

      const ticket = rows[0]
      if (!ticket) {
        return NextResponse.json(
          { success: false, message: 'Ticket not found' },
          { status: 404 }
        )
      }

      // Check if ticket is for the wrong day or expired event
      const today = getTodayInVietnam()
      const locale = await getLocale()
      let eventDate: string | null = null

      if (ticket.event_schedule_date) {
        const scheduleDate = new Date(ticket.event_schedule_date)
        if (!isNaN(scheduleDate.getTime())) {
          const ticketDateStr = format(scheduleDate, 'yyyy-MM-dd')
          eventDate = scheduleDate.toLocaleDateString('en-GB').replace(/\//g, '-')

          // Check if ticket is for a different day
          if (ticketDateStr !== today) {
            const isPastEvent = ticketDateStr < today
            const eventTitle = ticket.event_title || 'Event'
            const todayFormatted = format(new Date(today), 'dd-MM-yyyy')

            // If specific event/schedule is manually selected, allow more flexible validation
            const isManualSelection = selectedEventId && selectedScheduleId
            const isMatchingManualSelection = isManualSelection &&
              ticket.event_id === selectedEventId &&
              ticket.event_schedule_id === selectedScheduleId

            // For manual selections that match, allow testing ahead of event date
            if (isMatchingManualSelection && !isPastEvent) {
              // Allow future events when manually selected for testing
              console.log(`Allowing future event scan for testing: ticket ${ticketCode} for ${eventDate}`)
            } else if (isPastEvent) {
              const message = t('checkin.scan.error.wrongDatePast', locale, {
                eventTitle,
                eventDate
              })
              return NextResponse.json({
                success: false,
                message: message,
                userValidationError: true
              }, { status: 400 })
            } else if (!isMatchingManualSelection) {
              // Only show future date error if not manually selected for this specific event/schedule
              const message = t('checkin.scan.error.wrongDateFuture', locale, {
                eventTitle,
                eventDate,
                today: todayFormatted
              })
              return NextResponse.json({
                success: false,
                message: message,
                userValidationError: true
              }, { status: 400 })
            }
          }
        }
      }

      // If already checked in, return existing status
      if (ticket.existing_checkin_id) {
        return NextResponse.json({
          success: true,
          alreadyCheckedIn: true,
          message: 'Ticket already checked in',
          ticket: {
            ticketCode: ticket.ticket_code,
            attendeeName: ticket.attendee_name,
            seat: ticket.seat,
            ticketPriceName: ticket.ticket_price_name,
            ticketPriceInfo: ticket.ticket_price_info,
            isCheckedIn: true,
            checkedInAt: ticket.existing_checkin_time,
          },
        })
      }

      // Perform check-in with single INSERT
      const insertQuery = sql`
      INSERT INTO checkin_records (
        event_id,
        user_id,
        seat,
        ticket_id,
        ticket_code,
        event_schedule_id,
        event_date,
        check_in_time,
        checked_in_by_id,
        ticket_given_time,
        manual,
        created_at,
        updated_at
      ) VALUES (
        ${ticket.event_id},
        ${ticket.user_id},
        ${ticket.seat},
        ${ticket.ticket_id},
        ${ticket.ticket_code},
        ${ticket.event_schedule_id},
        ${eventDate},
        NOW(),
        ${adminUser.id},
        NOW(),
        false,
        NOW(),
        NOW()
      )
      RETURNING id, check_in_time
    `

      const insertResult = await payload.db.drizzle.execute(insertQuery)
      const checkinRows =
        (insertResult as { rows: { id: string; check_in_time: string }[] }).rows || []

      if (!checkinRows.length) {
        console.error(`${CHECKIN_ERROR_CODE.CHECKIN004}: Failed to create checkin record for ticket ${ticketCode} by admin ${adminUser.id}`)
        return NextResponse.json({
          success: false,
          message: 'Failed to create check-in record'
        }, { status: 500 })
      }
      const checkinRow = checkinRows[0]!

      // Revalidate cache
      revalidateTag('checkin-history')

      return NextResponse.json({
        success: true,
        alreadyCheckedIn: false,
        message: 'Check-in successful',
        ticket: {
          ticketCode: ticket.ticket_code,
          attendeeName: ticket.attendee_name,
          seat: ticket.seat,
          ticketPriceName: ticket.ticket_price_name,
          ticketPriceInfo: ticket.ticket_price_info,
          isCheckedIn: true,
          checkedInAt: checkinRow.check_in_time,
        },
      })
    } catch (error) {
      // Handle any unexpected system errors (database connection issues, etc.)
      console.error('Unexpected scan system error:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
        },
        { status: 500 }
      )
    }
  }, `qr-scan-${ticketCode}`)
}