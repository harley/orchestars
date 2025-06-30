import { NextRequest, NextResponse } from "next/server"; 
import { authorizeApiRequest } from "@/app/(affiliate)/utils/authorizeApiRequest";
import { getPayload } from '@/payload-config/getPayloadConfig'; 
import { sql } from "@payloadcms/db-postgres"; 


export async function GET(req: NextRequest){
    try {
        // Get time range param
        const { searchParams } = new URL(req.url);
        const timeRange = searchParams.get('timeRange');
    
        // Set dateFrom based on timeRange
        let dateFrom: Date | undefined
        if (timeRange === '6m') {
          dateFrom = new Date()
          dateFrom.setMonth(dateFrom.getMonth() - 6)
        } else if (timeRange === '3m') {
          dateFrom = new Date()
          dateFrom.setMonth(dateFrom.getMonth() - 3)
        } else if (timeRange === '1m') {
          dateFrom = new Date()
          dateFrom.setDate(dateFrom.getDate() - 30)
        } else if (timeRange === '1y') {
          dateFrom = new Date()
          dateFrom.setMonth(dateFrom.getMonth() - 12)
        }
    
        // Authenticate user
        const userRequest = await authorizeApiRequest() // returns { id, email }
    
        // Initialize Payload
        const payload = await getPayload()
    
         // SQL query to get average order value and number of orders
         const result = await payload.db.drizzle.execute(sql`
          SELECT 
            AVG("total") AS average_order_value,
            COUNT(*) AS num_order
          FROM "orders"
          WHERE "status" = 'completed'
            AND "affiliate_affiliate_user_id" = ${userRequest.id}
            ${dateFrom ? sql`AND "created_at" >= ${dateFrom.toISOString()}` : sql``}
        `)
        const avgOrderValue = result.rows[0]?.average_order_value ?? 0
        const numOrder = result.rows[0]?.num_order ?? 0

        //Return response
        return NextResponse.json({ avgOrderValue, numOrder })
      } catch (err) {
        console.error('Error fetching average order value and/or number of orders:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
      }
}