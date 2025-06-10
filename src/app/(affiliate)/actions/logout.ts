'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('authToken')

    redirect('/affiliate/login')
  } catch (error) {
    console.error('error while logout affiliate account', error)

    redirect('/affiliate/login')
  }
}
