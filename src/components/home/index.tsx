'use client'

import React, { useEffect } from 'react'
import ConcertBanner from '@/components/home/ConcertBanner'
import ConcertList from '@/components/home/ConcertList'
import PastConcerts from '@/components/home/PastConcerts'
import PerformersSection from '@/components/home/PerformersSection'
import Sponsors from '@/components/home/Sponsors'
import { initScrollAnimation } from '@/utils/scrollAnimation'
import { PaginatedDocs } from 'payload'
import { Partner } from '@/types/Partner'
import { Performer } from '@/types/Performer'
import { Event } from '@/types/Event'

const Index = ({
  bannerDocs,
  onGoingPaginatedDocs,
  partners,
  performers,
  pastEvents
}: {
  bannerDocs: PaginatedDocs['docs']
  onGoingPaginatedDocs: PaginatedDocs,
  partners: Partner[]
  performers: Performer[]
  pastEvents: Event[]
}) => {
  useEffect(() => {
    const cleanup = initScrollAnimation()
    return cleanup
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <ConcertBanner events={bannerDocs} />
        <ConcertList
          onGoingPaginatedDocs={onGoingPaginatedDocs}
          title="Ongoing & Upcoming Concerts"
        />
        {performers.length > 0 && <PerformersSection performers={performers} />}
        {pastEvents.length > 0 && <PastConcerts events={pastEvents} />}
        {partners.length > 0 && <Sponsors partners={partners} />}
      </main>
    </div>
  )
}

export default Index