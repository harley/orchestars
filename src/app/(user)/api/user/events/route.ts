import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { sql } from '@payloadcms/db-postgres'
import { EVENT_STATUS } from '@/collections/Events/constants/status'
import { authorizeApiRequest } from '@/app/(user)/utils/authorizeApiRequest'

export async function GET(req: NextRequest) {
  try {
    const userRequest = await authorizeApiRequest()

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