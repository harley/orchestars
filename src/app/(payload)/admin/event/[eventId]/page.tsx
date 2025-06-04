import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import AdminEventClient from './page.client'
import type { Event as PayloadEvent, SeatingChart } from '@/payload-types'
import { Event } from './types'

type Props = {
  params: Promise<{ eventId: string }>
}

const AdminEventPage = async ({ params }: Props) => {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')

  if (!token?.value) {
    redirect('/admin/login')
  }

  const { eventId } = await params
  const payload = await getPayload({ config })

  // Find event by slug
  const payloadEvent = (await payload
    .find({
      collection: 'events',
      where: {
        slug: {
          equals: eventId,
        },
      },
      depth: 2, // To populate relations like media
    })
    .then((res) => res.docs[0])) as PayloadEvent

  if (!payloadEvent) {
    return <div className="p-4">Event not found</div>
  }

  // Convert PayloadEvent to Event
  const event: Event = {
    id: String(payloadEvent.id),
    title: payloadEvent.title || '',
    description: payloadEvent.description || '',
    startDatetime: payloadEvent.startDatetime || new Date().toISOString(),
    endDatetime: payloadEvent.endDatetime || new Date().toISOString(),
    eventLocation: payloadEvent.eventLocation || '',
    seatingChart: payloadEvent.seatingChart as SeatingChart,
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
        id: ticket.id!,
        name: ticket.name!,
        key: ticket.key!,
        price: ticket.price!,
        currency: ticket.currency!,
        quantity: ticket.quantity!,
      })),
  }

  return <AdminEventClient event={event} />
}

export default AdminEventPage
