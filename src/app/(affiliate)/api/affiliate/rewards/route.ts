import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { sql } from '@payloadcms/db-postgres/drizzle'
import { getDateRangeFromTimeRange } from '@/app/(affiliate)/utils/getDateRangeFromTimeRange'

export async function GET(req: NextRequest) {
  try {
    //Authenticate user
    const userRequest = await authorizeApiRequest() // returns { id, email }

    //Initialize Payload
    const payload = await getPayload()

    const { searchParams } = new URL(req.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange)

    //SQL query to get gross revenue: order nao cung update sang ben aff user rank a? U dung roi ma
    const result = await payload.db.drizzle.execute(sql`   
        SELECT 
            total_commission_earned,
            total_tickets_rewarded
        FROM affiliate_user_ranks
        WHERE affiliate_user_id = ${userRequest.id};
    `)
    const rewardMetrics = {
      commission: 0,
      tickets: 0,
    }
    rewardMetrics.commission = Number(
      (result as { rows: any[] }).rows[0]?.total_commission_earned ?? 0,
    )
    rewardMetrics.tickets = Number((result as { rows: any[] }).rows[0]?.total_tickets_rewarded ?? 0)

    //Return the response
    return NextResponse.json({
      success: true,
      data: rewardMetrics,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
