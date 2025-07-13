import type { Admin } from '@/payload-types'
import { cookies } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'

export const getAdminUser = async (): Promise<Admin | null> => {
  noStore()

  const cookieStore = await cookies()
  const adminToken = cookieStore.get('payload-token')?.value

  if (!adminToken) {
    return null
  }

  try {
    const meRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admins/me`, {
      headers: {
        Authorization: `JWT ${adminToken}`,
      },
      cache: 'no-store',
    })

    if (!meRes.ok) {
      return null
    }

    const { user } = (await meRes.json()) as { user: Admin }
    return user
  } catch (error) {
    console.error('Error fetching admin user:', error)
    return null
  }
}