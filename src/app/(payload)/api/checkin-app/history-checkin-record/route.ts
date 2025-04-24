import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from '@/payload-config/getPayloadConfig'

export async function GET() {
  try {
    const payload = await getPayload()
    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid admin user' }, { status: 401 })
    }

    // Query checkin records created by this user
    // todo using pagination
    const result = await payload.find({
      collection: 'checkinRecords',
      where: {
        createdAt: {
          greater_than: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        },
        deletedAt: { equals: null },
      },
      sort: '-createdAt',
    })

    return NextResponse.json({ records: result.docs }, { status: 200 })
  } catch (error) {
    console.error('Check-in query error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
