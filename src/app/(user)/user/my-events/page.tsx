import ProtectedComponent from '@/components/User/Protected/Component'
import MyEventsPageClient from './page.client'

export default function MyEventsPage() {
  return (
    <ProtectedComponent>
      <MyEventsPageClient />
    </ProtectedComponent>
  )
}
