import { NextRequest, NextResponse } from 'next/server'
import CryptoJS from 'crypto-js'
import { ZALO_PAYMENT } from '@/config/payment'
import payload from 'payload'
import config from '@/payload.config'
// import { Event } from '@/payload-types'

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

    const transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
      throw new Error('Có lỗi xảy ra! Vui lòng thử lại')
    }
    try {
      const paymentData = {
        ...(payment.paymentData as Record<string, any>),
        callbackData: dataJson,
      }
      await updatePaymentStatus(payment.id, transactionID, paymentData)

      // No need to update the order status and ticket status here. The status update action runs in the hook of Payment Collection.
      // await updateOrderStatus((payment.order as Order)?.id, transactionID)
      // await updateTicketStatus((payment.order as Order)?.id, transactionID)

      console.log(`Order status updated successfully for app_trans_id = ${appTransId}`)
      await payload.db.commitTransaction(transactionID)
      return jsonResponse(1, 'Success')
    } catch (error) {
      await payload.db.rollbackTransaction(transactionID)
      return jsonResponse(0, error instanceof Error ? error.message : 'An unknown error occurred')
    }
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
