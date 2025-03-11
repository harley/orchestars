import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import payload, { WhereField } from 'payload'
import { format, getTime } from 'date-fns'
import { ZALO_PAYMENT } from '@/config/payment'
import config from '@/payload.config'

interface CustomerInfo {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
}

interface OrderItem {
  price: number
  quantity: number
  seat: string
  eventId: number
  ticketPriceId: string
}

interface Order {
  currency: string
  orderItems: OrderItem[]
}

const generateCode = (prefix: string): string => {
  const timestamp = Date.now().toString().slice(-6) // Last 6 digits of the timestamp
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() // 4-character random string

  return `${prefix}-${timestamp}-${randomPart}`
}

export async function POST(request: NextRequest) {
  // parse JSON body if needed:
  // const body = await request.json() // if you expect a JSON body from the client
  const body = await request.json()
  console.log('body', body)

  const customer = body.customer as CustomerInfo

  const order = body.order as Order
  const orderItems = order.orderItems

  // todo
  // 1 check user info, it not exist, will create a new one
  // 2 check event id, ticket id is exist
  // 3 check seat is available
  // 4 create order
  // 5 create order items
  // 6 create payment
  //

  const orderCode = generateCode('ORD')

  const embed_data = {
    preferred_payment_method: 'Zalopay_wallet',
    redirecturl: 'http://localhost:3000/payment/result',
    columninfo: JSON.stringify({ orderCode }),
    promotioninfo: JSON.stringify({}),
  }

  const amount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)

  const app_user = customer.email

  const app_time = getTime(new Date())

  const title = `Order #${orderCode}`
  const app_trans_id = `${format(new Date(), 'yyMMdd')}-${app_time}-${Math.floor(Math.random() * 1000000000)}`

  const zalopayDataOrder = {
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
    callback_url: 'https://65ae-14-191-175-74.ngrok-free.app/api/zalopay/callback',
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

  try {
    const response = await axios.post(`${ZALO_PAYMENT.ENDPOINT}/v2/create`, null, {
      params: zalopayDataOrder,
    })
    const resultData = response.data

    if (resultData?.return_code === 2) {
      return NextResponse.json(resultData, { status: 400 })
    }

    console.log('resultData', resultData)

    await payload.init({ config })

    const transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
      throw new Error('Failed to start transaction')
    }

    const events = await payload
      .find({
        collection: 'events',
        where: { id: { in: orderItems.map((item) => item.eventId) } },
      })
      .then((res) => res.docs)

    if (!events.length) {
      throw new Error('Event not found')
    }

    const mapObjectEvents = events.reduce(
      (evtObj, event) => {
        evtObj[event.id] = event

        return evtObj
      },
      {} as Record<string, any>,
    )

    try {
      // Make an update using the local API
      let customerData = (
        await payload.find({
          collection: 'users',
          where: { email: customer.email as WhereField },
          limit: 1,
        })
      ).docs?.[0]

      if (!customerData) {
        // create new user
        customerData = await payload.create({
          collection: 'users',
          data: { ...customer, role: 'customer' },
          req: { transactionID },
        })
      }

      // 2 check event id, ticket id is exist
      // 3 check seat is available

      // create order
      const newOrder = await payload.create({
        collection: 'orders',
        data: {
          orderCode,
          user: customerData.id,
          status: 'processing',
          total: amount,
          currency: order.currency,
        },
        req: { transactionID },
      })

      // create order items
      const orderItemPromises = orderItems.map((item) =>
        payload.create({
          collection: 'orderItems',
          data: {
            event: item.eventId,
            ticketPriceId: item.ticketPriceId,
            order: newOrder.id,
            price: item.price,
            quantity: item.quantity,
          },
          req: { transactionID },
        }),
      )
      const newOrderItems = await Promise.all(orderItemPromises)

      const ticketPromises = orderItems.map(async (itemInput) => {
        const event = mapObjectEvents[itemInput.eventId]
        const ticketPriceInfo = event?.ticketPrices?.find(
          (ticketPrice: any) => ticketPrice.id === itemInput.ticketPriceId,
        )

        const orderItem = newOrderItems.find(
          (orderItem) => orderItem.ticketPriceId === itemInput.ticketPriceId,
        )

        return payload.create({
          collection: 'tickets',
          data: {
            ticketCode: generateCode('TK'),
            attendeeName: `${customer.firstName} ${customer.lastName}`,
            ticketPriceInfo: {
              ticketPriceId: ticketPriceInfo.id,
              name: ticketPriceInfo.name,
              price: ticketPriceInfo.price,
            },
            event: itemInput.eventId,
            orderItem: orderItem?.id,
            user: customerData.id,
          },
          req: { transactionID },
        })
      })

      await Promise.all(ticketPromises)

      // create payment record
      await payload.create({
        collection: 'payments',
        data: {
          user: customerData.id,
          order: newOrder.id,
          paymentMethod: 'zalopay',
          currency: order.currency,
          total: amount,
          status: 'processing',
          appTransId: app_trans_id,
          paymentData: {
            app_trans_id,
            app_id: ZALO_PAYMENT.APP_ID,
            app_time,
            app_user,
            embed_data: JSON.stringify(embed_data),
            item: JSON.stringify(orderItems),
            server_time: app_time,
            amount,
          },
        },
        req: { transactionID },
      })

      // todo write payment history

      // Commit the transaction
      await payload.db.commitTransaction(transactionID)
    } catch (error) {
      // Rollback the transaction
      await payload.db.rollbackTransaction(transactionID)

      return NextResponse.json({ message: 'Something went wrong', error }, { status: 400 })
    }

    return NextResponse.json(resultData, { status: 200 })
  } catch (error: any) {
    console.error('ZaloPay create order error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
