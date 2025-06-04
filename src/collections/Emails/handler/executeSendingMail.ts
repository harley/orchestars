import { NextResponse } from 'next/server'
import { PayloadRequest } from 'payload'

import { sendMailJob } from '../jobs/sendMail'

export const executeSendingMailHandler = async (req: PayloadRequest) => {
  try {
    // Check for authorization header
    console.log('--> executing executeSendingMailHandler\n')
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = req.payload

    // Validate request origin
    // const origin = req.headers.get('origin')
    // const referer = req.headers.get('referer')
    // const serverUrl = getServerSideURL()

    // // Allow requests from Vercel cron jobs (no origin/referer) or from the same domain
    // const isValidOrigin = !origin || origin === serverUrl
    // const isValidReferer = !referer || referer.startsWith(serverUrl)

    // if (!isValidOrigin || !isValidReferer) {
    //   return NextResponse.json(
    //     { error: 'Invalid request origin' },
    //     { status: 403 }
    //   )
    // }

    // Execute the mail job
    await sendMailJob({ payload })

    return NextResponse.json({ message: 'Mail job executed successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error executing mail job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
