import { NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { checkAuthenticated } from '@/utilities/checkAuthenticated'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'

export async function GET() {
  const authData = await checkAuthenticated()
  if (!authData?.user || !isAdminOrSuperAdminOrEventAdmin({ req: { user: authData.user } })) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const payload = await getPayload()

    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const result = await payload.find({
      collection: 'checkinRecords',
      where: {
        createdAt: {
          greater_than: oneDayAgo.toISOString(),
        },
        deletedAt: { equals: null },
      },
      sort: '-createdAt',
      limit: 20,
      depth: 1,
    })

    return NextResponse.json({ docs: result.docs }, { status: 200 })
  } catch (err) {
    console.error('history-checkin-record error', err)
    return NextResponse.json({ message: 'Error fetching history' }, { status: 500 })
  }
}
