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
  console.log('Check-in request received:', {
    url: req.url,
    params,
    headers: Object.fromEntries(req.headers.entries()),
  })

  try {
    // Get authorization header
    const payload = await getPayload({ config })
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('JWT ')) {
      console.log('Missing or invalid authorization header')
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
    console.log('Looking up ticket with code:', ticketCode)

    // Find ticket by code
    const ticket = await payload.find({
      collection: 'tickets',
      where: {
        ticketCode: {
          equals: ticketCode,
        },
      },
    })

    if (!ticket.docs.length) {
      console.log('Ticket not found:', ticketCode)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    console.log('Ticket found:', ticket.docs[0])
    return NextResponse.json({ ticket: ticket.docs[0] }, { status: 200 })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
