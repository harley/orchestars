import { NextRequest, NextResponse } from 'next/server'

import { getPayload } from '@/payload-config/getPayloadConfig'
import { sql } from '@payloadcms/db-postgres/drizzle'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { getDateRangeFromTimeRange } from '@/app/(affiliate)/utils/getDateRangeFromTimeRange'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const userRequest = await authorizeApiRequest()
    const payload = await getPayload()

    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange)

    const results = await payload.db.drizzle.execute(sql`
      SELECT
        COUNT(DISTINCT affiliate_click_logs.id) AS clicks,
        COUNT(DISTINCT orders.id) AS orders,
        (SELECT SUM(orders.total)
          FROM orders
          INNER JOIN affiliate_links ON orders.affiliate_affiliate_link_id = affiliate_links.id
          WHERE affiliate_links.affiliate_user_id = ${userRequest.id}
            AND affiliate_links.status = 'active'
            AND orders.created_at >= ${startDate} 
            AND orders.created_at <= ${endDate}
            AND orders.status = 'completed'
        ) AS total_revenue,
        COUNT(DISTINCT tickets.id) AS total_tickets,

        -- Calculate metrics
        CASE
          WHEN COUNT(DISTINCT affiliate_click_logs.id) > 0 THEN
            ROUND((COUNT(DISTINCT orders.id)::decimal / COUNT(DISTINCT affiliate_click_logs.id)) * 100, 2)
          ELSE 0
        END as conversion_rate,
        
        CASE
          WHEN COUNT(DISTINCT orders.id) > 0 THEN
            ROUND(COUNT(DISTINCT tickets.id)::decimal / COUNT(DISTINCT orders.id), 1)
          ELSE 0 
        END as average_tickets_per_order
      
      FROM affiliate_links
      LEFT JOIN affiliate_click_logs ON affiliate_click_logs.affiliate_link_id = affiliate_links.id
        AND affiliate_click_logs.created_at >= ${startDate} AND affiliate_click_logs.created_at <= ${endDate}
      LEFT JOIN orders ON orders.affiliate_affiliate_link_id = affiliate_links.id
        AND orders.created_at >= ${startDate} AND orders.created_at <= ${endDate}
        AND orders.status = 'completed'
      LEFT JOIN tickets ON tickets.order_id = orders.id
      WHERE affiliate_links.affiliate_user_id = ${userRequest.id}
        AND affiliate_links.status = 'active'
    `) as { rows: any[] }

    return NextResponse.json({
      success: true,
      data: 
        {
          clicks: Number(results?.rows[0]?.clicks) ?? 0,
          orders: Number(results?.rows[0]?.orders) ?? 0,
          overallConversionRate: Number(results?.rows[0]?.conversion_rate) ?? 0,
          ticketsIssued: Number(results?.rows[0]?.total_tickets) ?? 0,
          averageTicketsPerOrder: Number(results?.rows[0]?.average_tickets_per_order) ?? 0,
          grossRevenue: Number(results?.rows[0]?.total_revenue) ?? 0,
          commission: 0,
          commissionRate: 0,
        }
      ,
    })
  } catch (error) {
    console.error('Error fetching affiliate performance data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.',
      },
      { status: 500 },
    )
  }
}
