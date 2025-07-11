'use server'

import { AuthProvider } from '@/providers/CheckIn/useAuth'
import { checkAuthenticated } from '@/utilities/checkAuthenticated'
import { redirect } from 'next/navigation'

const ProtectedComponent = async ({ children }: { children: React.ReactNode }) => {
  const authData = await checkAuthenticated()

  if (!authData?.user) {
    return redirect('/checkin')
  }

  return <AuthProvider authData={authData}>{children}</AuthProvider>
}

export default ProtectedComponent
