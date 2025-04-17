// POST /api/checkin-app/events
// use token to authorize user
// get all events with event schedule 

import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers as getHeaders } from 'next/headers'
// import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
// import { getClientSideURL } from '@/utilities/getURL'

export async function GET() {
    // Get authorization header
    const payload = await getPayload({ config })

    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized - Invalid admin user' },
            { status: 401 },
        )
    }

    // Get all events with event schedule
    const events = await payload.find({
        collection: 'events',
        where: {
            status: {
                equals: 'published_open_sales',
            },  
    }})

    if (!events.docs?.length) {
        return NextResponse.json({ error: 'No event is found' }, { status: 404 })
    }
   

    return NextResponse.json({
          events
        }, { status: 200 })

}