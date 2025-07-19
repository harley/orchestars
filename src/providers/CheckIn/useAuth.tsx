'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie' // Client-side cookie reader
import { logout } from '@/app/(checkin)/checkin/logout/actions'

type AuthContextType = {
  token: string | null
  setToken: (token: string) => void
  logout: () => void
  isHydrated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const cookieToken = Cookies.get('token')

    if (cookieToken) {
      setTokenState(cookieToken)
    }
    setIsHydrated(true)
  }, [])

  const setToken = (token: string) => {
    Cookies.set('token', token, {
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    })
    setTokenState(token)
  }

  return (
    <AuthContext.Provider value={{ token, setToken, logout, isHydrated }}>
      <div className="relative">
        {children}

      </div>
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
