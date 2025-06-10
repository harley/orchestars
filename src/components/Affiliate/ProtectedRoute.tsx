'use client'

import React from 'react'
import { redirect } from 'next/navigation'
import { useAffiliateAuthenticated } from '@/app/(affiliate)/providers/Affiliate'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/affiliate/login' }: ProtectedRouteProps) {
  const authUser = useAffiliateAuthenticated()

  if (authUser) {
    return <>{children}</>
  }

  redirect(redirectTo)
}
