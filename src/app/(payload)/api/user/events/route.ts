import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { extractJWT } from '@/utilities/jwt'
import { JWT_USER_SECRET } from '@/config/jwt'
import { sql } from '@payloadcms/db-postgres'
import { EVENT_STATUS } from '@/collections/Events/constants/status'

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

    // Get query parameters for pagination
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10) || 1
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10

    // Get unique event IDs directly from the database
    const eventIdsResult = await payload.db.drizzle.execute(sql`
      SELECT DISTINCT event_id 
      FROM tickets 
      WHERE user_id = ${userId}
      AND event_id IS NOT NULL
      ORDER BY event_id DESC
    `)

    const eventIds = ((eventIdsResult as { rows: any[] }).rows || []).map(row => row.event_id)

    if (!eventIds.length) {
      return NextResponse.json({ 
        data: {
          docs: [],
          totalDocs: 0,
          page,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        }
      })
    }

    // Then fetch the events
    const eventsQuery = await payload.find({
      collection: 'events',
      where: {
        id: {
          in: eventIds,
        },
        status: {
          not_equals: EVENT_STATUS.draft.value,
        }
      },
      page,
      limit,
      sort: '-startDatetime', // Sort by start date, newest first
      depth: 1, // Include basic relationships
    })

    return NextResponse.json({ data: eventsQuery })
  } catch (err) {
    const error = err as Error
    console.error('Error while fetching user events:', error)
    return NextResponse.json(
      {
        message: 'Failed to fetch events',
        details: error.message,
      },
      { status: 500 },
    )
  }
}