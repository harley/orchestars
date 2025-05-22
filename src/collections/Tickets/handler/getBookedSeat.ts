import { getBookedOrPendingPaymentOrHoldingSeats } from '@/app/(payload)/admin/event/[eventId]/actions'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'
import { NextResponse } from 'next/server'
import { PayloadRequest } from 'payload'

export const getBookedSeat = async (req: PayloadRequest) => {
  try {
    if (!req.user) {
      throw new Error('UNAUTHORIZED')
    }

    const query = req.query

    const eventId = Number(query.eventId)
    const eventScheduleId = query.eventScheduleId as string

    const result = await getBookedOrPendingPaymentOrHoldingSeats({
      eventId,
      eventScheduleId,
    })

    const nextResponse = NextResponse.json({ data: result }, { status: 200 })

    return nextResponse
  } catch (error: any) {
    console.error('admin getBookedSeat error:', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}
