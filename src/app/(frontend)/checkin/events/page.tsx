import ChooseEventClientPage from './page.client'
import { getLocale } from '@/providers/I18n/server'
import { Event } from '@/types/Event'
import { getPublicEventsCached } from './actions'

export default async function ChooseEventPage() {
  const locale = await getLocale()
  const publicEvents = await getPublicEventsCached({
    locale,
  })()

  return <ChooseEventClientPage publicEvents={publicEvents as unknown as Event[]} />
}
