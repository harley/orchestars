import EventDetail from '@/components/EventDetail'
import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { Event } from '@/types/Event'
import { Performer } from '@/types/Performer'
import { FAQType } from '@/types/FAQ'
import PageClient from './page.client'

const ConcertDetailPage = async (props: { params: Promise<{ eventId: string }> }) => {
  const params = await props.params

  const eventSlug = params.eventId

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const eventDetail = await payload
    .find({
      collection: 'events',
      limit: 1,
      where: { slug: { equals: eventSlug } },
    })
    .then((res) => res.docs?.[0])

  if (!eventDetail) {
    return notFound()
  }

  const performers = await payload
    .find({
      collection: 'performers',
      where: { status: { equals: 'active' } },
      sort: 'displayOrder',
      limit: 50,
    })
    .then((res) => res.docs)

  const faqs = await payload
    .find({ collection: 'faqs', where: { status: { equals: 'active' } }, limit: 50 })
    .then((res) => res.docs)

  const unavailableSeats = await payload
    .find({
      collection: 'tickets',
      where: {
        status: { in: ['booked', 'pending_payment', 'hold'] },
        event: { equals: eventDetail.id },
      },
      select: { seat: true },
    })
    .then((res) => res.docs.map((tk) => tk.seat).filter((exist) => !!exist))

  return (
    <div className="">
      <PageClient />
      <EventDetail
        event={eventDetail}
        performers={performers as Performer[]}
        faqs={faqs as FAQType[]}
        unavailableSeats={unavailableSeats as string[]}
      />
    </div>
  )
}

export default ConcertDetailPage
