'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie' // Client-side cookie reader
import { logout } from '@/app/(frontend)/checkin/logout/actions'
import { usePathname } from 'next/navigation'

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

  const path = usePathname()

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

  // const logout = () => {
  //   Cookies.remove('token')
  //   setTokenState(null)
  // }

  return (
    <AuthContext.Provider value={{ token, setToken, logout, isHydrated }}>
      <div className="relative">
        {children}

        {token && path !== '/checkin' && path !== '/user' && (
          <form action={logout}>
            <button
              type="submit"
              className="fixed bottom-4 right-4 bg-slate-800/80 hover:bg-slate-800 text-white py-2 px-4 rounded-md shadow-md flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </form>
        )}
      </div>
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
