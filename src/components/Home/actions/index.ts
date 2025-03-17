import { PaginatedDocs } from 'payload'
import { stringify } from 'qs-esm'

import { APP_BASE_URL } from '@/config/app'

export const fetchOngoingPaginatedDocs = async () => {
  try {
    const stringifiedQuery = stringify(
      {
        where: { endDatetime: { greater_than_equal: new Date() } },
        limit: 10,
      },
      { addQueryPrefix: true },
    )

    const req = await fetch(`${APP_BASE_URL}/api/events${stringifiedQuery}`, {
      method: 'GET',
      next: { tags: ['home-events'] },
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await req.json()

    return data
  } catch (err) {
    console.log(err)

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
    const stringifiedQuery = stringify(
      {
        where: { status: { equals: 'active' } },
        sort: 'displayOrder',
        limit: 50,
      },
      { addQueryPrefix: true },
    )

    const req = await fetch(`${APP_BASE_URL}/api/performers?${stringifiedQuery}`, {
      method: 'GET',
      next: { tags: ['home-performers'] },
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await req.json()

    return data.docs || []
  } catch (err) {
    console.log(err)
    return []
  }
}

export const fetchPastEvents = async () => {
  try {
    const stringifiedQuery = stringify(
      {
        where: { endDatetime: { less_than: new Date() } },
        limit: 50,
      },
      { addQueryPrefix: true },
    )
    const req = await fetch(`${APP_BASE_URL}/api/events${stringifiedQuery}`, {
      method: 'GET',
      next: { tags: ['home-events'] },
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await req.json()

    return data.docs || []
  } catch (err) {
    console.log(err)
    return []
  }
}

export const fetchPartners = async () => {
  try {
    const stringifiedQuery = stringify(
      {
        limit: 50,
      },
      { addQueryPrefix: true },
    )
    const req = await fetch(`${APP_BASE_URL}/api/partners${stringifiedQuery}`, {
      method: 'GET',
      next: { tags: ['home-partners'] },
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await req.json()

    return data.docs
  } catch (err) {
    console.log(err)
    return []
  }
}

export const fetchActivities = async () => {
  try {
    const stringifiedQuery = stringify(
      {
        where: {
          status: { equals: 'active' },
        },
        limit: 1,
      },
      { addQueryPrefix: true },
    )

    const req = await fetch(`${APP_BASE_URL}/api/activities${stringifiedQuery}`, {
      method: 'GET',
      next: { tags: ['home-activities'] },
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
}
