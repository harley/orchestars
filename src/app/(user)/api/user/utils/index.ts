import { JWT_USER_EXPIRATION, JWT_USER_SECRET } from '@/config/jwt'
import { jwtSign } from '@/utilities/jwt'
import { cookies } from 'next/headers'

export const signJwtToken = async ({ fieldsToSign }: { fieldsToSign: Record<string, any> }) => {
  // Generate JWT (payloadcms uses user id and email)
  const token = await jwtSign({
    fieldsToSign,
    secret: JWT_USER_SECRET,
    tokenExpiration: JWT_USER_EXPIRATION,
  })

  const cookieStore = await cookies()
  cookieStore.set('authToken', token.token, {
    expires: token.exp * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}
