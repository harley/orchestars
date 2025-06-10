'use server'

import { JWT_USER_SECRET } from '@/config/jwt'
import { extractJWT } from '@/utilities/jwt'
import { cookies } from 'next/headers'

export const checkUserAuthenticated = async () => {
  const cookie = await cookies()
  // todo verify auth token
  const authToken = cookie.get('authToken')

  const extracted = await extractJWT(authToken?.value as string, JWT_USER_SECRET)
  if (!extracted) return null
  if (extracted?.role !== 'affiliate') return null

  return {
    token: authToken?.value as string,
    userInfo: extracted as unknown as { id: number; email: string } & Record<string, any>,
  }
}
