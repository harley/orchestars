import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { EVENT_STATUS } from '@/collections/Events/constants/status'

export const fetchOngoingEvents = async () => {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload
      .find({
        collection: 'events',
        where: {
          endDatetime: { greater_than_equal: new Date() },
          status: {
            in: [EVENT_STATUS.published_upcoming.value, EVENT_STATUS.published_open_sales.value],
          },
        },
        sort: 'startDatetime',
        limit: 10,
      })
      .then((res) => res.docs)
      .catch(() => [])

    return result
  } catch (error) {
    console.error('Error while fetching fetchOngoingEvents', error)

    return []
  }
}
