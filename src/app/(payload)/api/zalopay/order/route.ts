import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import payload from 'payload'
import { format, getTime } from 'date-fns'
import { ZALO_PAYMENT } from '@/config/payment'
import config from '@/payload.config'
import { Event, Order, User } from '@/payload-types'

interface CustomerInfo {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
}

interface NewOrderItem {
  price: number
  quantity: number
  seat: string
  eventId: number
  ticketPriceId: string
}

interface NewInputOrder {
  currency: string
  orderItems: NewOrderItem[]
}

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

const generateCode = (prefix: string): string => {
  const timestamp = Date.now().toString().slice(-6) // Last 6 digits of the timestamp
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() // 4-character random string

  return `${prefix}-${timestamp}-${randomPart}`
}

function generatePassword(length: number = 12): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?'
  let password = ''
  const randomValues = new Uint32Array(length)
  if (crypto && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues)
  }

  for (let i = 0; i < length; i++) {
    password += chars[(randomValues[i] || 1) % chars.length]
  }

  return password
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const customer = body.customer as CustomerInfo

  const order = body.order as NewInputOrder
  const orderItems = order.orderItems

  const orderCode = generateCode('ORD')

  try {
    await payload.init({ config })

    // check seat available
    await checkSeatAvailable({ orderItems })

    const { zalopayDataOrder } = generateZaloPayOrderData({ orderCode, orderItems, customer })

    // check event id, ticket id is exist
    const events = await checkEvents({ orderItems })

    const transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
      throw new Error('Có lỗi xảy ra! Vui lòng thử lại')
    }

    try {
      // 1 check user info, it not exist, will create a new one
      const customerData = await createCustomerIfNotExist(customer, transactionID)

      // 2 check event id, ticket id is exist
      // 3 check seat is available

      // create order
      const { newOrder } = await createOrderAndTickets({
        orderCode,
        customerData,
        orderItems,
        events,
        transactionID,
        currency: order.currency,
      })

      // create payment record
      await createPayment({
        customerData,
        newOrder,
        zaloPayOrder: zalopayDataOrder,
        transactionID,
        currency: order.currency,
      })

      const { result: resultData } = await createZaloPaymentLink({
        zalopayDataOrder,
      })

      // todo write payment history

      // Commit the transaction
      await payload.db.commitTransaction(transactionID)

      return NextResponse.json(resultData, { status: 200 })
    } catch (error) {
      // Rollback the transaction
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

const checkSeatAvailable = async ({ orderItems }: { orderItems: NewOrderItem[] }) => {
  // Group seats by eventId for more efficient querying
  const seatsByEvent = orderItems.reduce(
    (acc, item) => {
      if (!acc[item.eventId]) {
        acc[item.eventId] = []
      }

      ;(acc[item.eventId] as string[]).push(item.seat)

      return acc
    },
    {} as Record<number, string[]>,
  )

  // Check all seats in parallel, grouped by event
  const seatCheckPromises = Object.entries(seatsByEvent).map(async ([eventId, seats]) => {
    const existingSeats = await payload.find({
      collection: 'tickets',
      where: {
        and: [
          {
            status: {
              in: ['booked', 'pending_payment', 'hold'],
            },
          },
          {
            seat: {
              in: seats,
            },
          },
          {
            event: {
              equals: Number(eventId),
            },
          },
        ],
      },
    })

    if (existingSeats.docs.length > 0) {
      const unavailableSeats = existingSeats.docs.map((ticket) => ticket.seat).join(', ')
      throw new Error(`Ghế ${unavailableSeats} hiện đã được đặt. Vui lòng chọn ghế khác.`)
    }
  })

  await Promise.all(seatCheckPromises)
}

const checkEvents = async ({ orderItems }: { orderItems: NewOrderItem[] }) => {
  const events = await payload
    .find({
      collection: 'events',
      where: { id: { in: orderItems.map((item) => item.eventId) } },
    })
    .then((res) => res.docs)

  if (!events.length) {
    throw new Error('Sự kiện không tồn tại')
  }

  for (const event of events) {
    const hasValidTicket = orderItems.some((oItem) => {
      if (oItem.eventId !== event.id) return false

      return event.ticketPrices?.some((evtTkPr) => oItem.ticketPriceId === evtTkPr.id) ?? false
    })

    if (!hasValidTicket) {
      throw new Error(`Loại vé không tồn tại cho sự kiện ${event.title || event.id}`)
    }
  }

  return events
}

const generateZaloPayOrderData = ({
  orderCode,
  orderItems,
  customer,
}: {
  orderCode: string
  orderItems: NewOrderItem[]
  customer: CustomerInfo
}) => {
  const embed_data = {
    preferred_payment_method: 'Zalopay_wallet',
    redirecturl: ZALO_PAYMENT.REDIRECT_URL,
    columninfo: JSON.stringify({ orderCode }),
    promotioninfo: JSON.stringify({}),
  }

  const amount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)

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

  if (resultData?.return_code === 2) {
    throw new Error(resultData)
  }

  console.log('resultData', resultData)

  return {
    result: resultData,
  }
}

const createCustomerIfNotExist = async (
  customer: CustomerInfo,
  transactionID: number | Promise<number | string> | string,
) => {
  let customerData = (
    await payload.find({
      collection: 'users',
      where: { email: { equals: customer.email } },
      limit: 1,
    })
  ).docs?.[0]

  if (!customerData) {
    // create new user
    customerData = await payload.create({
      collection: 'users',
      // quick fix for generate default password, need to update later
      data: { ...customer, password: generatePassword(), role: 'customer' },
      req: { transactionID },
    })
  }

  return customerData
}

const createOrderAndTickets = async ({
  orderCode,
  customerData,
  orderItems,
  events,
  transactionID,
  currency,
}: {
  orderCode: string
  customerData: User
  orderItems: NewOrderItem[]
  events: Event[]
  transactionID: number | Promise<number | string> | string
  currency: string
}) => {
  const mapObjectEvents = events.reduce(
    (evtObj, event) => {
      evtObj[event.id] = event

      return evtObj
    },
    {} as Record<string, any>,
  )
  const amount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const newOrder = await payload.create({
    collection: 'orders',
    data: {
      orderCode,
      user: customerData.id,
      status: 'processing',
      total: amount,
      currency,
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
        seat: item.seat,
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
      (nOrderItem) =>
        nOrderItem.ticketPriceId === itemInput.ticketPriceId && nOrderItem.seat === itemInput.seat,
    )

    if (!orderItem || !itemInput.seat) {
      throw new Error('Vui lòng chọn ghế và thực hiện lại thao tác')
    }

    return payload.create({
      collection: 'tickets',
      data: {
        ticketCode: generateCode('TK'),
        attendeeName: `${customerData.firstName} ${customerData.lastName}`,
        seat: itemInput.seat,
        status: 'pending_payment',
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

  return { newOrder }
}

const createPayment = async ({
  customerData,
  newOrder,
  zaloPayOrder,
  transactionID,
  currency,
}: {
  customerData: User
  newOrder: Order
  currency: string
  zaloPayOrder: ZaloPayOrder
  transactionID: number | Promise<number | string> | string
}) => {
  await payload.create({
    collection: 'payments',
    data: {
      user: customerData.id,
      order: newOrder.id,
      paymentMethod: 'zalopay',
      currency,
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
