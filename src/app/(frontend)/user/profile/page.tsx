import { Ticket } from '@/types/Ticket'
import { getUserTicketsCached, getMyEventsCached, getUserDataCached } from './actions'
import { checkAuthenticated } from '@/utilities/checkAuthenticated'
import { redirect } from 'next/navigation'
import UserProfilePageClient from './page.client'
 import { User } from '@/payload-types'

export default async function UserProfilePage() {
    const authData = await checkAuthenticated()

    if (!authData?.user) {
        return redirect('/user')
    }

  let userTickets: Ticket[] = []
  try {

    const response = await getUserTicketsCached({ user: authData?.user as User & { collection: "users"; } })()
    userTickets = response as unknown as Ticket[]
  } catch (error) {
    console.error('Error fetching initial check-in history:', error)
  }

  let events: Event[] = []
  try {
    const response = await getMyEventsCached({ user: authData?.user as User & { collection: "users"; } })()
    events = response as unknown as Event[]
  } catch (error) {
    console.error('Error fetching initial events:', error)
  }

  let userData: User | null = null
  try {
    const response = await getUserDataCached({ user: authData?.user as User & { collection: "users"; } })()
    userData = response as unknown as User
  } catch (error) {
    console.error('Error fetching initial user data:', error)
  }

    return <UserProfilePageClient userTickets={userTickets as unknown as Ticket[]} events={events} userData={userData} />
}
