import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import CryptoJS from 'crypto-js'
import config from '@/payload.config'
import { Event, Order, Promotion, User } from '@/payload-types'
import { generateCode } from '@/utilities/generateCode'
import { PAYMENT_METHODS } from '@/constants/paymentMethod'
import { VIET_QR } from '@/config/payment'
import { APP_BASE_URL } from '@/config/app'
import { CustomerInfo, NewInputOrder, BankTransferTransaction } from './types'
import {
  // checkSeatAvailable,
  checkEvents,
  clearSeatHolding,
  createCustomerIfNotExist,
  // createOrderAndTickets,
  checkPromotionCode,
  calculateTotalDiscount,
  createUserPromotionRedemption,
  checkTicketClassAvailable,
  createOrderAndTicketsWithTicketClassType,
} from './utils'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'

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

    // now support only 1 event
    const eventId = events?.[0]?.id as number

    // // check seat available
    // await checkSeatAvailable({ orderItems, payload })

    // check ticket class available
    await checkTicketClassAvailable({ orderItems, payload, event: events[0] as Event })

    const transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
      throw new Error('SYS001')
    }

    try {
      // 1 check user info, it not exist, will create a new one
      const customerData = await createCustomerIfNotExist({ customer, transactionID, payload })

      let promotion: Promotion | undefined
      // check promotion code if exist
      if (order.promotionCode) {
        promotion = await checkPromotionCode({
          promotionCode: order.promotionCode,
          eventId,
          userId: customerData.id,
          payload,
        })
      }

      const { amount, totalBeforeDiscount, totalDiscount } = calculateTotalDiscount({
        orderItems,
        promotion,
        event: events[0] as Event,
      })

      // create order
      // const { newOrder } = await createOrderAndTickets({
      //   orderCode,
      //   customerData,
      //   orderItems,
      //   promotion,
      //   events,
      //   transactionID,
      //   currency: order.currency,
      //   payload,
      // })

      // set expire time in 20 minutes
      const expireAt = new Date(Date.now() + 20 * 60 * 1000)
      const { newOrder } = await createOrderAndTicketsWithTicketClassType({
        orderCode,
        customerData,
        orderItems,
        promotion,
        events,
        transactionID,
        currency: order.currency,
        payload,
        customerInput: customer,
        expireAt,
      })

      // create payment record
      const payment = await createPayment({
        customerData,
        newOrder,
        transactionID,
        currency: order.currency,
        totalBeforeDiscount,
        amount,
        promotionId: promotion?.id,
        promotionCode: promotion?.code,
        totalDiscount,
        transaction,
        expireAt,
      })

      // todo write payment history
      // todo send mail

      // save user promotion redemption
      if (promotion) {
        await createUserPromotionRedemption({
          promotion,
          user: customerData,
          payment,
          eventId,
          transactionID,
          payload,
        })
      }

      // Commit the transaction

      await payload.db.commitTransaction(transactionID)

      const content = `${orderCode}`

      const encodedContent = encodeURIComponent(content)
      const bankName = VIET_QR.BANK_NAME
      const accountName = VIET_QR.ACCOUNT_NAME
      const accountNo = VIET_QR.ACCOUNT_NO

      const encryptKey = VIET_QR.ENCRYPT_KEY
      const to_encrypt_params = `amount=${amount}&contentBankTransfer=${encodedContent}&bankName=${bankName}&accountName=${accountName}&accountNo=${accountNo}`
      const encrypted_params = CryptoJS.AES.encrypt(to_encrypt_params, encryptKey)

      let encryptedString = encrypted_params.toString()

      encryptedString = Buffer.from(encryptedString).toString('base64')

      const paymentLink = `${APP_BASE_URL}/payment/vietqr?transactionKey=${encryptedString}`

      const nextResponse = NextResponse.json({ paymentLink, status: 200 })

      // clear seat holding code cookie and close session seat holding
      await clearSeatHolding({ nextResponse, payload })

      return nextResponse
    } catch (error) {
      // Rollback the transaction
      await payload.db.rollbackTransaction(transactionID)

      return NextResponse.json(
        { message: await handleNextErrorMsgResponse(error), error },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error('bank transfer create order error:', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}

const createPayment = async ({
  customerData,
  newOrder,
  currency,
  totalBeforeDiscount,
  promotionCode,
  promotionId,
  totalDiscount,
  amount,
  transaction,
  transactionID,
  expireAt,
}: {
  customerData: User
  newOrder: Order
  currency: string
  totalBeforeDiscount: number
  promotionId?: number
  promotionCode?: string
  totalDiscount?: number
  amount: number
  transaction: BankTransferTransaction
  transactionID: number | Promise<number | string> | string
  expireAt: Date
}) => {
  return await payload.create({
    collection: 'payments',
    data: {
      user: customerData.id,
      order: newOrder.id,
      paymentMethod: PAYMENT_METHODS.BANK_TRANSFER,
      currency,
      promotionCode,
      promotion: promotionId,
      totalBeforeDiscount,
      totalDiscount,
      total: amount,
      transaction,
      expireAt: expireAt.toISOString(),
      status: 'processing',
    },
    req: { transactionID },
  })
}
