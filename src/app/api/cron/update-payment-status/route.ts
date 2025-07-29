import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { updatePaymentStatus } from '@/collections/Payments/jobs/updatePaymentStatus'

export async function GET(req: NextRequest) {
  try {
    console.log('--> executing /api/cron/update-payment-status\n')
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize Payload
    const payload = await getPayload()

    // Execute the payment status update job
    await updatePaymentStatus({ payload })

    return NextResponse.json(
      {
        success: true,
        message: 'Payment status update job executed successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error executing payment status update job:', error)
    return NextResponse.json(
      {
        error: 'Failed to update payment status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}