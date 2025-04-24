/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import ConcertBanner from './components/ConcertBanner'
import { initScrollAnimation } from '@/utilities/scrollAnimation'
import { PaginatedDocs } from 'payload'
import { Partner } from '@/types/Partner'
import { Performer } from '@/types/Performer'
import { Event } from '@/types/Event'
import { Activity } from '@/payload-types'
import ConcertList from './components/ConcertList'

const PastConcerts = dynamic(() => import('./components/PastConcerts'))
const PerformersSection = dynamic(() => import('./components/PerformersSection'))
const Partners = dynamic(() => import('./components/Partners'))
const ActivitiesSection = dynamic(() => import('./components/Activities'))

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

  const visibleSections = useMemo(() => {
    const array = []
    if (onGoingPaginatedDocs?.docs?.length > 0) {
      array.push({
        Component: ConcertList,
        props: { onGoingPaginatedDocs },
      })
    }
    if (pastEvents?.length > 0) {
      array.push({ Component: PastConcerts, props: { events: pastEvents } })
    }
    if (performers?.length > 0) {
      array.push({ Component: PerformersSection, props: { performers } })
    }
    if (activity) {
      array.push({ Component: ActivitiesSection, props: { activity } })
    }
    if (partners?.length > 0) {
      array.push({ Component: Partners, props: { partners } })
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
