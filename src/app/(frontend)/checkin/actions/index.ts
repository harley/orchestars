import { unstable_cache } from 'next/cache'

export async function getCheckinHistory({ token }: { token: string | null }) {
  console.log(
    `>>> Fetching checkin history for token: ${token ? token.substring(0, 10) + '...' : 'null'}`,
  )
  try {
    const response = await fetch(`/api/checkin-app/history-checkin-record`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
    })

    return response
  } catch (error) {
    console.error('Error while fetching event detail', error)

    return null
  }
}

export const getCheckinHistoryCached = ({ token }: { token: string | null }) =>
  unstable_cache(
    async () => getCheckinHistory({ token }),
    ['checkin-history', token ?? 'no-token'],
    {
      tags: [`checkin-history`],
      revalidate: 86400, // 24 hours
    },
  )
