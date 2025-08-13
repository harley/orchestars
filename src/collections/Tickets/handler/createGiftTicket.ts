import { PayloadRequest } from 'payload'
import { NextResponse } from 'next/server'
import { createGiftTicket } from '../utils/createGiftTicket'

export const createGiftTicketHandler = async (req: PayloadRequest): Promise<Response> => {
  try {
    if (!req.user || !['admin', 'super-admin'].includes(req.user.role)) {
      throw new Error('UNAUTHORIZED')
    }

    const body = (await req.json?.()) || {}
    return createGiftTicket(body)
  } catch (error) {
    console.error('Error creating gift ticket:', error)
    return NextResponse.json(
      { message: 'Failed to create gift ticket', error: (error as Error).message },
      { status: 400 },
    )
  }
}
