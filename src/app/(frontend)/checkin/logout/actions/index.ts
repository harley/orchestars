'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('payload-token')
    cookieStore.delete('token')

    redirect('/checkin')
  } catch (error) {
    console.error('error while logout', error)

    redirect('/checkin')
  }
}
