import MembershipPointPageClient from './page.client'
import ProtectedComponent from '@/components/User/Protected/Component'

export default function MyEventsPage() {
  return (
    <ProtectedComponent>
      <MembershipPointPageClient />
    </ProtectedComponent>
  )
}