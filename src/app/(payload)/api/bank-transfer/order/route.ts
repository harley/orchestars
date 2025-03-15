import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import config from '@/payload.config'
import { Order, User } from '@/payload-types'
import { generateCode } from '@/utilities/generateCode'
import { PAYMENT_METHODS } from '@/constants/paymentMethod'
import { VIET_QR } from '@/config/payment'
import { APP_BASE_URL } from '@/config/app'
import { CustomerInfo, NewInputOrder, BankTransferTransaction } from './types'
import {
  checkSeatAvailable,
  checkEvents,
  clearSeatHolding,
  createCustomerIfNotExist,
  createOrderAndTickets,
} from './utils'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const customer = body.customer as CustomerInfo
  const transaction = body.transaction as BankTransferTransaction

  const order = body.order as NewInputOrder
  const orderItems = order.orderItems
  const orderCode = generateCode('ORD')

  try {
    await payload.init({ config })

    // check event id, ticket id is exist
    const events = await checkEvents({ orderItems, payload })

    // check seat available
    await checkSeatAvailable({ orderItems, payload })

    const amount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)

    const transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
      throw new Error('Có lỗi xảy ra! Vui lòng thử lại')
    }

    try {
      // 1 check user info, it not exist, will create a new one
      const customerData = await createCustomerIfNotExist({ customer, transactionID, payload })

      // create order
      const { newOrder } = await createOrderAndTickets({
        orderCode,
        customerData,
        orderItems,
        events,
        transactionID,
        currency: order.currency,
        payload,
      })

      // create payment record
      await createPayment({
        customerData,
        newOrder,
        transactionID,
        currency: order.currency,
        amount,
        transaction,
      })

      // todo write payment history
      // todo send mail

      // Commit the transaction
      await payload.db.commitTransaction(transactionID)

      const content = `${orderCode}`

      const encodedContent = encodeURIComponent(content)
      const bankName = VIET_QR.BANK_NAME
      const accountName = VIET_QR.ACCOUNT_NAME
      const accountNo = VIET_QR.ACCOUNT_NO
      const paymentLink = `${APP_BASE_URL}/payment/vietqr?amount=${amount}&contentBankTransfer=${encodedContent}&bankName=${bankName}&accountName=${accountName}&accountNo=${accountNo}`

      const nextResponse = NextResponse.json({ paymentLink, status: 200 })

      // clear seat holding code cookie and close session seat holding
      await clearSeatHolding({ nextResponse, payload })

      return nextResponse
    } catch (error) {
      // Rollback the transaction
      await payload.db.rollbackTransaction(transactionID)

      return NextResponse.json(
        { message: 'Có lỗi xảy ra! Vui lòng thử lại', error },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error('bank transfer create order error:', error)
    return NextResponse.json(
      { message: error?.message || 'Có lỗi xảy ra! Vui lòng thử lại' },
      { status: 400 },
    )
  }
}

const createPayment = async ({
  customerData,
  newOrder,
  currency,
  amount,
  transaction,
  transactionID,
}: {
  customerData: User
  newOrder: Order
  currency: string
  amount: number
  transaction: BankTransferTransaction
  transactionID: number | Promise<number | string> | string
}) => {
  await payload.create({
    collection: 'payments',
    data: {
      user: customerData.id,
      order: newOrder.id,
      paymentMethod: PAYMENT_METHODS.BANK_TRANSFER,
      currency,
      total: amount,
      transaction,
      status: 'processing',
    },
    req: { transactionID },
  })
}
