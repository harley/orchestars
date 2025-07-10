import { NextRequest, NextResponse } from 'next/server'
import CryptoJS from 'crypto-js'
import { ZALO_PAYMENT } from '@/config/payment'
import payload from 'payload'
import config from '@/payload.config'
import { logError } from '@/collections/Logs/utils'
import { Order, Payment } from '@/payload-types'
// import { Event } from '@/payload-types'

export async function POST(request: NextRequest) {
  let body: any = null
  let callbackData: any = null
  let payment: Payment | null = null
  try {
    body = await request.json()
    console.log('Received body:', body)

    const { data: dataStr, mac: reqMac } = body
    const computedMac = CryptoJS.HmacSHA256(dataStr, ZALO_PAYMENT.KEY2).toString()

    if (reqMac !== computedMac) {
      console.error('Mac verification failed:', { reqMac, computedMac })
      return jsonResponse(-1, 'Mac verification failed')
    }

    callbackData = JSON.parse(dataStr)

    console.log('callbackData', callbackData)
    const appTransId = callbackData?.app_trans_id

    await initPayload()

    payment = await findPayment(appTransId)
    if (!payment) {
      throw new Error('Payment record not found')
    }

    if (payment.status !== 'processing') {
      throw new Error('Payment is not in processing status')
    }

    const transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
      throw new Error('Có lỗi xảy ra! Vui lòng thử lại')
    }
    try {
      const paymentData = {
        ...(payment.paymentData as Record<string, any>),
        callbackData,
      }
      await updatePaymentStatus(payment.id, transactionID, paymentData)

      // No need to update the order status and ticket status here. The status update action runs in the hook of Payment Collection.
      // await updateOrderStatus((payment.order as Order)?.id, transactionID)
      // await updateTicketStatus((payment.order as Order)?.id, transactionID)

      console.log(`Order status updated successfully for app_trans_id = ${appTransId}`)
      await payload.db.commitTransaction(transactionID)
      return jsonResponse(1, 'Success')
    } catch (error: any) {
      await payload.db.rollbackTransaction(transactionID)

      await logError({
        payload,
        action: 'PAYMENT_CALLBACK_ERROR',
        description: `Error processing payment callback: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
        data: {
          error: {
            error,
            stack: error?.stack,
            errorMessage:
              error instanceof Error ? error.message : error || 'An unknown error occurred',
          },
          data: { requestBody: body, callbackData },
        },
        req: request,
        payment: payment?.id || null,
        order: (payment?.order as Order)?.id || null,
      })
      return jsonResponse(0, error instanceof Error ? error.message : 'An unknown error occurred')
    }
  } catch (error: any) {
    console.error('Error processing payment:', error)
    await logError({
      payload,
      action: 'PAYMENT_CALLBACK_ERROR',
      description: `Error processing payment callback: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
      data: {
        error: {
          error,
          stack: error?.stack,
          errorMessage:
            error instanceof Error ? error.message : error || 'An unknown error occurred',
        },
        data: { requestBody: body, callbackData },
      },
      req: request,
      payment: payment?.id || null,
      order: (payment?.order as Order)?.id || null,
    })

    return jsonResponse(0, 'An unknown error occurred')
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

async function updatePaymentStatus(
  paymentId: number,
  transactionID: number | Promise<number | string> | string,
  paymentData: Record<string, any>,
) {
  return payload.update({
    collection: 'payments',
    id: paymentId,
    data: {
      status: 'paid',
      paidAt: new Date().toISOString(),
      paymentData: paymentData,
    },
    req: { transactionID },
  })
}

// async function updateOrderStatus(
//   orderId: number,
//   transactionID: number | Promise<number | string> | string,
// ) {
//   return payload.update({
//     collection: 'orders',
//     id: orderId,
//     data: { status: 'completed' },
//     req: { transactionID },
//   })
// }

// async function updateTicketStatus(
//   orderId: number,
//   transactionID: number | Promise<number | string> | string,
// ) {
//   const orderItems = await payload
//     .find({
//       collection: 'orderItems',
//       where: { order: { equals: orderId } },
//     })
//     .then((res) => res.docs)

//   if (!orderItems?.length) {
//     return
//   }

//   await Promise.all(
//     orderItems.map((oItem) =>
//       payload.update({
//         collection: 'tickets',
//         where: {
//           orderItem: { equals: oItem.id },
//           event: { equals: (oItem.event as Event).id },
//         },
//         data: {
//           status: 'booked',
//         },
//         req: { transactionID },
//       }),
//     ),
//   )
// }

function jsonResponse(code: number, message: string) {
  return NextResponse.json({ return_code: code, message })
}

const initPayload = async () => {
  const maxRetries = 3
  let retries = 0
  while (retries < maxRetries) {
    try {
      await payload.init({ config })

      break
    } catch (error: any) {
      console.error(`Failed to initialize payload. Retry ${retries + 1}/${maxRetries}`)
      retries++
      if (retries === maxRetries) {
        throw new Error(
          `Failed to initialize payload after multiple attempts: ${error?.message || ''}`,
        )
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait for 1 second before retrying
    }
  }
}
