import { NextRequest } from 'next/server'

export const checkAuthorizedCronJob = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization')
  const CRON_SECRET = process.env.CRON_SECRET

  if (!CRON_SECRET) {
    return false
  }

  return authHeader === `Bearer ${CRON_SECRET}`
}
