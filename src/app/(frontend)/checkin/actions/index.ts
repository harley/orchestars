import { getPayload } from '@/payload-config/getPayloadConfig'
import { unstable_cache } from 'next/cache'
import type { CheckinRecord } from '@/payload-types'

export async function getCheckinHistory({
  token,
}: {
  token: string | null
}): Promise<CheckinRecord[] | null> {
  if (!token) {
    console.error('Error: No token provided for getCheckinHistory')
    return null
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
      limit: 100,
      depth: 1,
    })

    return result.docs as CheckinRecord[]
  } catch (error) {
    console.error('Error fetching check-in history directly:', error)
    return null
  }
}

export const getCheckinHistoryCached = ({ token }: { token: string | null }) =>
  unstable_cache(
    async () => getCheckinHistory({ token }),
    ['checkin-history', token ?? 'no-token'],
    {
      tags: [`checkin-history`],
      revalidate: 86400,
    },
  )
