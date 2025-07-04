import { NextRequest, NextResponse } from 'next/server'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { sql } from '@payloadcms/db-postgres/drizzle'
import { setDateFrom } from '@/app/(affiliate)/utils/setDateFrom'

type RevenueRow = {
  month: string
  gross_revenue: number
  net_revenue: number
  order_count: number
  tickets: number
}
export async function GET(req: NextRequest) {
  try {
    const dateFrom = await setDateFrom(req)

    // Authenticate user
    const authorizeUser = await authorizeApiRequest()

    // Initialize Payload
    const payload = await getPayload()

    // Query monthly data with SQL
    // Understand SQL WITH, JOIN, GROUP BY, COALESCE + Drizzle
    const result = await payload.db.drizzle.execute(sql`
    WITH metrics_base AS (
    SELECT DISTINCT
      oi.order_id,
      oi.event_id,
      DATE_TRUNC('month', o.created_at) AS month,
      o.total,
      e.vat_percentage
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN events e ON oi.event_id = e.id
    WHERE o.status = 'completed'
      AND o.affiliate_affiliate_user_id = ${authorizeUser.id}
      ${dateFrom ? sql`AND o.created_at >= ${dateFrom.toISOString()}` : sql``}
  ),

  ticket_counts AS (
    SELECT
      order_id,
      COUNT(*) AS ticket_count
    FROM order_items
    GROUP BY order_id
  ),

  metrics_1 AS (
    SELECT
      mb.month,
      COUNT(DISTINCT mb.order_id) AS order_count,
      SUM(mb.total) AS gross_revenue,
      ROUND( SUM(mb.total / (1 + (mb.vat_percentage / 100))) ) AS net_revenue,
      COALESCE(SUM(tc.ticket_count), 0) AS tickets
    FROM metrics_base mb
    LEFT JOIN ticket_counts tc ON mb.order_id = tc.order_id
    GROUP BY mb.month
  )

  SELECT
    month,
    gross_revenue,
    net_revenue,
    order_count,
    tickets
  FROM metrics_1
  ORDER BY month ASC;
      `)

    // Transform monthly data to match expected format
    const monthlyRevenue = (result as { rows: RevenueRow[] }).rows.map((row) => {
      const date = new Date(row.month) //TS Date object
      const month = date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      return {
        month,
        gross: row.gross_revenue,
        net: row.net_revenue,
        commission: row.net_revenue * 0.1,
        orders: row.order_count,
        tickets: row.tickets,
      }
    })

    // Return the response
    return NextResponse.json({ monthlyRevenue })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'An error occured' }, { status: 500 })
  }
}
