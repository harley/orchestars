// POST /api/checkin-app/checkin/:ticket-code
// use token to authorize user
// check if ticket-code is valid
// check if ticket-code is already used
// return ticket details

import { NextRequest, NextResponse } from 'next/server'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { revalidateTag } from 'next/cache'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'
import { checkAuthenticated } from '@/utilities/checkAuthenticated'
// import { getClientSideURL } from '@/utilities/getURL'

export async function POST(req: NextRequest) {
  try {
    // Get authorization header
    const payload = await getPayload()

    const authData = await checkAuthenticated()

    if (
      !authData?.user ||
      !isAdminOrSuperAdminOrEventAdmin({
        req: { user: authData.user },
      })
    ) {
      return NextResponse.json({ error: 'Unauthorized - Invalid admin user' }, { status: 401 })
    }

    const user = authData.user

    // Get ticket code from URL parameter
    const ticketCode = req.nextUrl.pathname.split('/').pop()
    const { eventDate } = await req.json()

    // Find ticket by code
    const ticket = await payload.find({
      collection: 'tickets',
      depth: 0,
      limit: 1,
      where: {
        ticketCode: {
          equals: ticketCode,
        },
      },
    })

    if (!ticket.docs?.length) {
      throw new Error('CHECKIN001')
    }

    const ticketDoc = ticket.docs[0]
    if (
      !ticketDoc ||
      !ticketDoc.event ||
      !ticketDoc.user ||
      !ticketDoc.ticketCode ||
      !ticketDoc.seat
    ) {
      throw new Error('CHECKIN002')
    }

    // Check if ticket has already been used
    const existingCheckIn = await payload.find({
      collection: 'checkinRecords',
      depth: 0,
      limit: 1,
      where: {
        ticketCode: {
          equals: ticketDoc.ticketCode,
        },
        deletedAt: { equals: null },
      },
    })

    if (existingCheckIn.docs?.length > 0) {
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
        ticketGivenTime: new Date().toISOString(),
      },
    })

    revalidateTag('checkin-history')

    // return error if check-in record is not created
    if (!checkinRecord) {
      throw new Error('CHECKIN005')
    }

    return NextResponse.json({ checkinRecord }, { status: 200 })
  } catch (error: any) {
    console.error('Check-in error:', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}
