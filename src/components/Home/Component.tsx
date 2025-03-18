// import HomeClient from './Component.client'
// import { PaginatedDocs } from 'payload'

// import React from 'react'

// import { Event } from '@/types/Event'
// import { Performer } from '@/types/Performer'
// import { Partner } from '@/types/Partner'

// import {
//   fetchActivities,
//   fetchOngoingPaginatedDocs,
//   fetchPartners,
//   fetchPastEvents,
//   fetchPerformers,
// } from './actions'

// const getDataHomePage = async () => {
//   try {
//     const [eventsData, performerData, pastEventData, partnerData, activitiesData] =
//       await Promise.all([
//         fetchOngoingPaginatedDocs(),
//         fetchPerformers(),
//         fetchPastEvents(),
//         fetchPartners(),
//         fetchActivities(),
//       ])

//     const bannerDocs = eventsData.docs

//     const onGoingPaginatedDocs = eventsData

//     // get performers
//     const performers = performerData
//     // get past concerts
//     const pastEvents = pastEventData

//     const partners = partnerData

//     const activity = activitiesData

//     return {
//       bannerDocs,
//       onGoingPaginatedDocs,
//       performers,
//       pastEvents,
//       partners,
//       activity,
//     }
//   } catch (_error) {
//     return {
//       bannerDocs: [],
//       onGoingPaginatedDocs: {
//         docs: [],
//         hasNextPage: false,
//         hasPrevPage: false,
//         limit: 10,
//         totalDocs: 0,
//         totalPages: 0,
//         pagingCounter: 0,
//       } as PaginatedDocs,
//       performers: [],
//       pastEvents: [],
//       partners: [],
//       activity: undefined,
//     }
//   }
// }

// export async function Home() {
//   const { bannerDocs, onGoingPaginatedDocs, performers, pastEvents, partners, activity } =
//     await getDataHomePage()

//   return (
//     <HomeClient
//       bannerDocs={bannerDocs}
//       onGoingPaginatedDocs={onGoingPaginatedDocs}
//       partners={partners as Partner[]}
//       performers={performers as Performer[]}
//       pastEvents={pastEvents as Event[]}
//       activity={activity}
//     />
//   )
// }

import HomeClient from './Component.client'
import { getPayload } from 'payload'

import config from '@/payload.config'
import React from 'react'

import { Event } from '@/types/Event'
import { Performer } from '@/types/Performer'
import { Partner } from '@/types/Partner'

export async function Home() {
  // const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const bannerDocs = await payload.find({
    collection: 'events',
    where: { endDatetime: { greater_than_equal: new Date() } },
    limit: 5,
  })

  const onGoingPaginatedDocs = await payload.find({
    collection: 'events',
    where: { endDatetime: { greater_than_equal: new Date() } },
    limit: 10,
  })
  // const { user } = await payload.auth({ headers })˝

  // get performers
  const performers = await payload
    .find({
      collection: 'performers',
      where: { status: { equals: 'active' } },
      sort: 'displayOrder',
      limit: 50,
    })
    .then((res) => res.docs)
  // get past concerts
  const pastEvents = await payload
    .find({ collection: 'events', where: { endDatetime: { less_than: new Date() } }, limit: 50 })
    .then((res) => res.docs)

  const partners = await payload.find({ collection: 'partners', limit: 50 }).then((res) => res.docs)

  const activity = await payload
    .find({ collection: 'activities', where: { status: { equals: 'active' } }, limit: 1 })
    .then((res) => res.docs?.[0])

  return (
    <HomeClient
      bannerDocs={bannerDocs.docs}
      onGoingPaginatedDocs={onGoingPaginatedDocs}
      partners={partners as Partner[]}
      performers={performers as Performer[]}
      pastEvents={pastEvents as Event[]}
      activity={activity}
    />
  )
}
