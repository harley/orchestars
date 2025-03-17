import { APP_BASE_URL } from '@/config/app'
import { stringify } from 'qs-esm'
import { cache } from 'react'

export const fetchEvent = cache(async ({ slug }: { slug: string }) => {
  try {
    const stringifiedQuery = stringify(
      {
        where: {
          slug: { equals: slug },
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
