// POST /api/checkin-app/checkin/:ticket-code
// use token to authorize user
// check if ticket-code is valid
// check if ticket-code is already used
// return ticket details

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers as getHeaders } from 'next/headers'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
// import { getClientSideURL } from '@/utilities/getURL'

export async function POST(req: NextRequest) {

  try {
    // Get authorization header
    const payload = await getPayload({ config })

    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    if (!user || !isAdminOrSuperAdminOrEventAdmin({
      req: { user }
    })) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin user' },
        { status: 401 },
      )
    }

    // Get ticket code from URL parameter
    const parts = req.nextUrl.pathname.split('/')
    const ticketCode = parts[parts.length-2]


    const result = await payload.update({
        collection: 'checkinRecords',
        where: {
          ticketCode: { equals: ticketCode },
          deletedAt: { equals: null },
        },
        data: {
          deletedAt: new Date().toISOString(),
        },
      });
      
      const updatedRecord = result.docs?.[0];

      if (!updatedRecord) {
        return NextResponse.json({ error: 'Check-in record not found' }, { status: 404 });
      }
      
      return NextResponse.json({ checkinRecord: updatedRecord }, { status: 200 });
    }
    catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete check-in record' }, { status: 500 })
        }
    }