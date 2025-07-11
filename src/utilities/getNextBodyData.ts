import { NextRequest } from 'next/server'

export const getNextBodyData = async (request: NextRequest) => {
  try {
    const body = await request.json()

    return body
  } catch (_error) {
    return {}
  }
}
