import TicketDetails from '@/components/concert-detail'
import React from 'react'
import { getPayload, WhereField } from 'payload'
import config from '@/payload.config'

const ConcertDetailPage = async (props: { params: Promise<{ eventId: string }> }) => {
  const params = await props.params

  const eventSlug = params.eventId

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const eventDetail = await payload.find({
    collection: 'events',
    limit: 1,
    where: { slug: eventSlug as WhereField },
  })

  return (
    <div>
      <TicketDetails event={eventDetail.docs[0]} />
    </div>
  )
}

export default ConcertDetailPage
