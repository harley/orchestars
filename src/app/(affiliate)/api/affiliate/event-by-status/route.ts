import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { sql } from '@payloadcms/db-postgres/drizzle'

export async function GET(req: NextRequest) {
  try {
    //Initialize Payload
    const payload = await getPayload()

    //SQL query to get gross revenue
    const result = await payload.db.drizzle.execute(sql`
        SELECT 
	        status
        FROM events;
        `)
    const eventCountByStatus = {
      upcoming: 0,
      active: 0,
      total: 0,
    }
    result.rows.forEach((row) => {
      eventCountByStatus.total += 1
      if (row.status === 'published_upcoming') {
        eventCountByStatus.upcoming += 1
      } else if (row.status === 'published_open_sales') {
        eventCountByStatus.active += 1
      }
    })
    //Return the response
    return NextResponse.json(eventCountByStatus)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
