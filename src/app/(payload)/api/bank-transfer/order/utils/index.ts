import { BasePayload } from 'payload'
import { CustomerInfo, NewOrderItem, NewOrderItemWithBookingType } from '../types'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Event, Payment, Promotion, User } from '@/payload-types'
import { generateCode } from '@/utilities/generateCode'
import { isAfter, isBefore } from 'date-fns'
import { USER_PROMOTION_REDEMPTION_STATUS } from '@/collections/Promotion/constants/status'
import { ORDER_STATUS } from '@/collections/Orders/constants'
import { EVENT_STATUS } from '@/collections/Events/constants/status'
import { getExistingSeatHolding } from '@/app/(payload)/api/seat-holding/seat/utils'

export const checkBookedOrPendingPaymentSeats = async ({
  eventId,
  eventScheduleId,
  seats,
  payload,
}: {
  eventId: number
  eventScheduleId: string
  seats?: string[]
  payload: BasePayload
}) => {
  const currentTime = new Date().toISOString()

  const existingSeats = await payload.db.drizzle
    .execute(
      `
    SELECT 
      ticket.seat AS "seatName", COUNT(*) AS total
    FROM tickets ticket
    INNER JOIN orders ord  ON ord.id = ticket.order_id

    WHERE 
        ( 
          (ord.status = '${ORDER_STATUS.completed.value}')
          OR
          (ord.status = '${ORDER_STATUS.processing.value}' AND ord.expire_at >= '${currentTime}')
        )
        AND ticket.event_id = ${Number(eventId)}
        ${seats?.length ? `AND ticket.seat = ANY('{${seats.join(',')}}')` : ''}
        AND ticket.event_schedule_id = '${eventScheduleId}'

    GROUP BY ticket.seat
  `,
    )
    .then((result) => result.rows)
    .catch((err) => {
      console.error('Error during checkBookedOrPendingPaymentSeats ', err)

      return []
    })

  return existingSeats as Array<{ seatName: string; total: number | string }>
}

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

  const cookieStore = await cookies()
  const seatHoldingCode = cookieStore.get('seatHoldingCode')?.value

  // seat holding code of requesting user
  if (!seatHoldingCode) {
    throw new Error('SEAT004')
  }

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

      if (earliestSeatHolding?.code !== seatHoldingCode) {
        const filterSeatsInput = earliestSeatHolding?.seatName
          ?.split(',')
          ?.filter((s) => seats.includes(s))

        throw new Error(
          `SEAT002|${JSON.stringify({ seats: filterSeatsInput?.join?.(', ') || '' })}`,
        )
      }
    }

    const existingSeats = await checkBookedOrPendingPaymentSeats({
      eventId: Number(eventId),
      eventScheduleId: eventScheduleId as string,
      seats,
      payload,
    })

    console.log('existingSeats', existingSeats)

    if (existingSeats.length > 0) {
      const unavailableSeats = existingSeats.map((ticket) => ticket.seatName).join(', ')
      throw new Error(`SEAT003|${JSON.stringify({ seats: unavailableSeats })}`)
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
      throw new Error(`TICK007|${JSON.stringify({ eventTitle: event.title || event.id })}`)
    }

    // Check all seats in parallel, grouped by event
    const currentTime = new Date().toISOString()
    const existingTicketClasses = await payload.db.drizzle
      .execute(
        `
        SELECT 
          ticket.ticket_price_name AS "ticketPriceName", SUM(order_item.quantity) AS total
        FROM order_items order_item
        INNER JOIN orders ord  ON ord.id = order_item.order_id
        INNER JOIN (
            SELECT DISTINCT ON (order_item_id) * FROM tickets tk where tk.event_id=${event.id} ORDER BY order_item_id, id
        ) ticket 
            ON ticket.order_item_id = order_item.id

        WHERE 
            ( 
              (ord.status = '${ORDER_STATUS.completed.value}')
              OR
              (ord.status = '${ORDER_STATUS.processing.value}' AND ord.expire_at >= '${currentTime}')
            )
            AND order_item.event_id = ${event.id}
            AND ticket.ticket_price_name = '${ticketPriceInfo.name}'
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
      throw new Error(`TICK005|${JSON.stringify({ ticketClass: ticketPriceInfo?.name || '' })}`)
    }

    const remaining = maxQuantity - totalUnavailable

    if (remaining < inputOrderItem.quantity) {
      throw new Error(
        `TICK006|${JSON.stringify({ ticketClass: ticketPriceInfo?.name, remaining })}`,
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
    throw new Error('EVT002')
  }

  for (const event of events) {
    if (event.status !== EVENT_STATUS.published_open_sales.value) {
      switch (event.status) {
        case EVENT_STATUS.draft.value:
          throw new Error('EVT002')
        case EVENT_STATUS.published_upcoming.value:
          throw new Error('EVT003')
        case EVENT_STATUS.completed.value:
          throw new Error('EVT004')
        case EVENT_STATUS.cancelled.value:
          throw new Error('EVT005')
        default:
          throw new Error('EVT002')
      }
    }

    const hasValidTicket = orderItems.some((oItem) => {
      if (oItem.eventId !== event.id) return false

      return event.ticketPrices?.some((evtTkPr) => oItem.ticketPriceId === evtTkPr.id) ?? false
    })

    if (!hasValidTicket) {
      throw new Error(`TICK007|${JSON.stringify({ eventTitle: event.title || event.id })}`)
    }

    const hasValidSchedule = orderItems.some((oItem) => {
      if (oItem.eventId !== event.id) return false

      return event.schedules?.some((sche) => oItem.eventScheduleId === sche.id) ?? false
    })

    if (!hasValidSchedule) {
      throw new Error(`EVT007|${JSON.stringify({ eventTitle: event.title || event.id })}`)
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
      data: {
        ...customer,
        phoneNumber: customer.phoneNumber, // is using
        phoneNumbers: [
          { isUsing: true, createdAt: new Date().toISOString(), phone: customer.phoneNumber },
        ],
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
  orderItems: NewOrderItemWithBookingType[]
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
  const { amount, totalBeforeDiscount, totalDiscount } = calculateTotalDiscountBookingTypeSeat({
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
      customerData: customerInput as Record<string, any>,
      currency,
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
        order: newOrder.id,
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
      throw new Error('TICK004')
    }

    const promises = []

    for (let i = 1; i <= orderItem.quantity; i++) {
      promises.push(
        payload.create({
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
            order: newOrder.id,
          },
          req: { transactionID },
        }),
      )
    }

    return Promise.all(promises)
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
  // check promotion exist - case insensitive
  const promotion = await payload
    .find({
      collection: 'promotions',
      limit: 1,
      where: {
        status: { equals: 'active' },
        event: { equals: eventId },
        code: { equals: promotionCode.toUpperCase() },
      },
    })
    .then((res) => res.docs?.[0])

  if (!promotion) {
    throw new Error('PROMO002')
  }

  if (!promotion.maxRedemptions) {
    throw new Error('PROMO002')
  }
  const currentTime = new Date()
  if (promotion.startDate && isAfter(promotion.startDate, currentTime)) {
    throw new Error('PROMO004')
  }

  if (promotion.endDate && isBefore(promotion.endDate, currentTime)) {
    throw new Error('PROMO005')
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
    throw new Error('PROMO003')
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
    throw new Error(`PROMO007|${JSON.stringify({ promotionCode: promotion.code })}`)
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

        // Apply to all tickets if appliedTicketClasses is empty
        const appliedForTicket =
          appliedTicketClasses.length === 0 ||
          appliedTicketClasses.some((applied) => applied.ticketClass === ticketPriceInfo?.name)
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

export const calculateTotalDiscountBookingTypeSeat = ({
  orderItems,
  promotion,
  event,
}: {
  orderItems: NewOrderItemWithBookingType[]
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

        // Apply to all tickets if appliedTicketClasses is empty
        const appliedForTicket =
          appliedTicketClasses.length === 0 ||
          appliedTicketClasses.some((applied) => applied.ticketClass === ticketPriceInfo?.name)
        const price = ticketPriceInfo?.price || 0
        const quantity = 1 // for booking type seat, quantity always 1
        if (appliedForTicket) {
          totalAmountThatAppliedDiscount += price * quantity
        } else {
          totalAmountNotThatAppliedDiscount += price * quantity
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
      const amount = orderItems.reduce((total, item) => {
        const ticketPriceInfo = event?.ticketPrices?.find(
          (ticketPrice: any) => ticketPrice.id === item.ticketPriceId,
        )

        const price = ticketPriceInfo?.price || 0
        const quantity = 1 // for booking type seat, quantity always 1

        total += price * quantity

        return total
      }, 0)

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

export const validateOrderItemsBookingTypeSeat = ({
  orderItems,
}: {
  orderItems: NewOrderItemWithBookingType[]
}) => {
  // validate order items
  if (!orderItems?.length) {
    throw new Error('ORD001')
  }

  // Check for duplicate seats
  const seenSeats = new Set<string>()
  orderItems.forEach((item) => {
    if (!item.eventId) {
      throw new Error('EVT008')
    }
    if (!item.ticketPriceId) {
      throw new Error('TICK010')
    }
    if (!item.eventScheduleId) {
      throw new Error('EVT009')
    }
    if (!item.seat) {
      throw new Error('SEAT001')
    }

    const seatKey = `${item.eventScheduleId}-${item.seat}`
    if (seenSeats.has(seatKey)) {
      throw new Error(`SEAT005|${JSON.stringify({ seat: item.seat })}`)
    }
    seenSeats.add(seatKey)
  })
}

export const checkRemainingQuantitySeats = async ({
  event,
  orderItems,
  payload,
}: {
  event: Event
  orderItems: NewOrderItemWithBookingType[]
  payload: BasePayload
}) => {
  // check total ticket classes booked and holding
  const groupedByDateTicketClassName = orderItems.reduce(
    (obj, orderItem) => {
      const ticketPriceInfo = event.ticketPrices?.find(
        (tkPrice) => tkPrice.id === orderItem.ticketPriceId,
      )
      if (!ticketPriceInfo) {
        throw new Error('TICK004')
      }

      const ticketPriceId = orderItem.ticketPriceId
      const eventScheduleId = orderItem.eventScheduleId

      const key: `${string}|${string}` = `${ticketPriceId}|${eventScheduleId}`

      if (!obj[key]) {
        obj[key] = {
          seats: [],
          quantity: 0,
          ticketPriceId,
          eventScheduleId,
          ticketPriceName: ticketPriceInfo.name as string,
          totalTicketQuantity: (ticketPriceInfo.quantity as number) || 0,
        }
      }

      obj[key].seats.push(orderItem.seat)
      obj[key].quantity += 1

      return obj
    },
    {} as Record<
      `${string}|${string}`,
      {
        seats: string[]
        quantity: number
        ticketPriceId: string
        eventScheduleId: string
        ticketPriceName: string
        totalTicketQuantity: number
      }
    >,
  )

  const seatsByDateTicketClassName = Object.values(groupedByDateTicketClassName)

  if (seatsByDateTicketClassName.length) {
    const currentTime = new Date().toISOString()

    const mapConditionCountByEventScheduleAndTicketPriceId = seatsByDateTicketClassName
      .map(
        (item) =>
          `( ticket.event_schedule_id = '${item.eventScheduleId}' AND order_item.ticket_price_id = '${item.ticketPriceId}' )`,
      )
      .join(' OR ')

    const countQuantityTickets = await payload.db.drizzle
      .execute(
        `
      SELECT 
        ticket.event_schedule_id AS "eventScheduleId", order_item.ticket_price_id AS "ticketPriceId", COUNT(*) AS "totalBooked"
      FROM tickets ticket
      INNER JOIN orders ord  ON ord.id = ticket.order_id
      INNER JOIN order_items order_item  ON order_item.id = ticket.order_item_id
  
      WHERE 
          ( 
            (ord.status = '${ORDER_STATUS.completed.value}')
            OR
            (ord.status = '${ORDER_STATUS.processing.value}' AND ord.expire_at >= '${currentTime}')
          )
          AND ticket.event_id = ${Number(event.id)}
          AND (${mapConditionCountByEventScheduleAndTicketPriceId})
  
      GROUP BY ticket.event_schedule_id, order_item.ticket_price_id
    `,
      )
      .then(
        (result) =>
          result.rows.map((row) => ({ ...row, totalBooked: Number(row.totalBooked) })) as Array<{
            eventScheduleId: string
            ticketPriceId: string
            totalBooked: number
          }>,
      )
      .catch((err) => {
        console.error('Error during checkBookedOrPendingPaymentSeats ', err)

        return []
      })

    console.log('countQuantityTickets', countQuantityTickets)

    console.log('seatsByDateTicketClassName', seatsByDateTicketClassName)

    for (const dateTicketClass of seatsByDateTicketClassName) {
      const exist = countQuantityTickets.find(
        (c) =>
          c.eventScheduleId === dateTicketClass.eventScheduleId &&
          c.ticketPriceId === dateTicketClass.ticketPriceId,
      )

      if (exist) {
        const remaining = dateTicketClass.totalTicketQuantity - exist.totalBooked
        if (!remaining) {
          throw new Error(
            `TICK008|${JSON.stringify({ ticketClass: dateTicketClass.ticketPriceName })}`,
          )
        }
        if (remaining < dateTicketClass.quantity) {
          throw new Error(
            `TICK009|${JSON.stringify({
              ticketClass: dateTicketClass.ticketPriceName,
              remaining,
            })}`,
          )
        }
      } else {
        if (dateTicketClass.quantity > dateTicketClass.totalTicketQuantity) {
          throw new Error(
            `TICK009|${JSON.stringify({
              ticketClass: dateTicketClass.ticketPriceName,
              remaining: dateTicketClass.totalTicketQuantity,
            })}`,
          )
        }
      }
    }
  }
}
