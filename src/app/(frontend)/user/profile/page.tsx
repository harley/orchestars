import { Ticket } from '@/types/Ticket'
import { getUserTicketsCached } from './actions'
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

    return <UserProfilePageClient userTickets={userTickets as unknown as Ticket[]} />
}
