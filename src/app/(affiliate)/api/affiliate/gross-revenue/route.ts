import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'

export async function GET(req: NextRequest) {
  try {
    // Step 1: Authenticate user
    const userRequest = await authorizeApiRequest() // returns { id, email }

    // Step 2: Initialize Payload
    const payload = await getPayload()

    // Step 3: Query Payload for completed orders made via this affiliate
    const orderQueryResult = await payload.find({
      collection: 'orders',
      where: {
        'status': { equals: 'completed' },
        'affiliate.affiliateUser': { equals: userRequest.id },
      },
      limit: 1000, 
      depth: 0,
    }) 

    // Step 4: Sum up total revenue
    const totalRevenue = orderQueryResult.docs.reduce((sum, order) => {
      return sum + (order.totalBeforeDiscount || 0) 
    }, 0) 

    // Step 5: Return the response
    return NextResponse.json({ totalRevenue })

  } catch (err) {
    console.error('Error calculating affiliate revenue:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

