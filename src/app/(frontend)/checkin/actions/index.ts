import { getPayload } from '@/payload-config/getPayloadConfig'
import { unstable_cache } from 'next/cache'
import type { CheckinRecord } from '@/payload-types'

type Query = {
  token?: string | null
}

export async function getCheckinHistory(_query: Query): Promise<CheckinRecord[] | null> {
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
      limit: 100,
      depth: 1,
    })

    return result.docs as CheckinRecord[]
  } catch (error) {
    console.error('Error fetching check-in history directly:', error)
    return null
  }
}

// todo set tag by locale
export const getCheckinHistoryCached = ({ token }: { token: string | null }) =>
  unstable_cache(async () => getCheckinHistory({ token }), ['checkin-history'], {
    tags: [`checkin-history`],
    revalidate: 86400,
  })
