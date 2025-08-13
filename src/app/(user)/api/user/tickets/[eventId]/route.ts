import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { checkUserAuthenticated } from '@/app/(user)/user/actions/authenticated'
import { TICKET_STATUS } from '@/collections/Tickets/constants'

export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    // Check if user is authenticated
    const authData = await checkUserAuthenticated()

    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.userInfo.id
    const eventId = params.eventId
    const payload = await getPayload()

    // Get tickets filtered by eventId
    const ticketsResult = await payload.find({
      collection: 'tickets',
      where: {
        and: [
          {
            user: {
              equals: userId,
            },
          },
          {
            event: {
              equals: eventId,
            },
          },
          {
            status: {
              equals: TICKET_STATUS.booked.value,
            },
          },
          {
            or: [
              {
                'giftInfo.isGifted': {
                  equals: false,
                },
              },
              {
                'giftInfo.isGifted': {
                  equals: true,
                },
                'giftInfo.recipientConfirmationExpiresAt': {
                  less_than: new Date().toISOString(),
                },
              },
            ],
          },
        ],
      },
      limit: 500,
      sort: '-createdAt',
    })

    const tickets = ticketsResult.docs

    // Get check-in records for these tickets
    const ticketCodes = tickets.map((t: any) => t.ticketCode).filter(Boolean)

    if (ticketCodes.length === 0) {
      return NextResponse.json({
        tickets: tickets.map((ticket: any) => ({
          ticket,
          isCheckedIn: false,
          checkedInAt: null,
        })),
      })
    }

    const checkinResult = await payload.find({
      collection: 'checkinRecords',
      where: {
        ticketCode: {
          in: ticketCodes,
        },
        deletedAt: {
          exists: false,
        },
      },
    })

    const checkinRecords = checkinResult.docs

    // Map tickets with check-in status
    const ticketsWithCheckIn = tickets.map((ticket: any) => {
      const checkinRecord = checkinRecords.find((cr: any) => cr.ticketCode === ticket.ticketCode)
      return {
        ticket,
        isCheckedIn: Boolean(checkinRecord),
        checkedInAt: checkinRecord?.checkInTime || null,
      }
    })

    return NextResponse.json({ tickets: ticketsWithCheckIn })
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
