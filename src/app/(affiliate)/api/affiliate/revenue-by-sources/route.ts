import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { sql } from '@payloadcms/db-postgres/drizzle'
import { setDateFrom } from '@/app/(affiliate)/utils/setDateFrom'

type sourceMetricsRow = {
  source: string
  gross_revenue: number
  net_revenue: number
}

export async function GET(req: NextRequest) {
  try {
    const dateFrom = await setDateFrom(req)

    //Authenticate user
    const userRequest = await authorizeApiRequest() // returns { id, email }

    //Initialize Payload
    const payload = await getPayload()

    //SQL query to get gross revenue
    const result = await payload.db.drizzle.execute(sql`
         WITH metrics_base as (SELECT DISTINCT
        oi.order_id,
        oi.event_id,
        o.total,
        e.vat_percentage, 
        al.utm_params_source
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN events e ON oi.event_id = e.id
        JOIN affiliate_links al ON o.affiliate_affiliate_link_id = al.id
        WHERE o.status = 'completed'
        AND o.affiliate_affiliate_user_id = ${userRequest.id}
        ${dateFrom ? sql`AND o.created_at >= ${dateFrom.toISOString()}` : sql``}
          )
    SELECT
        m.utm_params_source as source,
        SUM(m.total) AS gross_revenue,
        ROUND( SUM(m.total / (1 + (m.vat_percentage / 100))) ) AS net_revenue
        FROM metrics_base m
        GROUP BY m.utm_params_source;
         `)
    const revenueBySource = (result as { rows: sourceMetricsRow[] }).rows.map((row) => {
      return {
        source: row.source,
        grossRevenue: row.gross_revenue,
        netRevenue: row.net_revenue,
      }
    })

    //Return the response
    return NextResponse.json(revenueBySource)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'An error occured' }, { status: 500 })
  }
}
