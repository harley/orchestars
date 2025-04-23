// POST /api/checkin-app/checkin/:ticket-code
// use token to authorize user
// check if ticket-code is valid
// check if ticket-code is already used
// return ticket details

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers as getHeaders } from 'next/headers'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
// import { getClientSideURL } from '@/utilities/getURL'

export async function POST(req: NextRequest) {

  try {
    // Get authorization header
    const payload = await getPayload({ config })

    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    if (!user || !isAdminOrSuperAdminOrEventAdmin({
      req: { user }})) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin user' },
        { status: 401 },
      )
    }

    // Get ticket code from URL parameter
    const ticketCode = req.nextUrl.pathname.split('/').pop()
    const {eventDate} = await req.json()

    // Find ticket by code
    const ticket = await payload.find({
      collection: 'tickets',
      where: {
        ticketCode: {
          equals: ticketCode,
        },
      },
    })

    if (!ticket.docs?.length) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const ticketDoc = ticket.docs[0]
    if (!ticketDoc || !ticketDoc.event || !ticketDoc.user || !ticketDoc.ticketCode || !ticketDoc.seat) {
      return NextResponse.json(
        { error: 'Invalid ticket data - Missing required fields or Seat is not assigned to Ticket' },
        { status: 400 },
      )
    }

    // Check if ticket has already been used
    const existingCheckIn = await payload.find({
      collection: 'checkinRecords',
      where: {
        ticketCode: {
          equals: ticketDoc.ticketCode,
        },
        deletedAt: { equals: null },
      },
    })

    if (existingCheckIn.docs?.length > 0) {
      return NextResponse.json(
        { error: 'Ticket has already been used for check-in' },
        { status: 400 },
      )
    }

    // Create check-in record
    const checkinRecord = await payload.create({
      collection: 'checkinRecords',
      data: {
        event: ticketDoc.event,
        user: ticketDoc.user,
        seat: ticketDoc.seat,
        ticket: ticketDoc,
        ticketCode: ticketDoc.ticketCode,
        eventScheduleId: ticketDoc.eventScheduleId || null,
        eventDate: eventDate || null,
        checkInTime: new Date().toISOString(),
        checkedInBy: user.id, // Use the admin's ID who performed check-in
      },
    })

    // return error if check-in record is not created
    if (!checkinRecord) {
      return NextResponse.json({ error: 'Failed to create check-in record' }, { status: 500 })
    }

    return NextResponse.json({ checkinRecord }, { status: 200 })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
