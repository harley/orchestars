import { getPayload } from '@/payload-config/getPayloadConfig'
import { unstable_cache } from 'next/cache'
import { Ticket } from '@/payload-types'
import { Event } from '@/payload-types'
import { User } from '@/payload-types'

type Query = {
  user?: User & {
    collection: "users";
  }
}

export async function getUserTickets({ user }: Query): Promise<Ticket[] | null> {
  try {
    const payload = await getPayload()

    const result = await payload.find({
      collection: 'tickets',
      where: {
        user: {
          equals: user?.id,
        },
      },
      limit: 100, // optional limit
      sort: '-createdAt', // newest first
    })

    let tickets = result.docs as Ticket[]

    // Find tickets missing eventDate
    const ticketsMissingDate = tickets.filter(ticket => !ticket.eventDate && ticket.event && ticket.eventScheduleId)
    if (ticketsMissingDate.length > 0) {
      // Group by event id
      const eventIds = Array.from(new Set(ticketsMissingDate.map(ticket => typeof ticket.event === 'object' ? ticket.event?.id : ticket.event).filter(Boolean)))
      // Fetch all needed events
      const eventsResult = await payload.find({
        collection: 'events',
        where: { id: { in: eventIds } },
        limit: eventIds.length,
      })
      const eventsMap = new Map(
        eventsResult.docs.map(event => [event.id, event])
      )
      // Patch eventDate for tickets
      tickets = tickets.map(ticket => {
        if (!ticket.eventDate && ticket.event && ticket.eventScheduleId) {
          const eventId = typeof ticket.event === 'object' ? ticket.event.id : ticket.event
          const event = eventsMap.get(eventId)
          const schedule = event?.schedules?.find(sch => sch.id === ticket.eventScheduleId)

          if (schedule?.date) {
            return { ...ticket, eventDate: schedule.date }
          }
        }
        return ticket
      })
    }

    return tickets
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return null
  }
}

export async function getMyEvents({ user }: Query): Promise<Event[] | null> {
  try {
    const tickets = await getUserTickets({ user })
    if (!tickets) return []
    const eventIds = Array.from(new Set(tickets.map(ticket => typeof ticket.event === 'object' ? ticket.event?.id : ticket.event).filter(Boolean)))
    if (!eventIds.length) return []
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'events',
      where: {
        id: { in: eventIds },
      },
      limit: eventIds.length,
    })
    return result.docs as Event[]
  } catch (error) {
    console.error('Error fetching my events:', error)
    return null
  }
}

export async function getUserData({ user }: Query): Promise<User | null> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'users',
      where: { id: { equals: user?.id } },
    })
    return result.docs[0] as User
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return null
  }
}

export const getUserTicketsCached = ({ user }: {
  user: (User & {
    collection: "users";
  })
}) =>
  unstable_cache(async () => getUserTickets({ user }), ['user-tickets'], {
    tags: [`user-tickets`],
    revalidate: 86400,
  })

export const getMyEventsCached = ({ user }: {
  user: (User & {
    collection: "users";
  })
}) =>
  unstable_cache(async () => getMyEvents({ user }), ['my-events'], {
    tags: [`my-events`],
    revalidate: 86400,
  })

export const getUserDataCached = ({ user }: {
  user: (User & {
    collection: "users";
  })
}) =>
  unstable_cache(async () => getUserData({ user }), ['user-data'], {
    tags: [`user-data`],
    revalidate: 86400,
  })