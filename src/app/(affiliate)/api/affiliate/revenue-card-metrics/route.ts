import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { sql } from '@payloadcms/db-postgres/drizzle'
import { setDateFrom } from '@/app/(affiliate)/utils/setDateFrom'

type CardMetrics = {
  gross_revenue: number
  net_revenue: number
  average_order_value: number
  num_order: number
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
  ),

  metrics_1 AS (
    SELECT
      event_id,
      COUNT(DISTINCT order_id) AS num_orders,
      SUM(total) AS gross_revenue_by_event,
      vat_percentage,
      ROUND( SUM(total / (1 + (vat_percentage / 100))) ) AS net_revenue
    FROM metrics_base
    GROUP BY event_id, vat_percentage
  )

  SELECT
    SUM(num_orders) AS num_order,
    SUM(gross_revenue_by_event) AS gross_revenue,
    SUM(net_revenue) AS net_revenue,
    ROUND(SUM(net_revenue) * 1.0 / NULLIF(SUM(num_orders), 0)) AS average_order_value
  FROM metrics_1;
    `)
    const data = (result as { rows: any[] }).rows[0] as CardMetrics
    const metrics = {
      grossRevenue: data.gross_revenue,
      netRevenue: data.net_revenue,
      avgOrderVal: data.average_order_value,
      numOrder: data.num_order,
    }

    //Return the response
    return NextResponse.json(metrics)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'An error occured' }, { status: 500 })
  }
}
