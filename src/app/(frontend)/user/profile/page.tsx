import { getLocale } from '@/providers/I18n/server'
import { Ticket } from '@/types/Ticket'
import { getUserTicketsCached } from './actions'
import { checkAuthenticated } from '@/utilities/checkAuthenticated'
import { redirect } from 'next/navigation'
import UserProfilePageClient from './page.client'

export default async function UserProfilePage() {
  const authData = await checkAuthenticated()

  if (!authData?.user) {
    return redirect('/user')
  }

  const locale = await getLocale()

  const userTickets = await getUserTicketsCached({ user: authData?.user })()

  return <UserProfilePageClient userTickets={userTickets as unknown as Ticket[]} />
}
