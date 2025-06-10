import { JWT_USER_SECRET } from '@/config/jwt'
import { extractJWT } from '@/utilities/jwt'
import { cookies } from 'next/headers'

export const authorizeApiRequest = async () => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('authToken')

  if (!authToken) {
    throw new Error('Authentication required')
  }

  // Verify the JWT token
  const userRequest = await extractJWT(authToken.value, JWT_USER_SECRET)
  if (!userRequest || userRequest.role !== 'affiliate') {
    throw new Error('Invalid token')
  }

  return userRequest as { id: number; email: string }
}
