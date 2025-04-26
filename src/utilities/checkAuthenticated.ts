import { getPayload } from '@/payload-config/getPayloadConfig'
import { headers as getHeaders } from 'next/headers'

export const checkAuthenticated = async () => {
  try {
    const payload = await getPayload()
    const headers = await getHeaders()

    return await payload.auth({ headers })
  } catch (_error) {
    return null
  }
}
