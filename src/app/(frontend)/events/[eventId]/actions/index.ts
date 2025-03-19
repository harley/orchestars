import { EVENT_STATUS } from '@/collections/Events/constants/status'
import { APP_BASE_URL } from '@/config/app'
import { stringify } from 'qs-esm'
import { cache } from 'react'

export const fetchEvent = cache(async ({ slug }: { slug: string }) => {
  try {
    const stringifiedQuery = stringify(
      {
        where: {
          slug: { equals: slug },
          status: {
            in: [
              EVENT_STATUS.published_upcoming.value,
              EVENT_STATUS.published_open_sales.value,
              EVENT_STATUS.completed.value,
            ],
          },
        },
        limit: 1,
      },
      { addQueryPrefix: true },
    )

    const req = await fetch(`${APP_BASE_URL}/api/events${stringifiedQuery}`, {
      method: 'GET',
      next: { tags: ['event-detail'] },
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await req.json()

    return data.docs?.[0]
  } catch (err) {
    console.log(err)
    return undefined
  }
})
