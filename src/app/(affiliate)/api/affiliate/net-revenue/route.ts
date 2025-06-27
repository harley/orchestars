import { NextRequest, NextResponse } from "next/server";
import { authorizeApiRequest } from "@/app/(affiliate)/utils/authorizeApiRequest";
import { getPayload } from '@/payload-config/getPayloadConfig'; 

export async function GET(re: NextRequest){
    try{
    // Step 1: Authenticate user
    const authorizeUser = await authorizeApiRequest();

    // Step 2: Initialize Payload
    const payload = await getPayload();

    // Step 3: Query Payload for completed orders made via this affiliate
    const orderQueryResult = await payload.find({ 
        collection: 'orders',
        where: {
            'status': { equals: 'completed'},
            'affiliate.affiliateUser': {equals: authorizeUser.id}
        },
        limit: 1000,
        depth: 0,
    })

    // Step 4: Sum up net revenue (total)
    const netRevenue = orderQueryResult.docs.reduce((sum, order) => { return sum + (order.total || 0)}, 0);

    // Step 5: Return the response
    return NextResponse.json({netRevenue}); 

    }
    catch(err){
        return NextResponse.json({ error: 'Server error' }, { status: 500 }) 
    }
}