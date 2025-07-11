import ChooseEventClientPage from './page.client'
import { getLocale } from '@/providers/I18n/server'
import { Event } from '@/types/Event'
import { getPublicEventsCached } from './actions'
import ProtectedComponent from '@/components/CheckIn/Protected/ProtectedComponent'

export default async function EventsPage() {
  return (
    <ProtectedComponent>
      <ChooseEventPage />
    </ProtectedComponent>
  )
}

const ChooseEventPage = async () => {
  const locale = await getLocale()
  const publicEvents = await getPublicEventsCached({
    locale,
  })()

  return <ChooseEventClientPage publicEvents={publicEvents as unknown as Event[]} />
}
