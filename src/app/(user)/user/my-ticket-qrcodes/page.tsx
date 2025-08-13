import ProtectedComponent from '@/components/User/Protected/Component'
import MyTicketQRCodesPageClient from './page.client'

export default function MyTicketQRCodesPage() {
  return (
    <ProtectedComponent>
      <MyTicketQRCodesPageClient />
    </ProtectedComponent>
  )
}
