'use server'

import ValidatePageClient from './page.client'
import ProtectedComponent from '@/components/CheckIn/Protected/ProtectedComponent'

export default async function TicketDetailsPage() {
  return (
    <ProtectedComponent>
      <ValidatePageClient />
    </ProtectedComponent>
  )
}
