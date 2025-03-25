import { ZaloPayOrder } from '../types'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { BasePayload } from 'payload'
import { format, getTime } from 'date-fns'
import { ZALO_PAYMENT } from '@/config/payment'
import { Order, User } from '@/payload-types'
import { PAYMENT_METHODS } from '@/constants/paymentMethod'

import { CustomerInfo, NewOrderItem } from '@/app/(payload)/api/bank-transfer/order/types'

export const generateZaloPayOrderData = ({
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
    description: `ORCHESTARS - Payment for order #${orderCode}`,
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

export const createZaloPaymentLink = async ({
  zalopayDataOrder,
}: {
  zalopayDataOrder: ZaloPayOrder
}) => {
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

export const createPayment = async ({
  customerData,
  newOrder,
  zaloPayOrder,
  totalBeforeDiscount,
  promotionCode,
  promotionId,
  totalDiscount,
  transactionID,
  expireAt,
  currency,
  payload,
}: {
  customerData: User
  newOrder: Order
  currency: string
  zaloPayOrder: ZaloPayOrder
  totalBeforeDiscount: number
  promotionId?: number
  promotionCode?: string
  totalDiscount?: number
  expireAt: Date
  transactionID: number | Promise<number | string> | string
  payload: BasePayload
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
      expireAt: expireAt.toISOString(),
      paymentData: {
        ...zaloPayOrder,
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
