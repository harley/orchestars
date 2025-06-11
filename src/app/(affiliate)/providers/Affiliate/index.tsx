'use client'

import React, { createContext, useContext } from 'react'
import { Event } from '@/payload-types'
import { SupportedLocale } from '@/config/app'

type AuthUser = {
  token: string
  userInfo: { id: number; email: string } & Record<string, any>
}

type AffiliateContextType = {
  events: Event[]
  authUser?: AuthUser | null
}

type AffiliateProvidersProps = {
  children: React.ReactNode
  initialEvents?: Event[]
  locale?: SupportedLocale
  authUser?: AuthUser | null
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined)

export function AffiliateProviders({
  children,
  initialEvents = [],
  authUser,
}: AffiliateProvidersProps) {
  const value: AffiliateContextType = {
    events: initialEvents,
    authUser,
  }

  return <AffiliateContext.Provider value={value}>{children}</AffiliateContext.Provider>
}

export function useAffiliateAuthenticated() {
  const context = useContext(AffiliateContext)
  if (context === undefined) {
    throw new Error('useAffiliateAuthenticated must be used within an AffiliateProvider')
  }

  return context?.authUser
}

// Keep the old useEvents hook for backward compatibility
export function useEvents(): { events: Event[] } {
  const context = useContext(AffiliateContext)
  if (context === undefined) {
    throw new Error('useEvents must be used within an AffiliateProvider')
  }
  return { events: context.events }
}
