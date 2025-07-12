import ChooseEventClientPage from './page.client'
import { getLocale } from '@/providers/I18n/server'
import { Event } from '@/types/Event'
import { getPublicEventsCached } from './actions'
import { checkAuthenticated } from '@/utilities/checkAuthenticated'
import { redirect } from 'next/navigation'

export default async function ChooseEventPage() {
  const authData = await checkAuthenticated()

  if (!authData?.user) {
    return redirect('/checkin')
  }

  const locale = await getLocale()
  const publicEvents = await getPublicEventsCached({
    locale,
  })()

  return <ChooseEventClientPage publicEvents={publicEvents as unknown as Event[]} />
}
