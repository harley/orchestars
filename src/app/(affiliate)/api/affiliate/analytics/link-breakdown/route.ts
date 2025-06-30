import { NextRequest, NextResponse } from 'next/server';

import { getPayload } from '@/payload-config/getPayloadConfig';
import { sql } from '@payloadcms/db-postgres/drizzle';
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest';
import { getDateRangeFromTimeRange } from '@/app/(affiliate)/utils/getDateRangeFromTimeRange';
import { getLinkId } from '@/app/(affiliate)/utils/getLinkId';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const sortBy = searchParams.get('sortBy') || 'revenue';
    const page = parseInt(searchParams.get('page') || '1') || 1;
    const limit = parseInt(searchParams.get('limit') || '5') || 5;
    const userRequest = await authorizeApiRequest();
    const payload = await getPayload();

    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);

    const results = await payload.db.drizzle.execute(sql`
      WITH link_performance AS (
        SELECT
          affiliate_links.id,
          COALESCE(affiliate_links.name, 'Unamed Link') AS name,
          COALESCE(affiliate_links.utm_params_source, 'Unknown') AS utm_source,
          COALESCE(affiliate_links.utm_params_campaign, 'Unknown') AS utm_campaign,

          -- Count clicks for this link
          (SELECT COUNT(*)
            FROM affiliate_click_logs
            WHERE affiliate_click_logs.affiliate_link_id = affiliate_links.id
              AND affiliate_click_logs.created_at >= ${startDate}
              AND affiliate_click_logs.created_at <= ${endDate}
          ) AS clicks,
          
          -- Count orders for this link
          (SELECT COUNT(*)
            FROM orders
            WHERE orders.affiliate_affiliate_link_id = affiliate_links.id
              AND orders.created_at >= ${startDate}
              AND orders.created_at <= ${endDate}
          ) AS orders,

          -- Calculate gross revenue for this link
          (SELECT SUM(orders.total)
            FROM orders
            WHERE orders.affiliate_affiliate_link_id = affiliate_links.id
              AND orders.created_at >= ${startDate}
              AND orders.created_at <= ${endDate}
          ) AS gross_revenue,

          -- Calculate tickets for this link
          (SELECT COUNT(*)
            FROM tickets t
            INNER JOIN orders o ON t.order_id = o.id
            WHERE o.affiliate_affiliate_link_id = affiliate_links.id
              AND o.created_at >= ${startDate}
              AND o.created_at <= ${endDate}
          ) AS tickets_issued

        FROM affiliate_links
        WHERE affiliate_links.affiliate_user_id = ${userRequest.id}
      ),

      calculated_metrics AS (
        SELECT
          *,

          -- Calculate conversion rate
          CASE
            WHEN clicks > 0 THEN ROUND((orders::numeric / clicks) * 100, 2)
            ELSE 0
          END AS conversion_rate,

          -- Calculate net revenue
          gross_revenue as net_revenue,

          -- Calculate commission
          '0' as commission
        
        FROM link_performance
      ),

      sorted_results AS(
        SELECT
          *,
          ROW_NUMBER() OVER(
            ORDER BY
              CASE WHEN ${sortBy} = 'revenue' THEN gross_revenue END DESC,
              CASE WHEN ${sortBy} = 'clicks' THEN clicks END DESC,
              CASE WHEN ${sortBy} = 'orders' THEN orders END DESC,
              CASE WHEN ${sortBy} = 'conversion' THEN conversion_rate END DESC,
              id -- stable sort
          ) AS row_num,
          COUNT(*) OVER() AS total_count
        FROM calculated_metrics
      )

      SELECT
        id,
        name,
        utm_source,
        utm_campaign,
        clicks,
        orders,
        tickets_issued,
        conversion_rate,
        gross_revenue,
        net_revenue,
        commission,
        total_count
      FROM sorted_results
      WHERE row_num BETWEEN ${(page - 1) * limit + 1} AND ${page * limit}
      ORDER BY row_num
    `)

    return NextResponse.json({
      success: true,
      data: results.rows.map(row => ({
        name: row.name,
        utmSource: row.utm_source,
        utmCampaign: row.utm_campaign,
        clicks: Number(row.clicks),
        orders: Number(row.orders),
        ticketsIssued: Number(row.tickets_issued),
        conversionRate: Number(row.conversion_rate),
        grossRevenue: Number(row.gross_revenue),
        netRevenue: Number(row.net_revenue),
        commission: Number(row.commission),
        // totalCount: Number(row.total_count),
      })),
      pagination: {
        page: page,
        limit: limit,
        totalPages: Math.ceil(results.rowCount / limit),
        totalDocs: results.rowCount,
        hasNextPage: page < Math.ceil(results.rowCount / limit),
        hasPrevPage: page > 1,
      }
    })

  } catch (error) {
    console.error('Error fetching affiliate performance breakdown data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.',
      },
      { status: 500 },
    )
  }
}