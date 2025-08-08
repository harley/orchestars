import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(user)/utils/authorizeApiRequest'
import { TICKET_STATUS } from '@/collections/Tickets/constants'

export async function GET(req: NextRequest) {
  try {
    // Verify the JWT token
    const userRequest = await authorizeApiRequest()
    const userId = userRequest.id
    const payload = await getPayload()

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10) || 1
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10
    let ticketStatus = searchParams.get('ticketStatus')

    if (ticketStatus === 'canceled') {
      ticketStatus = TICKET_STATUS.cancelled.value
    } 

    // First find relevant events based on date filter
    const eventsQuery = await payload.find({
      collection: 'events',
      where: {},
      select: {},
      depth: 0,
      limit: 1000,
    })

    const eventIds = eventsQuery.docs.map((event) => event.id)

    let ticketsQuery

    if (ticketStatus === 'gifted') {
      ticketsQuery = await payload.find({
        collection: 'tickets',
        where: {
          'giftInfo.giftRecipient': {
            equals: userId,
          },
          'giftInfo.isGifted': {
            equals: true,
          },
          ...(eventIds.length > 0
            ? {
                event: {
                  in: eventIds,
                },
              }
            : {}),
        },
      })
    } else {
      // Find tickets owned by the user
      ticketsQuery = await payload.find({
        collection: 'tickets',
        where: {
          user: {
            equals: userId,
          },
          'giftInfo.isGifted': {
            equals: false,
          },
          ...(ticketStatus ? { status: { equals: ticketStatus } } : {}),
          ...(eventIds.length > 0
            ? {
                event: {
                  in: eventIds,
                },
              }
            : {}),
        },
        page,
        limit,
        sort: '-createdAt', // Sort by latest first
        depth: 1, // We only need basic event info since we already filtered them
      })
    }

    return NextResponse.json({ data: ticketsQuery })
  } catch (err) {
    const error = err as Error
    console.error('Error while fetching user tickets:', error)
    return NextResponse.json(
      {
        message: 'Failed to fetch tickets',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
