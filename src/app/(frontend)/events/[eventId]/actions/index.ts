import { EVENT_STATUS } from '@/collections/Events/constants/status'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { fetchPerformers } from '@/components/Home/actions'

async function getEventDetail(slug: string) {
  try {
    console.log('fetching event detail by slug:', slug)
    const payload = await getPayload({ config: configPromise })
    const event = await payload
      .find({
        collection: 'events',
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
      })
      .then((res) => res.docs?.[0])
      .catch(() => null)

    return event
  } catch (error) {
    console.error('Error while fetching event detail', error)

    return null
  }
}

export const getEventCached = ({ slug }: { slug: string }) =>
  unstable_cache(async () => getEventDetail(slug), [slug], {
    tags: [`event-detail:${slug}`],
  })

export const getPerformersByEventCached = ({ eventSlug: _eventSlug }: { eventSlug: string }) =>
  unstable_cache(async () => fetchPerformers(), [], {
    tags: [`event-performers`],
  })
