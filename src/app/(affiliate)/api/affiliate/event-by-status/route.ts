import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { sql } from '@payloadcms/db-postgres/drizzle'

type statusRow = {
  status: string
  count: number
}

export async function GET(_req: NextRequest) {
  try {
    //Authenticate user
    const userRequest = await authorizeApiRequest()

    //Initialize Payload
    const payload = await getPayload()

    //SQL query to get event count by status
    const result = await payload.db.drizzle.execute(sql`
      SELECT
        e.status,
        COUNT (DISTINCT e.id)
      FROM events e
      JOIN event_affiliate_user_ranks r ON e.id = r.event_id
      WHERE r.affiliate_user_id = ${userRequest.id}
      GROUP BY e.status;
        `)
    const eventCountByStatus = {
      upcoming: 0,
      active: 0,
      total: 0,
    }
    const rows = (result as {rows: any[]}).rows as statusRow[]
    rows.forEach((row: statusRow) => {
      eventCountByStatus.total += Number(row.count)
      if (row.status === 'published_upcoming') {
        eventCountByStatus.upcoming += Number(row.count)
      } else if (row.status === 'published_open_sales') {
        eventCountByStatus.active += Number(row.count)
      }
    })
    //Return the response
    return NextResponse.json(eventCountByStatus)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
