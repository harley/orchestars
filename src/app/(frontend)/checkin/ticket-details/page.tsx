'use server'

import { checkAuthenticated } from '@/utilities/checkAuthenticated'
import TicketDetailsPageClient from './page.client'
import { redirect } from 'next/navigation'

export default async function TicketDetailsPage() {
  const authData = await checkAuthenticated()

  if (!authData?.user) {
    return redirect('/checkin')
  }

  return <TicketDetailsPageClient />
}
