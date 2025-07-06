import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { sql } from '@payloadcms/db-postgres/drizzle'
import { setDateFrom } from '@/app/(affiliate)/utils/setDateFrom'

type eventMetricsRow = {
  event_id: number
  title: string
  gross_revenue: number
  net_revenue: number
}

export async function GET(req: NextRequest) {
  try {
    const dateFrom = await setDateFrom(req)

    //Authenticate user
    const userRequest = await authorizeApiRequest()

    //Initialize Payload
    const payload = await getPayload()

    //SQL query to get gross revenue
    const result = await payload.db.drizzle.execute(sql`
    WITH metrics_base AS (
        SELECT DISTINCT
        oi.order_id,
        oi.event_id,
        o.total,
        e.vat_percentage
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN events e ON oi.event_id = e.id
        WHERE o.status = 'completed'
            AND o.affiliate_affiliate_user_id = ${userRequest.id}
            ${dateFrom ? sql`AND o.created_at >= ${dateFrom.toISOString()}` : sql``}
            )
    SELECT
        l.title,
        m.event_id,
        SUM(m.total) AS gross_revenue,
        ROUND( SUM(m.total / (1 + (m.vat_percentage / 100))) ) AS net_revenue
        FROM metrics_base m
        JOIN events_locales l ON m.event_id = l._parent_id
        GROUP BY m.event_id, m.vat_percentage, l.title;
    `)
    const rows = result.rows as unknown as eventMetricsRow[]

    const revenueByEvents = rows.map((row) => ({
      eventID: row.event_id,
      eventTitle: row.title,
      grossRevenue: row.gross_revenue,
      netRevenue: row.net_revenue,
    }))

    //Return the response
    return NextResponse.json(revenueByEvents)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'An error occured' }, { status: 500 })
  }
}
