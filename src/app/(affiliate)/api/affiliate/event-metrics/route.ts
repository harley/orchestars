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
        SELECT
        o.id AS order_id,
        COUNT(i.id) AS num_ticket,
        o.total AS net_revenue,
        o.total_before_discount AS gross_revenue
        FROM orders o
        LEFT JOIN order_items i ON o.id = i.order_id
        WHERE o.affiliate_affiliate_user_id = ${userRequest.id}
        GROUP BY o.id, o.total, o.total_before_discount
    )
    SELECT
        SUM(num_ticket) AS num_ticket,
        SUM(gross_revenue) AS gross_revenue,
        SUM(net_revenue) AS net_revenue
    FROM metrics_base;
    `)
    const eventMetrics = {
      ticketNumber: 0,
      grossRevenue: 0,
      netRevenue: 0,
    }
    eventMetrics.ticketNumber = Number(result.rows[0]?.num_ticket ?? 0)
    eventMetrics.grossRevenue = Number(result.rows[0]?.gross_revenue ?? 0)
    eventMetrics.netRevenue = Number(result.rows[0]?.net_revenue ?? 0)

    //Return the response
    return NextResponse.json(eventMetrics)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
