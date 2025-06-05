import { NextRequest, NextResponse } from 'next/server'
import { sendMailJob } from '@/collections/Emails/jobs/sendMail'
import { getPayload } from '@/payload-config/getPayloadConfig'
// import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-dynamic'
export const maxDuration = 120; 

export async function GET(req: NextRequest) {
  try {
    // Check for authorization header
    console.log('--> executing /api/cron/send-email\n')
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // Initialize Payload
    const payload = await getPayload()

    // Execute the mail job
    await sendMailJob({ payload })

    return NextResponse.json(
      { message: 'Mail job executed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error executing mail job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}