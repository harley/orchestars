import { BasePayload } from 'payload'
import { CustomerInfo, NewOrderItem } from '../types'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generatePassword } from '@/utilities/generatePassword'
import { Event, User } from '@/payload-types'
import { generateCode } from '@/utilities/generateCode'

export const checkSeatAvailable = async ({
  orderItems,
  payload,
}: {
  orderItems: NewOrderItem[]
  payload: BasePayload
}) => {
  // Group seats by eventId for more efficient querying
  const seatsByEvent = orderItems.reduce(
    (acc, item) => {
      const key = `${item.eventId}|${item.eventScheduleId}`
      if (!acc[key]) {
        acc[key] = []
      }

      ;(acc[key] as string[]).push(item.seat)

      return acc
    },
    {} as Record<string, string[]>,
  )

  // Check all seats in parallel, grouped by event
  const seatCheckPromises = Object.entries(seatsByEvent).map(async ([key, seats]) => {
    const [eventId, eventScheduleId] = key.split('|')

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
          {
            eventScheduleId: {
              equals: eventScheduleId,
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

export const checkEvents = async ({
  orderItems,
  payload,
}: {
  orderItems: NewOrderItem[]
  payload: BasePayload
}) => {
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

    const hasValidSchedule = orderItems.some((oItem) => {
      if (oItem.eventId !== event.id) return false

      return event.schedules?.some((sche) => oItem.eventScheduleId === sche.id) ?? false
    })

    if (!hasValidSchedule) {
      throw new Error(`Ngày tham gia dự kiện ${event.title || event.id} không đúng`)
    }
  }

  return events
}

export const clearSeatHolding = async ({
  nextResponse,
  payload,
}: {
  nextResponse: NextResponse
  payload: BasePayload
}) => {
  try {
    const cookieStore = await cookies()
    const seatHoldingCode = cookieStore.get('seatHoldingCode')?.value

    // if not seatHoldingCode in cookie: need to delete seat holding code is opening?
    if (!seatHoldingCode) return

    await payload.update({
      collection: 'seatHoldings',
      where: { code: { equals: seatHoldingCode } },
      data: {
        closedAt: new Date().toISOString(),
      },
    })
    nextResponse.cookies.set('seatHoldingCode', '', { maxAge: 0, path: '/' })
  } catch (error) {
    console.error('Error while clear seat holding code', error)
  }
}

export const createCustomerIfNotExist = async ({
  customer,
  transactionID,
  payload,
}: {
  customer: CustomerInfo
  transactionID: number | Promise<number | string> | string
  payload: BasePayload
}) => {
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
      data: {
        ...customer,
        phoneNumber: customer.phoneNumber, // is using
        phoneNumbers: [
          { isUsing: true, createdAt: new Date().toISOString(), phone: customer.phoneNumber },
        ],
        password: generatePassword(),
        role: 'customer',
      },
      req: { transactionID },
    })
  } else {
    // update phone number
    const updatePhoneNumbers = customerData.phoneNumbers || []
    if (customer.phoneNumber) {
      const existPhone = updatePhoneNumbers.find((p) => p.phone === customer.phoneNumber)

      if (!existPhone) {
        updatePhoneNumbers.push({
          createdAt: new Date().toISOString(),
          phone: customer.phoneNumber,
          isUsing: false,
        })

        await payload.update({
          collection: 'users',
          id: customerData.id,
          data: {
            phoneNumbers: updatePhoneNumbers,
          },
        })
      }
    }
  }

  return customerData
}

export const createOrderAndTickets = async ({
  orderCode,
  customerData,
  orderItems,
  events,
  transactionID,
  currency,
  payload,
}: {
  orderCode: string
  customerData: User
  orderItems: NewOrderItem[]
  events: Event[]
  transactionID: number | Promise<number | string> | string
  currency: string
  payload: BasePayload
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
        eventScheduleId: itemInput.eventScheduleId,
        orderItem: orderItem?.id,
        user: customerData.id,
      },
      req: { transactionID },
    })
  })

  await Promise.all(ticketPromises)

  return { newOrder }
}
