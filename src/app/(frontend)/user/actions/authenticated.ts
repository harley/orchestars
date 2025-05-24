'use server'

import { JWT_USER_SECRET } from '@/config/jwt'
import { extractJWT } from '@/utilities/jwt'
import { cookies } from 'next/headers'

export const checkUserAuthenticated = async () => {
  const cookie = await cookies()
  // todo verify auth token
  const authToken = cookie.get('authToken')

  console.log('authToken', authToken)

  const extracted = await extractJWT(authToken?.value as string, JWT_USER_SECRET)
  if(!extracted) return null

  return {
    token: authToken?.value,
    userInfo: extracted as { id: number; email: string },
  }
}
