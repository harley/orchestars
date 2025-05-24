import { getPayload } from '@/payload-config/getPayloadConfig'
import { Ticket } from '@/payload-types'
import { User } from '@/payload-types'

export async function getUserTickets({ userId }: { userId: number }): Promise<Ticket[] | null> {
  try {
    const payload = await getPayload()

    const result = await payload.find({
      collection: 'tickets',
      where: {
        user: {
          equals: userId,
        },
      },
      limit: 100, // optional limit
      sort: '-createdAt', // newest first
    })

    const tickets = result.docs as Ticket[]

    return tickets
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return null
  }
}

export async function getUserData({ userId }: { userId: number }): Promise<User | null> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'users',
      where: { id: { equals: userId } },
    })
    return result.docs[0] as User
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return null
  }
}
