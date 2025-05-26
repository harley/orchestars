import { Ticket } from '@/types/Ticket'
import { getUserTickets, getUserData } from './actions'
import { redirect } from 'next/navigation'
import UserProfilePageClient from './page.client'
import { Event, User } from '@/payload-types'
import { checkUserAuthenticated } from '../actions/authenticated'

export default async function UserProfilePage() {
  const authData = await checkUserAuthenticated()

  if (!authData) {
    return redirect('/')
  }

  const userId = authData.userInfo.id

  const userTickets = await getUserTickets({ userId: userId })
  const userData = await getUserData({ userId: userId })

  return (
    <UserProfilePageClient
      userTickets={userTickets as unknown as Ticket[]}
      events={[]}
      userData={userData as User}
    />
  )
}
