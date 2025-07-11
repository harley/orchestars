import MembershipPointPageClient from './page.client'
import ProtectedComponent from '@/components/User/Protected/Component'

export default function MembershipPointPage() {
  return (
    <ProtectedComponent>
      <MembershipPointPageClient />
    </ProtectedComponent>
  )
}