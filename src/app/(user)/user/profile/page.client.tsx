'use client'
import React from 'react'
import { User } from '@/payload-types'
import AccountSettings from '@/components/User/AccountSettings'
import { useUserAuthenticated } from '../../providers'

const UserProfilePageClient: React.FC = () => {
  const authUser = useUserAuthenticated()

  return <AccountSettings userData={authUser?.userInfo as User} />
}

export default UserProfilePageClient
