// POST /api/checkin-app/checkin/:ticket-code
// use token to authorize user
// check if ticket-code is valid
// check if ticket-code is already used
// return ticket details

import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'
// import { getClientSideURL } from '@/utilities/getURL'

export async function POST(req: NextRequest) {
  try {
    // Get authorization header
    const payload = await getPayload()

    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    if (
      !user ||
      !isAdminOrSuperAdminOrEventAdmin({
        req: { user },
      })
    ) {
      throw new Error('DELETECHECKIN001')
    }

    // Get ticket code from URL parameter
    const parts = req.nextUrl.pathname.split('/')
    const ticketCode = parts[parts.length - 2]

    const result = await payload.update({
      collection: 'checkinRecords',
      where: {
        ticketCode: { equals: ticketCode },
        deletedAt: { equals: null },
      },
      data: {
        deletedAt: new Date().toISOString(),
      },
    })

    const updatedRecord = result.docs?.[0]

    if (!updatedRecord) {
      throw new Error('DELETECHECKIN002')
    }

    return NextResponse.json({ checkinRecord: updatedRecord }, { status: 200 })
  } catch (error: any) {
    console.error('Check-in error:', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}
