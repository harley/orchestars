import { getPayload } from '@/payload-config/getPayloadConfig'
import { unstable_cache } from 'next/cache'
import { Ticket } from '@/payload-types'

import { User } from '@/payload-types'

type Query = {
  user?: User & {
    collection: "users";
}
}
export async function getUserTickets({user}: Query): Promise<Ticket[] | null> {
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


    return result.docs as Ticket[]
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return null
  }
}

export const getUserTicketsCached = ({ user }: { user: (User & {
  collection: "users";
}) }) =>
  unstable_cache(async () => getUserTickets({ user }), ['user-tickets'], {
    tags: [`user-tickets`],
    revalidate: 86400,  
  })
