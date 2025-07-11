import { getPayload } from '@/payload-config/getPayloadConfig'
import { headers as getHeaders } from 'next/headers'
import { cache } from 'react'

export const checkAuthenticated = cache(async () => {
  try {
    const payload = await getPayload()
    const headers = await getHeaders()

    return await payload.auth({ headers })
  } catch (_error) {
    return null
  }
})
