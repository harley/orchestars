// POST /api/checkin-app/checkin/:ticket-code
// use token to authorize user
// check if ticket-code is valid
// check if ticket-code is already used
// return ticket details

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
// import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
// import { getClientSideURL } from '@/utilities/getURL'

export async function POST(req: NextRequest, { params }: { params: { 'ticket-code': string } }) {

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

    // Extract token
    const token = authHeader.split(' ')[1]
    console.log('Token extracted:', token)

    // Get ticket code from URL parameter
    const ticketCode = params['ticket-code']

    // Find ticket by code
    const ticket = await payload.find({
      collection: 'tickets',
      where: {
        ticketCode: {
          equals: ticketCode,
        },
      },
    })

    const checkinRecord = await payload.find({
      collection: 'checkinRecords',
      where: {
        ticketCode: {
          equals: ticketCode,
        },
      },
    })

    if (!ticket.docs.length) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // If ticket has already been checked in
    if (checkinRecord.docs.length > 0) {
      const existingCheckIn = checkinRecord.docs[0]
      return NextResponse.json(
        {
          ticket: ticket.docs[0],
          error: 'Ticket has already been checked in',
          checkinRecord: existingCheckIn,
        },
        { status: 409 }, // Conflict status code
      )
    }

    // Ticket exists and hasn't been checked in yet
    return NextResponse.json(
      {
        ticket: ticket.docs[0],
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
