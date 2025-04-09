import { EVENT_STATUS } from '@/collections/Events/constants/status'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { fetchPerformers } from '@/components/Home/actions'
import { DEFAULT_FALLBACK_LOCALE, SupportedLocale } from '@/config/app'

export async function getEventDetail({ slug, locale }: { slug: string; locale?: SupportedLocale }) {
  try {
    console.log('fetching event detail by slug:', slug, locale)
    const payload = await getPayload({ config: configPromise })
    const event = await payload
      .find({
        collection: 'events',
        locale: locale || DEFAULT_FALLBACK_LOCALE,
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

export const getEventCached = ({ slug, locale }: { slug: string; locale?: SupportedLocale }) =>
  unstable_cache(
    async () => getEventDetail({ slug, locale }),
    [`${locale || DEFAULT_FALLBACK_LOCALE}-${slug}`],
    {
      tags: [`event-detail:${slug}`],
    },
  )

export const getPerformersByEventCached = ({
  eventSlug: _eventSlug,
  locale,
}: {
  eventSlug: string
  locale?: SupportedLocale
}) =>
  unstable_cache(async () => fetchPerformers({ locale }), [locale || DEFAULT_FALLBACK_LOCALE], {
    tags: [`event-performers`],
  })
