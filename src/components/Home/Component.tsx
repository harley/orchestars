import HomeClient from './Component.client'
import { PaginatedDocs } from 'payload'

import React, { cache } from 'react'

import { Event } from '@/types/Event'
import { Performer } from '@/types/Performer'
import { Partner } from '@/types/Partner'

import {
  getOngoingPaginatedDocsCached,
  getPerformersCached,
  getPastEventsCached,
  getPartnersCached,
  getActivitiesCached,
} from './actions'

const getDataHomePage = cache(async () => {
  try {
    const [eventsData, performerData, pastEventData, partnerData, activitiesData] =
      await Promise.all([
        getOngoingPaginatedDocsCached()(),
        getPerformersCached()(),
        getPastEventsCached()(),
        getPartnersCached()(),
        getActivitiesCached()(),
      ])

    const bannerDocs = eventsData.docs

    const onGoingPaginatedDocs = eventsData

    // get performers
    const performers = performerData
    // get past concerts
    const pastEvents = pastEventData

    const partners = partnerData

    const activity = activitiesData

    return {
      bannerDocs,
      onGoingPaginatedDocs,
      performers,
      pastEvents,
      partners,
      activity,
    }
  } catch (_error) {
    return {
      bannerDocs: [],
      onGoingPaginatedDocs: {
        docs: [],
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        totalDocs: 0,
        totalPages: 0,
        pagingCounter: 0,
      } as PaginatedDocs,
      performers: [],
      pastEvents: [],
      partners: [],
      activity: undefined,
    }
  }
})

export async function Home() {
  const { bannerDocs, onGoingPaginatedDocs, performers, pastEvents, partners, activity } =
    await getDataHomePage()

  return (
    <HomeClient
      bannerDocs={bannerDocs}
      onGoingPaginatedDocs={onGoingPaginatedDocs}
      partners={partners as Partner[]}
      performers={performers as Performer[]}
      pastEvents={pastEvents as unknown as Event[]}
      activity={activity}
    />
  )
}
