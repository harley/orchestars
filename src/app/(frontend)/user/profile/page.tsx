import { getUserData } from './actions'
import { redirect } from 'next/navigation'
import UserProfilePageClient from './page.client'
import { User } from '@/payload-types'
import { checkUserAuthenticated } from '../actions/authenticated'

export default async function UserProfilePage() {
  const authData = await checkUserAuthenticated()

  if (!authData) {
    return redirect('/')
  }

  const userId = authData.userInfo.id

  const userData = await getUserData({ userId: userId })

  return (
    <UserProfilePageClient
      userData={userData as User}
    />
  )
}
