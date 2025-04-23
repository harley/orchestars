/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useEffect, useMemo } from 'react'
import ConcertBanner from './components/ConcertBanner'
import PastConcerts from './components/PastConcerts'
import PerformersSection from './components/PerformersSection'
import { initScrollAnimation } from '@/utilities/scrollAnimation'
import { PaginatedDocs } from 'payload'
import { Partner } from '@/types/Partner'
import { Performer } from '@/types/Performer'
import { Event } from '@/types/Event'
import ActivitiesSection from './components/Activities'
import { Activity } from '@/payload-types'
import Partners from './components/Partners'

const HomeClient = ({
  bannerDocs,
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

  const visibleSections = useMemo(() => {
    const array = []
    if (pastEvents?.length > 0) {
      array.push({ Component: PastConcerts, props: { events: pastEvents } })
    }
    if (performers?.length > 0) {
      array.push({ Component: PerformersSection, props: { performers } })
    }
    if (partners?.length > 0) {
      array.push({ Component: Partners, props: { partners } })
    }
    if (activity) {
      array.push({ Component: ActivitiesSection, props: { activity } })
    }
    return array as Array<{ Component: React.FC<any>; props: Record<string, any> }>
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-2 md:pt-6">
        <ConcertBanner events={bannerDocs} />
        {visibleSections.map((section, index) => (
          <section.Component key={index} {...section.props} />
        ))}
      </main>
    </div>
  )
}

export default HomeClient
