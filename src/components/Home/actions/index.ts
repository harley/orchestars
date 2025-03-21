import { PaginatedDocs } from 'payload'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { EVENT_STATUS } from '@/collections/Events/constants/status'

export const fetchOngoingPaginatedDocs = async () => {
  try {
    console.log('fetching OngoingPaginatedDocs')
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
      .then((res) => res)
      .catch(
        () =>
          ({
            docs: [],
            hasNextPage: false,
            hasPrevPage: false,
            limit: 10,
            totalDocs: 0,
            totalPages: 0,
            pagingCounter: 0,
          }) as PaginatedDocs,
      )

    return result
  } catch (error) {
    console.error('Error while fetching fetchOngoingPaginatedDocs', error)

    return {
      docs: [],
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10,
      totalDocs: 0,
      totalPages: 0,
      pagingCounter: 0,
    } as PaginatedDocs
  }
}

export const fetchPerformers = async () => {
  try {
    console.log('fetching Performers')
    const payload = await getPayload({ config: configPromise })
    const result = await payload
      .find({
        collection: 'performers',
        where: { status: { equals: 'active' } },
        sort: 'displayOrder',
        limit: 50,
      })
      .then((res) => res.docs)
      .catch(() => [])

    return result
  } catch (error) {
    console.error('Error while fetching fetchPerformers', error)

    return []
  }
}

export const fetchPastEvents = async () => {
  try {
    console.log('fetching PastEvents')
    const payload = await getPayload({ config: configPromise })
    const result = await payload
      .find({
        collection: 'events',
        where: {
          endDatetime: { less_than: new Date() },
          status: {
            in: [EVENT_STATUS.completed.value, EVENT_STATUS.published_open_sales.value],
          },
        },
        sort: '-startDatetime',
        limit: 50,
      })
      .then((res) => res.docs)
      .catch(() => [])

    return result
  } catch (error) {
    console.error('Error while fetching fetchPastEvents', error)

    return []
  }
}

export const fetchPartners = async () => {
  try {
    console.log('fetching Partners')
    const payload = await getPayload({ config: configPromise })
    const result = await payload
      .find({
        collection: 'partners',
        limit: 50,
      })
      .then((res) => res.docs)
      .catch(() => [])

    return result
  } catch (error) {
    console.error('Error while fetching fetchPartners', error)

    return []
  }
}

export const fetchActivities = async () => {
  try {
    console.log('fetching Activities')
    const payload = await getPayload({ config: configPromise })
    const result = await payload
      .find({
        collection: 'activities',
        where: {
          status: { equals: 'active' },
        },
        limit: 1,
      })
      .then((res) => res.docs?.[0])
      .catch(() => undefined)

    return result
  } catch (error) {
    console.error('Error while fetching fetchActivities', error)

    return undefined
  }
}

export const getOngoingPaginatedDocsCached = () =>
  unstable_cache(async () => fetchOngoingPaginatedDocs(), [], {
    tags: ['home-events'],
  })

export const getPerformersCached = () =>
  unstable_cache(async () => fetchPerformers(), [], {
    tags: ['home-performers'],
  })

export const getPastEventsCached = () =>
  unstable_cache(async () => fetchPastEvents(), [], {
    tags: ['home-events'],
  })

export const getPartnersCached = () =>
  unstable_cache(async () => fetchPartners(), [], {
    tags: ['home-partners'],
  })

export const getActivitiesCached = () =>
  unstable_cache(async () => fetchActivities(), [], {
    tags: ['home-activities'],
  })
