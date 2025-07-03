import { NextRequest, NextResponse } from 'next/server';

import { getPayload } from '@/payload-config/getPayloadConfig';
import { sql } from '@payloadcms/db-postgres/drizzle';
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest';
import { getDateRangeFromTimeRange } from '@/app/(affiliate)/utils/getDateRangeFromTimeRange';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const userRequest = await authorizeApiRequest();
    const payload = await getPayload();

    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);

    const results = await payload.db.drizzle.execute(sql`
      WITH revenue_data AS (
        SELECT
          COALESCE(affiliate_links.utm_params_source, 'Unknown') AS source,
          COALESCE(affiliate_links.utm_params_campaign, 'Unknown') AS campaign,
          SUM(orders.total) as revenue
        FROM orders
        INNER JOIN affiliate_links ON orders.affiliate_affiliate_link_id = affiliate_links.id
        WHERE orders.created_at >= ${startDate} AND orders.created_at <= ${endDate}
          AND affiliate_links.affiliate_user_id = ${userRequest.id}
        GROUP BY source, campaign
      ),
      total_revenue AS (
        SELECT SUM(revenue) AS total FROM revenue_data
      ),
      source_totals AS (
        SELECT
          source,
          SUM(revenue) as revenue,
          ROUND(
            CASE
              WHEN total_revenue.total > 0 THEN (SUM(revenue) * 100.0 / total_revenue.total)
              ELSE 0
            END, 2
          ) as percentage,
          ROW_NUMBER() OVER (ORDER BY SUM(revenue) DESC) AS rank
        FROM revenue_data
        CROSS JOIN total_revenue
        GROUP BY source, total_revenue.total
      ),
      campaign_totals AS (
        SELECT
          campaign,
          SUM(revenue) as revenue,
          ROUND(
            CASE
              WHEN total_revenue.total > 0 THEN (SUM(revenue) * 100.0 / total_revenue.total)
              ELSE 0
            END, 2
          ) as percentage,
          ROW_NUMBER() OVER (ORDER BY SUM(revenue) DESC) AS rank
        FROM revenue_data
        CROSS JOIN total_revenue
        GROUP BY campaign, total_revenue.total
      )
      SELECT 'source' as type, source as name, revenue, percentage, rank
      FROM source_totals 
      WHERE rank <= 5
      UNION ALL
      SELECT 'campaign' as type, campaign as name, revenue, percentage, rank
      FROM campaign_totals 
      WHERE rank <= 5
      ORDER BY type, rank
    `) as { rows: any[] };

    const bySource = results.rows
      .filter(row => row.type === 'source')
      .map(row => ({
        source: row.name,
        revenue: Number(row.revenue || 0),
        percentage: Number(row.percentage || 0)
      }));

    const byCampaign = results.rows
      .filter(row => row.type === 'campaign')
      .map(row => ({
        campaign: row.name,
        revenue: Number(row.revenue || 0),
        percentage: Number(row.percentage || 0)
      }));

    return NextResponse.json({
      success: true,
      data: {
        bySource,
        byCampaign
      },
    })

  } catch (error) {
    console.error('Error fetching affiliate revenue analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.'
      },
      { status: 500 }
    )
  }
}