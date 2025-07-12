import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { checkAuthenticated } from '@/utilities/checkAuthenticated'

export async function GET(_req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const authData = await checkAuthenticated()

    if (!authData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const records = await payload.find({
      collection: 'checkinRecords',
      where: {
        checkedInBy: {
          equals: authData.user.id,
        },
        // Optionally, limit to recent records, e.g., last 24 hours
        createdAt: {
          greater_than_equal: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      },
      sort: '-createdAt',
      limit: 50, // Limit the number of records returned
      depth: 2, // To get ticket and user details
    })

    return NextResponse.json({ records: records.docs })
  } catch (error) {
    console.error('Scan history error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 