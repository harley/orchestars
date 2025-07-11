import ProtectedComponent from '@/components/User/Protected/Component'
import MyTicketsPageClient from './page.client'

export default function MyTicketsPage() {
  return (
    <ProtectedComponent>
      <MyTicketsPageClient />
    </ProtectedComponent>
  )
}
