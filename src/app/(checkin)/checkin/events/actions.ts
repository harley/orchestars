import { unstable_cache } from 'next/cache'
import { EVENT_STATUS } from '@/collections/Events/constants/status'
import { DEFAULT_FALLBACK_LOCALE, SupportedLocale } from '@/config/app'
import { getPayload } from '@/payload-config/getPayloadConfig'

export type LocaleQuery = { locale?: SupportedLocale }

/** Cache for 24h with tag invalidation */

export const fetchPublicEvents = async (query?: LocaleQuery) => {
  console.log('fetching PublicEvents')
  try {
    const payload = await getPayload()
    const res = await payload.find({
      collection: 'events',
      locale: query?.locale || DEFAULT_FALLBACK_LOCALE,
      where: { status: { equals: EVENT_STATUS.published_open_sales.value } },
      sort: '-startDatetime',
      limit: 50,
    })
    return res.docs
  } catch (err) {
    console.error('Error fetching PublicEvents', err)
    return []
  }
}
export const getPublicEventsCached = (query?: LocaleQuery) =>
  unstable_cache(async () => fetchPublicEvents(query), [query?.locale || DEFAULT_FALLBACK_LOCALE], {
    tags: ['checkin-events-data'],
    revalidate: 86400, // 24 hours
  })
