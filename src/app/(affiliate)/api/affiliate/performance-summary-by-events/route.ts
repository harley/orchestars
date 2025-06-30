import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { sql } from '@payloadcms/db-postgres/drizzle'

type PerformanceSummary = {
  event_id: number
  title: string
  event_location: string
  status: string
  total_points: number
  total_revenue: number
  total_tickets_sold: number
  target_link: string
  schedule_dates: Array<Date>
  click_count: number
  min_price: number
  max_price: number
}
export async function GET(req: NextRequest) {
  try {
    //Authenticate user
    const userRequest = await authorizeApiRequest() // returns { id, email }

    //Initialize Payload
    const payload = await getPayload()

    //SQL query to get gross revenue
    const result = await payload.db.drizzle.execute(sql`
    WITH base_metrics AS (
      SELECT 
        r.event_id,
        MAX(l.title) AS title,
        MAX(l.event_location) AS event_location,
        r.affiliate_user_id,
        e.status,
        r.total_points,
        r.total_revenue,
        r.total_tickets_sold,
        MAX(lk.id) AS aff_link_id,
        MAX(lk.target_link) AS target_link,
        array_agg(DISTINCT s.date ORDER BY s.date) AS schedule_dates
      FROM public.event_affiliate_user_ranks r
      JOIN events_locales l ON l._parent_id = r.event_id
      JOIN events_schedules s ON s._parent_id = r.event_id
      JOIN affiliate_links lk ON lk.event_id = r.event_id
      JOIN events e ON e.id = r.event_id
      WHERE r.affiliate_user_id = ${userRequest.id}
      GROUP BY r.event_id, r.affiliate_user_id, e.status, r.total_points, r.total_revenue, r.total_tickets_sold
    ),
    with_clicks AS (
      SELECT 
        bm.*,
        COUNT(c.id) AS click_count
      FROM base_metrics bm
      LEFT JOIN affiliate_click_logs c ON bm.aff_link_id = c.affiliate_link_id
      GROUP BY bm.event_id, bm.title, bm.event_location, bm.affiliate_user_id, bm.status, bm.total_points, bm.total_revenue, bm.total_tickets_sold, bm.aff_link_id, bm.target_link, bm.schedule_dates
    )
    SELECT 
      wc.event_id,
      wc.title,
      wc.event_location,
      wc.status,
      wc.total_points,
      wc.total_revenue,
      wc.total_tickets_sold,
      wc.target_link,
      wc.schedule_dates,
      wc.click_count,
      MIN(o.price) AS min_price,
      MAX(o.price) AS max_price
    FROM with_clicks wc
    LEFT JOIN order_items o ON o.event_id = wc.event_id
    GROUP BY 
      wc.event_id,
      wc.title,
      wc.event_location,
      wc.status,
      wc.total_points,
      wc.total_revenue,
      wc.total_tickets_sold,
      wc.target_link,
      wc.schedule_dates,
      wc.click_count
    ORDER BY wc.event_id DESC;
    `)

    const performanceSummaryArray = (result.rows as PerformanceSummary[]).map((row) => {
      let status = ''
      if (row.status === 'published_open_sales') {
        status = 'Active'
      } else if (row.status === 'published_upcoming') {
        status = 'Upcoming'
      } else if (row.status === 'completed') {
        status = 'Completed'
      } else {
        status = 'Unknown'
      }
      return {
        eventID: row.event_id,
        eventName: row.title,
        location: row.event_location,
        eventStatus: status,
        totalPoints: row.total_points,
        affLink: row.target_link,
        ticketNum: row.total_tickets_sold,
        totalRevenue: row.total_revenue,
        clickNum: row.click_count,
        minPrice: row.min_price,
        maxPrice: row.max_price,
        schedules: row.schedule_dates,
      }
    })

    //Return the response
    return NextResponse.json(performanceSummaryArray)
  } catch (err) {
    console.error('An error occurred while processing the request:', err)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
