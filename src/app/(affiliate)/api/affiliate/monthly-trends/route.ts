
import { NextRequest, NextResponse } from "next/server"; 
import { authorizeApiRequest } from "@/app/(affiliate)/utils/authorizeApiRequest";
import { getPayload } from '@/payload-config/getPayloadConfig'; 
import { sql } from '@payloadcms/db-postgres/drizzle'

export async function GET(re: NextRequest){ //Why do we need to export
    try{
    // Authenticate user
    const authorizeUser = await authorizeApiRequest();

    // Initialize Payload
    const payload = await getPayload();

    // Query monthly data with SQL
    const result = await payload.db.drizzle.execute(sql`
        WITH order_base AS (
          SELECT 
            id,
            DATE_TRUNC('month', "created_at") AS month,
            "total",
            "total_before_discount",
            "total_discount"
          FROM "orders"
          WHERE "status" = 'completed'
            AND "created_at" >= DATE_TRUNC('month', NOW()) - INTERVAL '6 months'
            AND "affiliate_affiliate_user_id" = ${authorizeUser.id}
        ), ticket_counts AS (
          SELECT 
            "order_id",
            COUNT(*) AS ticket_count
          FROM "order_items"
          GROUP BY "order_id"
        )
        SELECT 
          o.month,
          COUNT(*) AS order_count,
          COALESCE(SUM(t.ticket_count), 0) AS tickets,
          SUM(o."total") AS net_revenue,
          SUM(o."total_before_discount") AS gross_revenue,
          SUM(o."total_discount") AS total_discount
        FROM order_base o
        LEFT JOIN ticket_counts t ON o.id = t.order_id
        GROUP BY o.month
        ORDER BY o.month ASC;
      `);
  

    // Transform monthly data to match expected format
    type RevenueRow = {
        month: string
        gross_revenue: number
        net_revenue: number
        order_count: number
        tickets: number
      }
      
      const monthlyRevenue = (result.rows as RevenueRow[]).map((row) => {
        const date = new Date(row.month)
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
    return NextResponse.json({monthlyRevenue}); 
    }

    catch(err){
        console.error(err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}