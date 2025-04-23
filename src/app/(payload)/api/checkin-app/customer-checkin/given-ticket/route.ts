import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: Request) {
  try {
    const { ticketCode, adminId } = await request.json()

    if (!ticketCode || !adminId) {
      return NextResponse.json(
        { message: 'Admin ID and ticket code are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    const existingCheckIn = await payload.find({
      collection: 'checkinRecords',
      where: {
        ticketCode: { equals: ticketCode },
        deletedAt: { equals: null },
      },
    }).then(res => res.docs[0])

    const admin  = await payload.find({
        collection: 'admins',
        where: {
          id: { equals: adminId },
        },
      }).then(res => res.docs[0])

    if (!existingCheckIn) {
      return NextResponse.json(
        { message: 'Check-in record not found' },
        { status: 404 },
      )
    }
    if (!admin) {
      return NextResponse.json(
        { message: 'Admin not found' },
        { status: 404 },
      )
    }

    await payload.update({
      collection: 'checkinRecords',
      id: existingCheckIn.id,
      data: {
        ticketGivenTime: new Date().toISOString(),
        ticketGivenBy: admin,
      },
    })

    return NextResponse.json({
      message: `Ticket ${ticketCode} successfully marked as given by ${admin?.firstName} ${admin?.lastName}`,
      checkinRecord: existingCheckIn.ticketCode,
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 },
    )
  }
}
