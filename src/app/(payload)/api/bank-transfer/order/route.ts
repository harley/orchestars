import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import config from '@/payload.config'
import { Event, Order, User } from '@/payload-types'
import { generateCode } from '@/utilities/generateCode'
import { generatePassword } from '@/utilities/generatePassword'
import { PAYMENT_METHODS } from '@/constants/paymentMethod'
import { VIET_QR } from '@/config/payment'
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

interface BankTransferTransaction {
  code: string
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const customer = body.customer as CustomerInfo
  const transaction = body.transaction as BankTransferTransaction

  const order = body.order as NewInputOrder
  const orderItems = order.orderItems
  const orderCode = generateCode('ORD')

  try {
    await payload.init({ config })

    // hold code
    // check seat available
    await checkSeatAvailable({ orderItems })

    const amount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)

    // check event id, ticket id is exist
    const events = await checkEvents({ orderItems })

    const bankName = VIET_QR.BANK_NAME;
    const accountName = VIET_QR.ACCOUNT_NAME;
    const accountNo= VIET_QR.ACCOUNT_NO;
    const transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
      throw new Error('Có lỗi xảy ra! Vui lòng thử lại')
    }

    try {
      // 1 check user info, it not exist, will create a new one
      const customerData = await createCustomerIfNotExist(customer, transactionID)

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
        transactionID,
        currency: order.currency,
        amount,
        transaction,
      })

      // todo write payment history
      // todo send mail

      // Commit the transaction
      await payload.db.commitTransaction(transactionID)
      const content = `${orderCode}`;

      const encodedContent = encodeURIComponent(content);
      const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

      const paymentLink = `${baseUrl}/payment/vietqr?amount=${amount}&contentBankTransfer=${encodedContent}&bankName=${bankName}&accountName=${accountName}&accountNo=${accountNo}`;

      return NextResponse.json({ paymentLink, status: 200 })
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

const checkSeatAvailable = async ({ orderItems }: { orderItems: NewOrderItem[] }) => {
  // Group seats by eventId for more efficient querying
  const seatsByEvent = orderItems.reduce(
    (acc, item) => {
      if (!acc[item.eventId]) {
        acc[item.eventId] = []
      }

      ; (acc[item.eventId] as string[]).push(item.seat)

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
