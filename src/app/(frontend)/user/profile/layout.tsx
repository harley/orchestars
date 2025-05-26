import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/providers/CheckIn/useAuth'
import { ReactNode } from 'react'
// import { checkUserAuthenticated } from '../actions/authenticated'

export default async function RootLayout({ children }: { children: ReactNode }) {

  // todo pass authData to AuthProvider
  // const authData = await checkUserAuthenticated()

  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  )
}