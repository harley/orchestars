import { NextRequest, NextResponse } from 'next/server'
import CryptoJS from 'crypto-js'
import { ZALO_PAYMENT } from '@/config/payment'
import payload from 'payload'
import config from '@/payload.config'
import { Order } from '@/payload-types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received body:', body)

    const { data: dataStr, mac: reqMac } = body
    const computedMac = CryptoJS.HmacSHA256(dataStr, ZALO_PAYMENT.KEY2).toString()

    if (reqMac !== computedMac) {
      console.error('Mac verification failed:', { reqMac, computedMac })
      return jsonResponse(-1, 'Mac verification failed')
    }

    const dataJson = JSON.parse(dataStr)

    console.log('dataJson', dataJson)
    const appTransId = dataJson.app_trans_id

    await payload.init({ config })

    const payment = await findPayment(appTransId)
    if (!payment) {
      return jsonResponse(-1, 'Payment record not found')
    }

    if (payment.status !== 'processing') {
      return jsonResponse(0, 'Payment is not in processing status')
    }

    await updatePaymentStatus(payment.id)
    await updateOrderStatus((payment.order as Order)?.id)

    console.log(`Order status updated successfully for app_trans_id = ${appTransId}`)
    return jsonResponse(1, 'Success')
  } catch (error: unknown) {
    console.error('Error processing payment:', error)
    return jsonResponse(0, error instanceof Error ? error.message : 'An unknown error occurred')
  }
}

async function findPayment(appTransId: string) {
  const result = await payload.find({
    collection: 'payments',
    where: { appTransId: { equals: appTransId } },
    limit: 1,
  })

  return result.docs?.[0] || null
}

async function updatePaymentStatus(paymentId: number) {
  return payload.update({
    collection: 'payments',
    id: paymentId,
    data: {
      status: 'paid',
      paidAt: new Date().toISOString(),
    },
  })
}

async function updateOrderStatus(orderId: number) {
  return payload.update({
    collection: 'orders',
    id: orderId,
    data: { status: 'completed' },
  })
}

function jsonResponse(code: number, message: string) {
  return NextResponse.json({ return_code: code, return_message: message })
}
