import React from 'react'
import LoginPageClient from './page.client'
import { checkAuthenticated } from '@/utilities/checkAuthenticated'
import { redirect } from 'next/navigation'

const LoginPage = async () => {
  const authData = await checkAuthenticated()

  if (authData?.user) {
    return redirect('/checkin/events')
  }

  return <LoginPageClient />
}

export default LoginPage
