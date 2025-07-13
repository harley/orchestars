// POST /api/checkin-app/validate/:ticket-code
// Validate if a ticket exists and can be checked in
// Returns:
// - 404 if ticket not found
// - 409 if ticket already checked in
// - 200 if ticket valid and ready for check-in
// - 300 if multiple ticket found if searched by seat label

import { NextRequest, NextResponse } from 'next/server'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'
import { getAdminUser } from '@/utilities/getAdminUser'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { findTickets } from '@/lib/checkin/findTickets'

// DTO interface imported

export async function POST(req: NextRequest) {
  try {
    const adminUser = await getAdminUser()

    // Authentication check with proper permissions

    //Get params event-id and event-scheduler-id by url
    let body: { eventId?: string; scheduleId?: string } = {}
    try {
      body = await req.json()
    } catch (_e) {
      // The scanner page may not send a body.
    }
    const eventId = body.eventId
    const scheduleId = body.scheduleId

    if (
      !adminUser ||
      !isAdminOrSuperAdminOrEventAdmin({
        req: { user: adminUser },
      })
    ) {
      // Admin authentication failed
      throw new Error('CHECKIN005')
    }

    const ticketCode = req.nextUrl.pathname.split('/').pop()

    if (!ticketCode) {
      throw new Error('CHECKIN013')
    }

    // Determine if request is actually a seat label disguised as code
    const isSearchBySeat = ticketCode.length <= 4

    const tickets = await findTickets(
      isSearchBySeat
        ? { seatNumber: ticketCode, eventId, scheduleId }
        : { ticketCode, eventId, scheduleId },
    )

    if (!tickets.length) {
      throw new Error('CHECKIN001')
    }

    if (isSearchBySeat && tickets.length > 1) {
      return NextResponse.json({ tickets }, { status: 300 })
    }

    const ticket = tickets[0]!

    return NextResponse.json({ ticket }, { status: 200 })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}