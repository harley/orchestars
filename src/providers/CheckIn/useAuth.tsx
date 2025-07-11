'use client'

import { createContext, useContext } from 'react'
import { logout } from '@/app/(frontend)/checkin/logout/actions'
import { usePathname } from 'next/navigation'

type AdminCheckInAuthResult = {
  user: any
}

type AuthContextType = {
  authData
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({
  children,
  authData,
}: {
  children: React.ReactNode
  authData: AdminCheckInAuthResult
}) => {
  const path = usePathname()

  return (
    <AuthContext.Provider value={{ authData }}>
      <div className="relative">
        {children}

        {path !== '/checkin' && (
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
