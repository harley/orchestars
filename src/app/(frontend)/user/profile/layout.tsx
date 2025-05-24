import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/providers/CheckIn/useAuth'
import { ReactNode } from 'react'
import { checkUserAuthenticated } from '../actions/authenticated'

export default async function RootLayout({ children }: { children: ReactNode }) {

  const authData = await checkUserAuthenticated()

  console.log('authData', authData)

  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  )
}