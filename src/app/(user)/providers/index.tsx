'use client'

import React, { createContext, useContext } from 'react'
import { AuthUser } from '../types'

type UserContextType = {
  authUser?: AuthUser | null
}

type UserProvidersProps = {
  children: React.ReactNode
  authUser?: AuthUser | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProviders({ children, authUser }: UserProvidersProps) {
  const value: UserContextType = {
    authUser,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUserAuthenticated() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserAuthenticated must be used within an UserProvider')
  }

  return context?.authUser
}
