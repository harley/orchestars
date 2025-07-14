// POST /api/checkin-app/scan/:ticket-code
// Optimized single-call validation + check-in
// Returns complete result in one operation

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@payloadcms/db-postgres'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'
import { getAdminUser } from '@/utilities/getAdminUser'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { revalidateTag } from 'next/cache'

export async function POST(req: NextRequest) {
  try {
    const adminUser = await getAdminUser()

    if (
      !adminUser ||
      !isAdminOrSuperAdminOrEventAdmin({
        req: { user: adminUser },
      })
    ) {
      throw new Error('CHECKIN005')
    }

    const ticketCode = req.nextUrl.pathname.split('/').pop()
    if (!ticketCode) {
      throw new Error('CHECKIN013')
    }

    const payload = await getPayload()

    // Single optimized query to check ticket status and get all needed data
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
        cr.check_in_time as existing_checkin_time
      FROM tickets t
      LEFT JOIN checkin_records cr ON cr.ticket_code = t.ticket_code AND cr.deleted_at IS NULL
      WHERE 
        t.ticket_code = ${ticketCode.toUpperCase()}
        AND t.status = 'booked'
      LIMIT 1
    `

    const result = await payload.db.drizzle.execute(checkQuery)
    const rows = (result as { rows: any[] }).rows || []
    
    if (!rows.length) {
      throw new Error('CHECKIN001') // Ticket not found
    }

    const ticket = rows[0]
    
    // Determine event date from schedule data (only when event_schedule_id exists)
    let eventDate: string | null = null
    if (ticket.event_schedule_id) {
      try {
        // Fetch event with schedules using Payload (minimal query)
        const eventResult = await payload.find({
          collection: 'events',
          where: { id: { equals: ticket.event_id } },
          limit: 1,
          depth: 0,
          select: { schedules: true }
        })
        
        const eventRecord = eventResult.docs?.[0]
        if (eventRecord?.schedules) {
          const schedule = eventRecord.schedules.find(
            (sch: any) => sch.id === ticket.event_schedule_id
          )
          if (schedule?.date) {
            const scheduleDate = new Date(schedule.date)
            if (!isNaN(scheduleDate.getTime())) {
              eventDate = scheduleDate.toLocaleDateString('en-GB').replace(/\//g, '-')
            }
          }
        }
      } catch (e) {
        console.warn('Failed to fetch event schedules:', e)
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
          checkedInAt: ticket.existing_checkin_time
        }
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
    const checkinRows = (insertResult as { rows: any[] }).rows || []
    
    if (!checkinRows.length) {
      throw new Error('CHECKIN004') // Failed to create checkin record
    }

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
        checkedInAt: checkinRows[0].check_in_time
      }
    })

  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json({ 
      success: false,
      message: await handleNextErrorMsgResponse(error) 
    }, { status: 400 })
  }
} 