import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { extractJWT } from '@/utilities/jwt'
import { JWT_USER_SECRET } from '@/config/jwt'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('authToken')

    if (!authToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify the JWT token
    const userRequest = await extractJWT(authToken.value, JWT_USER_SECRET)
    if (!userRequest) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = userRequest.id
    const payload = await getPayload()

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10) || 1
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10
    const timeStatus = searchParams.get('timeStatus') // 'upcoming', 'past', or undefined for all

    // Get current date for comparison
    const now = new Date()

    // First find relevant events based on date filter
    const eventsQuery = await payload.find({
      collection: 'events',
      where: {
        ...(timeStatus === 'upcoming'
          ? {
              startDatetime: { greater_than: now.toISOString() },
            }
          : timeStatus === 'past'
            ? {
                endDatetime: { less_than: now.toISOString() },
              }
            : {}),
      },
      select: {},
      depth: 0,
      limit: 1000,
    })

    const eventIds = eventsQuery.docs.map((event) => event.id)

    // Then find tickets for these events
    const ticketsQuery = await payload.find({
      collection: 'tickets',
      where: {
        user: {
          equals: userId,
        },
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

    return NextResponse.json({ data: ticketsQuery })
  } catch (err) {
    const error = err as Error
    console.error('Error while fetching user tickets:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch tickets',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
