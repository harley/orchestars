'use server'

import { JWT_USER_SECRET } from '@/config/jwt'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { extractJWT } from '@/utilities/jwt'
import { cookies } from 'next/headers'

export const checkUserAuthenticated = async () => {
  const cookie = await cookies()
  // todo verify auth token
  const authToken = cookie.get('authToken')
  if (!authToken?.value) return null

  const extracted = (await extractJWT(authToken.value as string, JWT_USER_SECRET)) as {
    id: number
    email: string
  } & Record<string, any>

  if (!extracted) return null

  const payload = await getPayload()

  // refactor this code
  const affiliateUser = await payload.findByID({
    collection: 'users',
    id: extracted.id,
    depth: 0,
  })

  // console.log('affiliateUser', affiliateUser)

  if (affiliateUser?.role !== 'affiliate') return null

  if (affiliateUser.affiliateStatus !== 'approved') return null

  return {
    token: authToken?.value as string,
    userInfo: {
      ...extracted,
      role: affiliateUser.role,
      affiliateStatus: affiliateUser.affiliateStatus,
    },
  }
}
