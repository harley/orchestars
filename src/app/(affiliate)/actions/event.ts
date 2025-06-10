import { EVENT_STATUS } from '@/collections/Events/constants/status'
import { DEFAULT_FALLBACK_LOCALE, SupportedLocale } from '@/config/app'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { unstable_cache } from 'next/cache'

type LocaleQuery = { locale?: SupportedLocale }

export const fetchOngoingEvents = async (query?: LocaleQuery) => {
  try {
    console.log('fetching fetchOngoingEvents')
    const payload = await getPayload()
    const result = await payload
      .find({
        collection: 'events',
        locale: query?.locale || DEFAULT_FALLBACK_LOCALE,
        where: {
          endDatetime: { greater_than_equal: new Date() },
          status: {
            in: [EVENT_STATUS.published_open_sales.value],
          },
        },
        sort: 'startDatetime',
        limit: 10,
        depth: 0
      })
      .then((res) => res.docs)
      .catch((error) => {

        console.error('Error while fetching fetchOngoingEvents', error)

        return []
      })

      console.log('result', result)

    return result
  } catch (error) {
    console.error('Error while fetching fetchOngoingEvents', error)

    return []
  }
}


export const fetchOngoingEventsCached = (query?: LocaleQuery) =>
  unstable_cache(
    async () => fetchOngoingEvents(query),
    [`affiliate-events-${query?.locale || DEFAULT_FALLBACK_LOCALE}`],
    {
      tags: ['affiliate-events'],
      revalidate: 86400, // 24 hours
    },
  )()