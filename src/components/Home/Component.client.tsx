'use client'

import React, { useEffect } from 'react'
import ConcertBanner from './components/ConcertBanner'
import ConcertList from './components/ConcertList'
import PastConcerts from './components/PastConcerts'
import PerformersSection from './components/PerformersSection'
import Sponsors from './components/Sponsors'
import { initScrollAnimation } from '@/utilities/scrollAnimation'
import { PaginatedDocs } from 'payload'
import { Partner } from '@/types/Partner'
import { Performer } from '@/types/Performer'
import { Event } from '@/types/Event'
import ActivitiesSection from './components/Activities'
import { Activity } from '@/payload-types'

const HomeClient = ({
  bannerDocs,
  onGoingPaginatedDocs,
  partners,
  performers,
  pastEvents,
  activity,
}: {
  bannerDocs: PaginatedDocs['docs']
  onGoingPaginatedDocs: PaginatedDocs
  partners: Partner[]
  performers: Performer[]
  pastEvents: Event[]
  activity?: Activity
}) => {
  useEffect(() => {
    const cleanup = initScrollAnimation()
    return cleanup
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <ConcertBanner events={bannerDocs} />
        <ConcertList onGoingPaginatedDocs={onGoingPaginatedDocs} />
        {performers?.length > 0 && <PerformersSection performers={performers} />}
        {pastEvents?.length > 0 && <PastConcerts events={pastEvents} />}
        {partners?.length > 0 && <Sponsors partners={partners} />}
        {activity && <ActivitiesSection activity={activity} />}
      </main>
    </div>
  )
}

export default HomeClient
