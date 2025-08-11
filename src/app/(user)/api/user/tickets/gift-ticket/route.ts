import { NextRequest, NextResponse } from 'next/server'
import { authorizeApiRequest } from '@/app/(user)/utils/authorizeApiRequest'
import { getNextBodyData } from '@/utilities/getNextBodyData'
import { createGiftTicket } from '@/collections/Tickets/utils/createGiftTicket'

export async function POST(req: NextRequest) {
  try {
    const userRequest = await authorizeApiRequest()

    const body = await getNextBodyData(req)

    console.log('body', body)

    return createGiftTicket({
      ...body,
      ownerId: userRequest.id,
    })
  } catch (err) {
    const error = err as Error
    console.error('Error while creating gift ticket:', error)
    return NextResponse.json(
      {
        message: 'Failed to create gift ticket',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
