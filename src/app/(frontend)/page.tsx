import React from 'react'
// import { headers as getHeaders } from 'next/headers.js'
// import Image from 'next/image'
import { getPayload } from 'payload'

import config from '@/payload.config'
import HomePageComponent from '@/components/home'
import { Partner } from '@/types/Partner'
import { Performer } from '@/types/Performer'
import { Event } from '@/types/Event'
import ServerLayout from '@/components/layout/ServerLayout'

export const dynamic = 'force-dynamic'

export default async function HomePage() {

  // const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const bannerDocs = await payload.find({ collection: 'events', where: { endDatetime: { greater_than_equal: new Date() } }, limit: 5 })

  const onGoingPaginatedDocs = await payload.find({ collection: 'events', where: { endDatetime: { greater_than_equal: new Date() } }, limit: 10 })
  // const { user } = await payload.auth({ headers })˝

  // get performers
  const performers = await payload.find({ collection: 'performers', where: { status: { equals: 'active' } }, limit: 50 }).then(res => res.docs)
  // get past concerts
  const pastEvents = await payload.find({ collection: 'events', where: { endDatetime: { less_than: new Date() } }, limit: 50 }).then(res => res.docs)

  const partners = await payload.find({ collection: 'partners', limit: 50 }).then(res => res.docs)


  return (
    <ServerLayout>
      <HomePageComponent bannerDocs={bannerDocs.docs} onGoingPaginatedDocs={onGoingPaginatedDocs} partners={partners as Partner[]} performers={performers as Performer[]}
        pastEvents={pastEvents as Event[]}
      />
    </ServerLayout>
  )
}
