import { BasePayload, getPayload as getDefaultPayload } from 'payload'
import config from '@/payload.config'

let payload: BasePayload

export const getPayload = async () => {
  if (!payload) {
    payload = await getDefaultPayload({ config })
  }

  return payload
}
