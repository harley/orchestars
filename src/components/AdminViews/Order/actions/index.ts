import { EVENT_STATUS } from '@/collections/Events/constants/status'
import { getPayload } from '@/payload-config/getPayloadConfig'

export const fetchOpenSalesEvents = async () => {
  try {
    const payload = await getPayload()
    const result = await payload
      .find({
        collection: 'events',
        where: {
          endDatetime: { greater_than_equal: new Date() },
          status: {
            in: [EVENT_STATUS.published_open_sales.value],
          },
        },
        sort: 'startDatetime',
        limit: 10,
      })
      .then((res) => res.docs)
      .catch(() => [])

    return result
  } catch (error) {
    console.error('Error while fetching fetchOpenSalesEvents', error)

    return []
  }
}
