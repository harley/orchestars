import ProtectedComponent from '@/components/User/Protected/Component'
import UserProfilePageClient from './page.client'

export default async function UserProfilePage() {
  return (
    <ProtectedComponent>
      <UserProfilePageClient />
    </ProtectedComponent>
  )
}
