import { BasePayload } from 'payload'
import { CustomerInfo, NewOrderItem } from '../types'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generatePassword } from '@/utilities/generatePassword'
import { Event, Payment, Promotion, User } from '@/payload-types'
import { generateCode } from '@/utilities/generateCode'
import { isAfter, isBefore } from 'date-fns'
import { USER_PROMOTION_REDEMPTION_STATUS } from '@/collections/Promotion/constants/status'

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

export const checkTicketClassAvailable = async ({
  event,
  orderItems,
  payload,
}: {
  event: Event
  orderItems: NewOrderItem[]
  payload: BasePayload
}) => {
  for (const inputOrderItem of orderItems) {
    //   const countTicketClassSeatHolding = await payload.db.drizzle
    //     .execute(
    //       `
    //     SELECT name AS "ticketClassName", SUM(quantity) AS total
    //     FROM seat_holdings_ticket_classes sh_ticket_class
    //     LEFT JOIN seat_holdings seat_holding ON sh_ticket_class."_parent_id" = seat_holding.id
    //     WHERE
    //       seat_holding.event_id = '${event.id}'
    //       AND seat_holding."event_schedule_id" = '${inputOrderItem.eventScheduleId}'
    //       AND seat_holding."closed_at" IS NULL
    //       AND seat_holding."expire_time" > '${new Date().toISOString()}'
    //   group by name
    // `,
    //     )
    //     .then((result) =>
    //       (result?.rows || []).reduce(
    //         (obj, row) => {
    //           obj[row.ticketClassName as string] = Number(row.total)

    //           return obj
    //         },
    //         {} as Record<string, number>,
    //       ),
    //     )

    //   console.log('countTicketClassSeatHolding', countTicketClassSeatHolding)

    const ticketPriceInfo = event.ticketPrices?.find((tk) => tk.id === inputOrderItem.ticketPriceId)

    console.log('ticketPriceInfo', ticketPriceInfo)

    if (!ticketPriceInfo) {
      throw new Error(`Loại vé không tồn tại cho sự kiện ${event.title || event.id}`)
    }

    // Check all seats in parallel, grouped by event
    const currentTime = new Date().toISOString()
    const existingTicketClasses = await payload.db.drizzle
      .execute(
        `
    SELECT ticket.ticket_price_name as "ticketPriceName", SUM(order_item.quantity) as total
    FROM tickets ticket
    LEFT JOIN order_items order_item ON ticket.order_item_id = order_item.id
    LEFT JOIN orders ord ON ord.id = order_item.order_id
    WHERE 
      ( (ticket.status IN ('booked', 'hold')) OR (ticket.status = 'pending_payment' AND ord.expire_at >= '${currentTime}') )
      AND ticket.ticket_price_name = '${ticketPriceInfo.name}'
      AND ticket.event_id = ${event.id}
      AND ticket.event_schedule_id = '${inputOrderItem.eventScheduleId}'
    GROUP BY ticket.ticket_price_name
    `,
      )
      .then((result) =>
        (result.rows || []).reduce(
          (obj, row) => {
            obj[row.ticketPriceName as string] = Number(row.total)

            return obj
          },
          {} as Record<string, number>,
        ),
      )
    console.log('existingTicketSeats', existingTicketClasses)

    const maxQuantity = ticketPriceInfo?.quantity || 0

    const totalUnavailable = Number(existingTicketClasses[ticketPriceInfo?.name as string]) || 0

    if (totalUnavailable >= maxQuantity) {
      throw new Error(
        `Vé ${ticketPriceInfo?.name || ''} hiện đã được đặt hết! Vui lòng chọn vé khác.`,
      )
    }

    const remaining = maxQuantity - totalUnavailable

    if (remaining < inputOrderItem.quantity) {
      throw new Error(
        `Vé ${ticketPriceInfo?.name} hiện chỉ còn tối đa ${remaining} vé!. Vui lòng nhập lại số lượng mua`,
      )
    }
  }
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
  promotion,
  payload,
}: {
  orderCode: string
  customerData: User
  orderItems: NewOrderItem[]
  events: Event[]
  transactionID: number | Promise<number | string> | string
  currency: string
  promotion?: Promotion
  payload: BasePayload
}) => {
  const mapObjectEvents = events.reduce(
    (evtObj, event) => {
      evtObj[event.id] = event

      return evtObj
    },
    {} as Record<string, any>,
  )
  const { amount, totalBeforeDiscount, totalDiscount } = calculateTotalDiscount({
    orderItems,
    promotion,
    event: events[0] as Event,
  })

  const newOrder = await payload.create({
    collection: 'orders',
    data: {
      orderCode,
      user: customerData.id,
      status: 'processing',
      totalBeforeDiscount,
      totalDiscount,
      total: amount,
      promotionCode: promotion?.code,
      promotion: promotion?.id,
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

export const createOrderAndTicketsWithTicketClassType = async ({
  orderCode,
  customerData,
  customerInput,
  orderItems,
  events,
  transactionID,
  currency,
  promotion,
  expireAt,
  payload,
}: {
  orderCode: string
  customerData: User
  customerInput: CustomerInfo
  orderItems: NewOrderItem[]
  events: Event[]
  transactionID: number | Promise<number | string> | string
  currency: string
  promotion?: Promotion
  expireAt: Date
  payload: BasePayload
}) => {
  const mapObjectEvents = events.reduce(
    (evtObj, event) => {
      evtObj[event.id] = event

      return evtObj
    },
    {} as Record<string, Event>,
  )

  const { amount, totalBeforeDiscount, totalDiscount } = calculateTotalDiscount({
    orderItems,
    promotion,
    event: events[0] as Event,
  })

  const newOrder = await payload.create({
    collection: 'orders',
    data: {
      orderCode,
      user: customerData.id,
      status: 'processing',
      totalBeforeDiscount,
      totalDiscount,
      total: amount,
      promotionCode: promotion?.code,
      promotion: promotion?.id,
      currency,
      customerData: customerInput as Record<string, any>,
      expireAt: expireAt.toISOString(),
    },
    req: { transactionID },
  })

  // create order items
  const orderItemPromises = orderItems.map((item) => {
    const event = mapObjectEvents[item.eventId]
    const ticketPriceInfo = event?.ticketPrices?.find(
      (ticketPrice: any) => ticketPrice.id === item.ticketPriceId,
    )

    return payload.create({
      collection: 'orderItems',
      data: {
        event: item.eventId,
        ticketPriceId: item.ticketPriceId,
        ticketPriceName: ticketPriceInfo?.name,
        order: newOrder.id,
        price: item.price,
        quantity: item.quantity,
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
      (nOrderItem) => nOrderItem.ticketPriceId === itemInput.ticketPriceId,
    )

    if (!orderItem) {
      throw new Error('Loại vé không tồn tại')
    }

    return payload.create({
      collection: 'tickets',
      data: {
        ticketCode: generateCode('TK'),
        attendeeName: `${customerData.firstName} ${customerData.lastName}`,
        status: 'pending_payment',
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
      },
      req: { transactionID },
    })
  })

  await Promise.all(ticketPromises)

  return { newOrder }
}

export const checkPromotionCode = async ({
  promotionCode,
  eventId,
  userId,
  payload,
}: {
  promotionCode: string
  eventId: number
  userId: number
  payload: BasePayload
}) => {
  // check promotion exist
  const promotion = await payload
    .find({
      collection: 'promotions',
      limit: 1,
      where: {
        status: { equals: 'active' },
        event: { equals: eventId },
        code: { equals: promotionCode },
      },
    })
    .then((res) => res.docs?.[0])

  if (!promotion) {
    throw new Error(`Mã giảm giá [${promotionCode}] không hợp lệ`)
  }

  if (!promotion.maxRedemptions) {
    throw new Error(`Mã giảm giá [${promotion.code}] không hợp lệ`)
  }
  const currentTime = new Date()
  if (promotion.startDate && isAfter(promotion.startDate, currentTime)) {
    throw new Error(`Không thể dùng mã giảm giá [${promotion.code}] trước thời gian quy định`)
  }

  if (promotion.endDate && isBefore(promotion.endDate, currentTime)) {
    throw new Error(`Mã giảm giá [${promotion.code}] đã hết hạn`)
  }
  const userPromotionsPendingPayment = await payload
    .count({
      collection: 'userPromotionRedemptions',
      where: {
        promotion: { equals: promotion.id },
        status: { equals: 'pending' },
        expireAt: { greater_than_equal: currentTime.toISOString() },
      },
    })
    .then((res) => res.totalDocs)

  const remainNumberRedemption =
    promotion.maxRedemptions - (promotion.totalUsed || 0) - userPromotionsPendingPayment

  if (remainNumberRedemption <= 0) {
    throw new Error(`Mã giảm giá [${promotion.code}] đã hết lượt sử dụng`)
  }

  const countTotalCurrentUserRedemption = await payload
    .count({
      collection: 'userPromotionRedemptions',
      where: {
        promotion: { equals: promotion.id },
        user: { equals: userId },
        or: [
          {
            status: { in: [USER_PROMOTION_REDEMPTION_STATUS.used.value] },
          },
          {
            status: { in: [USER_PROMOTION_REDEMPTION_STATUS.pending.value] },
            expireAt: { greater_than_equal: currentTime.toISOString() },
          },
        ],
      },
    })
    .then((res) => res.totalDocs)

  if (
    !isNaN(promotion.perUserLimit as number) &&
    countTotalCurrentUserRedemption >= (promotion.perUserLimit as number)
  ) {
    throw new Error(`Bạn đã dùng hết số lượt được áp dụng cho giảm giá [${promotion.code}] này`)
  }

  return promotion
}

// refactor this code
export const calculateTotalDiscount = ({
  orderItems,
  promotion,
  event,
}: {
  orderItems: NewOrderItem[]
  promotion?: Promotion
  event: Event
}) => {
  const calculateTotal = (() => {
    if (promotion) {
      const appliedTicketClasses = promotion?.appliedTicketClasses || []

      let totalAmountThatAppliedDiscount = 0
      let totalAmountNotThatAppliedDiscount = 0

      for (const orderItem of orderItems) {
        const ticketPriceInfo = event?.ticketPrices?.find(
          (ticketPrice: any) => ticketPrice.id === orderItem.ticketPriceId,
        )

        const appliedForTicket = appliedTicketClasses.some(
          (applied) => applied.ticketClass === ticketPriceInfo?.name,
        )
        const price = orderItem.price || 0
        if (appliedForTicket) {
          totalAmountThatAppliedDiscount += price * (Number(orderItem.quantity) || 0)
        } else {
          totalAmountNotThatAppliedDiscount += price * (Number(orderItem.quantity) || 0)
        }
      }

      const amountBeforeDiscount =
        totalAmountThatAppliedDiscount + totalAmountNotThatAppliedDiscount

      if (promotion.discountType === 'percentage') {
        totalAmountThatAppliedDiscount -=
          (totalAmountThatAppliedDiscount * promotion.discountValue) / 100
      } else if (promotion.discountType === 'fixed_amount') {
        totalAmountThatAppliedDiscount = totalAmountThatAppliedDiscount - promotion.discountValue
      }

      const amountAfterDiscount = totalAmountThatAppliedDiscount + totalAmountNotThatAppliedDiscount

      return {
        amountBeforeDiscount,
        amountAfterDiscount,
      }
    } else {
      const amount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)

      return { amountBeforeDiscount: amount, amountAfterDiscount: amount }
    }
  })()

  const totalBeforeDiscount = calculateTotal.amountBeforeDiscount
  const totalDiscount = calculateTotal.amountBeforeDiscount - calculateTotal.amountAfterDiscount
  const amount = +Number(calculateTotal.amountAfterDiscount).toFixed(0)

  return {
    totalBeforeDiscount,
    totalDiscount,
    amount,
  }
}

export const createUserPromotionRedemption = async ({
  promotion,
  user,
  payment,
  eventId,
  transactionID,
  payload,
}: {
  promotion: Promotion
  user: User
  payment: Payment
  eventId: number
  transactionID: number | Promise<number | string> | string
  payload: BasePayload
}) => {
  // expire at 30 minutes
  const expireAt = new Date()
  expireAt.setMinutes(expireAt.getMinutes() + 30)

  return payload.create({
    collection: 'userPromotionRedemptions',
    data: {
      promotion: promotion.id,
      user: user.id,
      event: eventId,
      payment: payment.id,
      expireAt: expireAt.toISOString(),
      status: 'pending',
    },
    req: { transactionID },
  })
}
