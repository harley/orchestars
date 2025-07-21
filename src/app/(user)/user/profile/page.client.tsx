'use client'
import React from 'react'
import { User } from '@/payload-types'
import UserProfile from '@/components/User/Profile'
import { useUserAuthenticated } from '../../providers'

const UserProfilePageClient: React.FC = () => {
  const authUser = useUserAuthenticated()

  return <UserProfile userData={authUser?.userInfo as User}/>
}

export default UserProfilePageClient
