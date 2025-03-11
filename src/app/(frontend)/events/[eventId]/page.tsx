import TicketDetails from '@/components/concert-detail'
import React from 'react'
import { getPayload, WhereField } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { Event } from '@/types/Event'
import { Performer } from '@/types/Performer'
import { FAQType } from '@/types/FAQ'
import ServerLayout from '@/components/layout/ServerLayout'

const ConcertDetailPage = async (props: { params: Promise<{ eventId: string }> }) => {
  const params = await props.params

  const eventSlug = params.eventId

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const eventDetail = await payload.find({
    collection: 'events',
    limit: 1,
    where: { slug: eventSlug as WhereField },
  }).then(res => res.docs?.[0])

  if (!eventDetail) {
    return notFound()
  }

  const performers = await payload.find({ collection: 'performers', where: { status: { equals: 'active' } }, limit: 50 }).then(res => res.docs)

  const faqs = await payload.find({ collection: 'faqs', where: { status: { equals: 'active' } }, limit: 50 }).then(res => res.docs)

  return (
    <ServerLayout>
      <TicketDetails event={eventDetail as Event} performers={performers as Performer[]} faqs={faqs as FAQType[]} />
    </ServerLayout>
  )
}

export default ConcertDetailPage
