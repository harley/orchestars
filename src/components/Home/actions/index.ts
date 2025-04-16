import { PaginatedDocs } from 'payload'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { EVENT_STATUS } from '@/collections/Events/constants/status'
import { DEFAULT_FALLBACK_LOCALE, SupportedLocale } from '@/config/app'

type LocaleQuery = { locale?: SupportedLocale }

export const fetchOngoingPaginatedDocs = async (query?: LocaleQuery) => {
  try {
    console.log('fetching OngoingPaginatedDocs')
    const payload = await getPayload({ config: configPromise })
    const result = await payload
      .find({
        collection: 'events',
        locale: query?.locale || DEFAULT_FALLBACK_LOCALE,
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

export const fetchPerformers = async (query?: LocaleQuery) => {
  try {
    console.log('fetching Performers')
    const payload = await getPayload({ config: configPromise })
    const result = await payload
      .find({
        collection: 'performers',
        locale: query?.locale || DEFAULT_FALLBACK_LOCALE,
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

export const fetchPastEvents = async (query?: LocaleQuery) => {
  try {
    console.log('fetching PastEvents')
    const payload = await getPayload({ config: configPromise })
    const result = await payload
      .find({
        collection: 'events',
        locale: query?.locale || DEFAULT_FALLBACK_LOCALE,
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

export const fetchPartners = async (query?: LocaleQuery) => {
  try {
    console.log('fetching Partners')
    const payload = await getPayload({ config: configPromise })
    const result = await payload
      .find({
        collection: 'partners',
        locale: query?.locale || DEFAULT_FALLBACK_LOCALE,
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

export const fetchActivities = async (query?: LocaleQuery) => {
  try {
    console.log('fetching Activities')
    const payload = await getPayload({ config: configPromise })
    const result = await payload
      .find({
        collection: 'activities',
        locale: query?.locale || DEFAULT_FALLBACK_LOCALE,
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

export const getOngoingPaginatedDocsCached = (query?: LocaleQuery) =>
  unstable_cache(
    async () => fetchOngoingPaginatedDocs(query),
    [query?.locale || DEFAULT_FALLBACK_LOCALE],
    {
      tags: ['home-events'],
      revalidate: 86400, // 24 hours
    },
  )

export const getPerformersCached = (query?: LocaleQuery) =>
  unstable_cache(async () => fetchPerformers(query), [query?.locale || DEFAULT_FALLBACK_LOCALE], {
    tags: ['home-performers'],
    revalidate: 86400, // 24 hours
  })

export const getPastEventsCached = (query?: LocaleQuery) =>
  unstable_cache(async () => fetchPastEvents(query), [query?.locale || DEFAULT_FALLBACK_LOCALE], {
    tags: ['home-events'],
    revalidate: 86400, // 24 hours
  })

export const getPartnersCached = (query?: LocaleQuery) =>
  unstable_cache(async () => fetchPartners(query), [query?.locale || DEFAULT_FALLBACK_LOCALE], {
    tags: ['home-partners'],
    revalidate: 86400, // 24 hours
  })

export const getActivitiesCached = (query?: LocaleQuery) =>
  unstable_cache(async () => fetchActivities(query), [query?.locale || DEFAULT_FALLBACK_LOCALE], {
    tags: ['home-activities'],
    revalidate: 86400, // 24 hours
  })
