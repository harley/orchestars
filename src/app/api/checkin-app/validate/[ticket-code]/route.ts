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

    // Find ticket
    const ticket = await payload.find({
      collection: 'tickets',
      where: isSearchBySeat
        ? { seat: { equals: ticketCode } }
        : { ticketCode: { equals: ticketCode } },
      depth: 1, // To populate event and schedule info
    })

    // Return 404 if no tickets found
    if (!ticket.docs.length) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // If searching by seat label and found multiple tickets
    if (isSearchBySeat && ticket.docs.length > 1) {
      // Get check-in records for all found tickets
      const ticketIds = ticket.docs.map(doc => doc.id)
      const checkinRecords = await payload.find({
        collection: 'checkinRecords',
        where: {
          ticket: {
            in: ticketIds
          }
        }
      })

      // Map check-in status to each ticket
      const ticketsWithCheckinStatus = await Promise.all(ticket.docs.map(async (doc) => {
        const checkinRecord = checkinRecords.docs.find(record => record.ticketCode === doc.ticketCode)
        return {
          ticketCode: doc.ticketCode,
          seat: doc.seat,
          event: doc.event,
          eventScheduleId: doc.eventScheduleId,
          isCheckedIn: !!checkinRecord,
          checkinRecord: checkinRecord || null
        }
      }))

      // Return list of tickets with their event details and check-in status
      return NextResponse.json(
        {
          error: 'Multiple tickets found',
          message: 'Please use ticket code instead of seat label',
          tickets: ticketsWithCheckinStatus
        },
        { status: 300 },
      ) // Multiple Choices status code
    }

    const ticketDoc = ticket.docs[0]
    if (!ticketDoc) {
      return NextResponse.json({ error: 'Invalid ticket data' }, { status: 400 })
    }

    // Find any existing check-in record for this ticket
    const checkinRecord = await payload.find({
      collection: 'checkinRecords',
      where: {
        ticket: {
          equals: ticketDoc.id,
        },
      },
    })

    // Return 409 if ticket already checked in
    if (checkinRecord.docs.length > 0) {
      const existingCheckIn = checkinRecord.docs[0]
      return NextResponse.json(
        {
          ticket: ticketDoc,
          error: 'Ticket has already been checked in',
          checkinRecord: existingCheckIn,
        },
        { status: 409 },
      )
    }

    // Return 200 if ticket valid and not checked in
    return NextResponse.json({ ticket: ticketDoc }, { status: 200 })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
