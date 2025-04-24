import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: Request) {
  try {
    const { ticketCodes, adminId } = await request.json()

    // Validate inputs
    if (!Array.isArray(ticketCodes) || ticketCodes.length === 0 || !adminId) {
      return NextResponse.json(
        { message: 'Admin ID and at least one ticket code are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Verify admin exists
    const admin = await payload
      .find({
        collection: 'admins',
        where: { id: { equals: adminId } },
      })
      .then(res => res.docs[0])

    if (!admin) {
      return NextResponse.json(
        { message: 'Admin not found' },
        { status: 404 },
      )
    }

    const results: Array<{ ticketCode: string; status: 'updated' | 'not_found' }> = []

    // Loop through each code, update if there's a checkin record
    for (const code of ticketCodes) {
      const existing = await payload
        .find({
          collection: 'checkinRecords',
          where: {
            ticketCode: { equals: code },
            deletedAt: { equals: null },
          },
        })
        .then(res => res.docs[0])

      if (!existing) {
        results.push({ ticketCode: code, status: 'not_found' })
        continue
      }

      await payload.update({
        collection: 'checkinRecords',
        id: existing.id,
        data: {
          ticketGivenTime: new Date().toISOString(),
          ticketGivenBy: admin.id, // store admin ID
        },
      })

      results.push({ ticketCode: code, status: 'updated' })
    }

    return NextResponse.json({
      message: 'Bulk mark-given complete',
      data: {updatedGivenTicketCode: results}
    })
  } catch (error) {
    console.error('Bulk mark-given error:', error)
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 },
    )
  }
}
