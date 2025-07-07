'use server'

import { JWT_USER_SECRET } from '@/config/jwt'
import { extractJWT } from '@/utilities/jwt'
import { cookies } from 'next/headers'
import { AuthUser } from '@/app/(user)/types'

export const checkUserAuthenticated = async (): Promise<AuthUser | null> => {
  const cookie = await cookies()
  // todo verify auth token
  const authToken = cookie.get('authToken')

  const extracted = await extractJWT(authToken?.value as string, JWT_USER_SECRET)
  if(!extracted) return null

  return {
    token: authToken?.value as string,
    userInfo: extracted as { id: number; email: string },
  }
}
