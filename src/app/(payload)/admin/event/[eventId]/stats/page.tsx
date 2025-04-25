import React from 'react'
import { getPayload } from '@/payload-config/getPayloadConfig'
import StatsPageClient from './page.client'
import type { Event } from '../types'
import type { Event as PayloadEvent } from '@/payload-types'

interface Props {
  params: {
    eventId: string
  }
}

export default async function StatsPage({ params }: Props) {
  // Await the params
  const { eventId } = await Promise.resolve(params)
  const payload = await getPayload()

  const payloadEvent = (await payload
    .find({
      collection: 'events',
      where: {
        slug: {
          equals: eventId,
        },
      },
      depth: 2,
      limit: 1,
    })
    .then((res) => res.docs[0])) as PayloadEvent | null

  if (!payloadEvent) {
    return <div>Event not found</div>
  }

  // Convert PayloadEvent to Event
  const event: Event = {
    id: String(payloadEvent.id),
    slug: payloadEvent.slug || null,
    title: payloadEvent.title || null,
    description: payloadEvent.description || null,
    startDatetime: payloadEvent.startDatetime || null,
    endDatetime: payloadEvent.endDatetime || null,
    eventLocation: payloadEvent.eventLocation || null,
    schedules: payloadEvent.schedules
      ?.filter((schedule) => schedule.date)
      .map((schedule) => ({
        id: String(schedule.id),
        date: schedule.date!,
        details: schedule.details
          ?.filter((detail) => detail.time && detail.name && detail.description)
          .map((detail) => ({
            time: detail.time!,
            name: detail.name!,
            description: detail.description!,
          })),
      })),
    ticketPrices: payloadEvent.ticketPrices
      ?.filter(
        (ticket) =>
          ticket.name &&
          ticket.key &&
          typeof ticket.price === 'number' &&
          ticket.currency &&
          typeof ticket.quantity === 'number',
      )
      .map((ticket) => ({
        name: ticket.name!,
        key: ticket.key!,
        price: ticket.price!,
        currency: ticket.currency!,
        quantity: ticket.quantity!,
      })),
  }

  return <StatsPageClient event={event} eventId={eventId} />
}
