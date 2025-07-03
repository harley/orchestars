import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { sql } from '@payloadcms/db-postgres/drizzle'

export async function GET(req: NextRequest) {
  try {
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
          mb.event_id,
          COUNT(DISTINCT mb.order_id) AS num_orders,
          SUM(mb.total) AS gross_revenue_by_event,
          ROUND(SUM(mb.total / (1 + (mb.vat_percentage / 100)))) AS net_revenue,
          COALESCE(SUM(tc.ticket_count), 0) AS ticket_number
        FROM metrics_base mb
        LEFT JOIN ticket_counts tc ON mb.order_id = tc.order_id
        GROUP BY mb.event_id, mb.vat_percentage
      )

      SELECT
        SUM(gross_revenue_by_event) AS gross_revenue,
        SUM(net_revenue) AS net_revenue,
        SUM(ticket_number) AS num_ticket
      FROM metrics_1;
    `)
    const eventMetrics = {
      ticketNumber: 0,
      grossRevenue: 0,
      netRevenue: 0,
    }
    eventMetrics.ticketNumber = Number((result as {rows: any[]}).rows[0]?.num_ticket ?? 0)
    eventMetrics.grossRevenue = Number((result as {rows: any[]}).rows[0]?.gross_revenue ?? 0)
    eventMetrics.netRevenue = Number((result as {rows: any[]}).rows[0]?.net_revenue ?? 0)

    //Return the response
    return NextResponse.json(eventMetrics)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
