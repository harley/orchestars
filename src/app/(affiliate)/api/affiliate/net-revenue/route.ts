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
    
         // SQL query to get net revenue
         const result = await payload.db.drizzle.execute(sql`
          SELECT SUM("total") AS net_revenue
          FROM "orders"
          WHERE "status" = 'completed'
            AND "affiliate_affiliate_user_id" = ${userRequest.id}
            ${dateFrom ? sql`AND "created_at" >= ${dateFrom.toISOString()}` : sql``}
        `)
        const netRevenue = (result as {rows: any[]}).rows[0]?.net_revenue ?? 0
        
        //Return response
        return NextResponse.json({ netRevenue })
      } catch (err) {
        console.error('Error calculating net revenue:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
      }
}