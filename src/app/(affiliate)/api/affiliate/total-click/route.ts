import { NextRequest, NextResponse } from 'next/server'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { sql } from '@payloadcms/db-postgres'
import { setDateFrom } from '@/app/(affiliate)/utils/setDateFrom'

export async function GET(req: NextRequest) {
  try {
    const dateFrom = await setDateFrom(req)

    // Authenticate user
    const userRequest = await authorizeApiRequest() // returns { id, email }

    // Initialize Payload
    const payload = await getPayload()

    // SQL query to get total clicks
    const result = await payload.db.drizzle.execute(sql`
          SELECT 
            COUNT(*) AS total_click
          FROM "affiliate_click_logs"
          WHERE "affiliate_user_id" = ${userRequest.id}
            ${dateFrom ? sql`AND "created_at" >= ${dateFrom.toISOString()}` : sql``}
        `)
    const totalClick = result.rows[0]?.total_click ?? 0

    // Return response
    return NextResponse.json(totalClick)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'An error occured' }, { status: 500 })
  }
}
