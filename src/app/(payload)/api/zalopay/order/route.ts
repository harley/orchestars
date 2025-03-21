import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import payload from 'payload'
import { format, getTime } from 'date-fns'
import { ZALO_PAYMENT } from '@/config/payment'
import config from '@/payload.config'
import { Event, Order, Promotion, User } from '@/payload-types'
import { PAYMENT_METHODS } from '@/constants/paymentMethod'
import { generateCode } from '@/utilities/generateCode'
import {
  calculateTotalDiscount,
  checkEvents,
  checkPromotionCode,
  // checkSeatAvailable,
  checkTicketClassAvailable,
  clearSeatHolding,
  createCustomerIfNotExist,
  // createOrderAndTickets,
  createOrderAndTicketsWithTicketClassType,
  createUserPromotionRedemption,
} from '@/app/(payload)/api/bank-transfer/order/utils'

import {
  CustomerInfo,
  NewInputOrder,
  NewOrderItem,
} from '@/app/(payload)/api/bank-transfer/order/types'

interface ZaloPayOrder {
  title?: string
  app_id: string
  app_trans_id: string
  app_user: string
  app_time: number
  item: string
  embed_data: string
  amount: number
  description: string
  mac: string
  callback_url?: string
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const customer = body.customer as CustomerInfo

  const order = body.order as NewInputOrder
  const orderItems = order.orderItems

  const orderCode = generateCode('ORD')

  try {
    await payload.init({ config })

    // // check seat available
    // await checkSeatAvailable({ orderItems, payload })

    // check event id, ticket id is exist
    const events = await checkEvents({ orderItems, payload })

    // check ticket class available
    await checkTicketClassAvailable({ orderItems, payload, event: events[0] as Event })

    const transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
      throw new Error('Có lỗi xảy ra! Vui lòng thử lại')
    }

    try {
      // 1 check user info, it not exist, will create a new one
      const customerData = await createCustomerIfNotExist({ customer, transactionID, payload })

      // now support only 1 event
      const eventId = events?.[0]?.id as number

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

      const { zalopayDataOrder } = generateZaloPayOrderData({
        orderCode,
        amount,
        orderItems,
        customer,
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
      })

      // create payment record
      const payment = await createPayment({
        customerData,
        newOrder,
        promotionId: promotion?.id,
        promotionCode: promotion?.code,
        totalDiscount,
        totalBeforeDiscount,
        zaloPayOrder: zalopayDataOrder,
        transactionID,
        currency: order.currency,
      })

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

      const { result: resultData } = await createZaloPaymentLink({
        zalopayDataOrder,
      })

      // todo write payment history

      // Commit the transaction
      await payload.db.commitTransaction(transactionID)

      const nextResponse = NextResponse.json(resultData, { status: 200 })

      // clear seat holding code cookie and close session seat holding
      await clearSeatHolding({ nextResponse, payload })

      return nextResponse
    } catch (error) {
      // Rollback the transaction
      console.error('ZaloPay transaction create order error:', error)
      await payload.db.rollbackTransaction(transactionID)

      return NextResponse.json(
        { message: 'Có lỗi xảy ra! Vui lòng thử lại', error },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error('ZaloPay create order error:', error)
    return NextResponse.json(
      { message: error?.message || 'Có lỗi xảy ra! Vui lòng thử lại' },
      { status: 400 },
    )
  }
}

const generateZaloPayOrderData = ({
  orderCode,
  orderItems,
  amount,
  customer,
}: {
  orderCode: string
  amount: number
  orderItems: NewOrderItem[]
  customer: CustomerInfo
}) => {
  const embed_data = {
    preferred_payment_method: 'Zalopay_wallet',
    redirecturl: ZALO_PAYMENT.REDIRECT_URL,
    columninfo: JSON.stringify({ orderCode }),
    promotioninfo: JSON.stringify({}),
  }

  const app_user = customer.email

  const app_time = getTime(new Date())

  const title = `Order #${orderCode}`
  const app_trans_id = `${format(new Date(), 'yyMMdd')}-${app_time}-${Math.floor(Math.random() * 1000000000)}`

  const zalopayDataOrder: ZaloPayOrder = {
    title,
    app_id: ZALO_PAYMENT.APP_ID,
    app_trans_id,
    app_user,
    app_time,
    item: JSON.stringify(orderItems),
    embed_data: JSON.stringify(embed_data),
    amount,
    description: `Payment for order #${orderCode}`,
    mac: '',
    callback_url: ZALO_PAYMENT.CALLBACK_URL,
  }

  const data = [
    zalopayDataOrder.app_id,
    zalopayDataOrder.app_trans_id,
    zalopayDataOrder.app_user,
    zalopayDataOrder.amount,
    zalopayDataOrder.app_time,
    zalopayDataOrder.embed_data,
    zalopayDataOrder.item,
  ].join('|')

  zalopayDataOrder.mac = CryptoJS.HmacSHA256(data, ZALO_PAYMENT.KEY1).toString()

  console.log('zalopayDataOrder', zalopayDataOrder)

  return { zalopayDataOrder }
}

const createZaloPaymentLink = async ({ zalopayDataOrder }: { zalopayDataOrder: ZaloPayOrder }) => {
  const response = await axios.post(`${ZALO_PAYMENT.ENDPOINT}/v2/create`, null, {
    params: zalopayDataOrder,
  })
  const resultData = response.data
  console.log('resultData', resultData)

  if (resultData?.return_code === 2) {
    throw new Error(resultData)
  }

  return {
    result: resultData,
  }
}

const createPayment = async ({
  customerData,
  newOrder,
  zaloPayOrder,
  totalBeforeDiscount,
  promotionCode,
  promotionId,
  totalDiscount,
  transactionID,
  currency,
}: {
  customerData: User
  newOrder: Order
  currency: string
  zaloPayOrder: ZaloPayOrder
  totalBeforeDiscount: number
  promotionId?: number
  promotionCode?: string
  totalDiscount?: number
  transactionID: number | Promise<number | string> | string
}) => {
  return await payload.create({
    collection: 'payments',
    data: {
      user: customerData.id,
      order: newOrder.id,
      paymentMethod: PAYMENT_METHODS.ZALOPAY,
      currency,
      promotionCode,
      promotion: promotionId,
      totalBeforeDiscount,
      totalDiscount,
      total: zaloPayOrder.amount,
      status: 'processing',
      appTransId: zaloPayOrder.app_trans_id,
      paymentData: {
        app_trans_id: zaloPayOrder.app_trans_id,
        app_id: ZALO_PAYMENT.APP_ID,
        app_time: zaloPayOrder.app_time,
        app_user: zaloPayOrder.app_user,
        embed_data: zaloPayOrder.embed_data,
        item: zaloPayOrder.item,
        server_time: zaloPayOrder.app_time,
        amount: zaloPayOrder.amount,
      },
    },
    req: { transactionID },
  })
}
