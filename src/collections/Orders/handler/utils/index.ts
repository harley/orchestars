import {
  CustomerInfo,
  NewOrderItemWithBookingType,
} from '@/app/(payload)/api/bank-transfer/order/types'
import { checkBookedOrPendingPaymentSeats } from '@/app/(payload)/api/bank-transfer/order/utils'
import { getExistingSeatHolding } from '@/app/(payload)/api/seat-holding/seat/utils'
import { Event, Order, User } from '@/payload-types'
import { generateCode } from '@/utilities/generateCode'
import { BasePayload, PayloadRequest } from 'payload'

export const checkSeatAvailable = async ({
  orderItems,
  payload,
}: {
  orderItems: NewOrderItemWithBookingType[]
  payload: BasePayload
}) => {
  // check total seats that booked by ticket classes
  // Group seats by eventId for more efficient querying
  const seatsByEvent = orderItems.reduce(
    (acc, item) => {
      const key = `${item.eventId}|${item.eventScheduleId}`
      if (!acc[key]) {
        acc[key] = []
      }
      if (item.seat) {
        ;(acc[key] as string[]).push(item.seat)
      }

      return acc
    },
    {} as Record<string, string[]>,
  )

  // Check all seats in parallel, grouped by event
  const seatCheckPromises = Object.entries(seatsByEvent).map(async ([key, seats]) => {
    const [eventId, eventScheduleId] = key.split('|')

    const seatHoldings = await getExistingSeatHolding({
      eventId: Number(eventId),
      eventScheduleId: eventScheduleId as string,
      payload,
      inSeats: seats,
    })

    if (seatHoldings?.length) {
      const initValue = seatHoldings[0]
      const earliestSeatHolding = seatHoldings.reduce(
        (earliest, current) =>
          new Date(current.expire_time as string) < new Date(earliest?.expire_time as string)
            ? current
            : earliest,
        initValue,
      )

      const filterSeatsInput = earliestSeatHolding?.seatName
        ?.split(',')
        ?.filter((s) => seats.includes(s))

      throw new Error(`SEAT002|${JSON.stringify({ seats: filterSeatsInput?.join?.(', ') || '' })}`)
    }

    const existingSeats = await checkBookedOrPendingPaymentSeats({
      eventId: Number(eventId),
      eventScheduleId: eventScheduleId as string,
      seats,
      payload,
    })

    if (existingSeats.length > 0) {
      const unavailableSeats = existingSeats.map((ticket) => ticket.seatName).join(', ')
      throw new Error(`SEAT003|${JSON.stringify({ seats: unavailableSeats })}`)
    }
  })

  await Promise.all(seatCheckPromises)
}

export const createOrderAndTickets = async ({
  orderData,
  orderCode,
  customerData,
  customerInput,
  orderItems,
  events,
  transactionID,
  currency,
  note,
  adjustedTotal,
  payload,
  req,
}: {
  orderData?: Partial<Order>
  orderCode: string
  customerData: User
  customerInput: CustomerInfo
  orderItems: NewOrderItemWithBookingType[]
  events: Event[]
  transactionID: number | Promise<number | string> | string
  currency: string
  note?: string
  adjustedTotal?: number
  payload: BasePayload
  req: PayloadRequest
}) => {
  const mapObjectEvents = events.reduce(
    (evtObj, event) => {
      evtObj[event.id] = event

      return evtObj
    },
    {} as Record<string, Event>,
  )

  const totalBeforeDiscount = orderItems.reduce((acc, item) => acc + item.price, 0)

  const newOrder = await payload.create({
    collection: 'orders',
    data: {
      ...(orderData || {}),
      orderCode,
      user: customerData.id,
      status: 'completed',
      totalBeforeDiscount,
      totalDiscount: 0,
      total: adjustedTotal ?? totalBeforeDiscount,
      customerData: customerInput as Record<string, any>,
      currency,
      note,
      createdByAdmin: req?.user?.id,
    },
    req: { transactionID },
    context: {
      triggerAfterCreated: false,
    },
  })

  // create order items
  const orderItemPromises = orderItems.map((item) => {
    const event = mapObjectEvents[item.eventId]
    const ticketPriceInfo = event?.ticketPrices?.find(
      (ticketPrice: any) => ticketPrice.id === item.ticketPriceId,
    )

    if (!ticketPriceInfo) {
      throw new Error('TICK004')
    }

    return payload.create({
      collection: 'orderItems',
      data: {
        event: item.eventId,
        ticketPriceId: item.ticketPriceId,
        ticketPriceName: ticketPriceInfo.name,
        seat: item.seat,
        order: newOrder.id,
        price: ticketPriceInfo.price as number,
        quantity: 1, // for booking seat, quantity always 1
      },
      req: { transactionID },
    })
  })
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

    if (!orderItem) {
      throw new Error('ORD005')
    }

    return payload.create({
      collection: 'tickets',
      data: {
        ticketCode: generateCode('TK'),
        attendeeName: `${customerData.firstName} ${customerData.lastName}`,
        seat: itemInput.seat,
        status: 'booked',
        ticketPriceInfo: {
          ...(ticketPriceInfo || {}),
          ticketPriceId: ticketPriceInfo?.id,
          name: ticketPriceInfo?.name,
          price: ticketPriceInfo?.price,
        },
        ticketPriceName: ticketPriceInfo?.name,
        event: itemInput.eventId,
        eventScheduleId: itemInput.eventScheduleId,
        orderItem: orderItem?.id,
        user: customerData.id,
        order: newOrder.id,
      },
      req: { transactionID },
    })
  })

  const newTickets = await Promise.all(ticketPromises)

  return { newOrder, newTickets }
}

export const createPayment = async ({
  customerData,
  newOrder,
  totalBeforeDiscount,
  totalDiscount,
  total,
  transactionID,
  currency,
  payload,
}: {
  customerData: User
  newOrder: Order
  currency: string
  totalBeforeDiscount: number
  totalDiscount?: number
  total: number
  transactionID: number | Promise<number | string> | string
  payload: BasePayload
}) => {
  return await payload.create({
    collection: 'payments',
    data: {
      user: customerData.id,
      order: newOrder.id,
      currency,
      totalBeforeDiscount,
      totalDiscount,
      total,
      status: 'paid',
      paymentData: {},
      paidAt: new Date().toISOString()
    },
    req: { transactionID },
    context: {
      triggerAfterCreated: false,
    },
  })
}
