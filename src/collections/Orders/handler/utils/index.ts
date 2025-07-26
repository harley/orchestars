import {
  CustomerInfo,
  NewOrderItemWithBookingType,
  PromotionApplied,
} from '@/app/(payload)/api/bank-transfer/order/types'
import {
  calculateTotalDiscountBookingTypeSeat,
  checkBookedOrPendingPaymentSeats,
  checkPromotionCode,
} from '@/app/(payload)/api/bank-transfer/order/utils'
import { getExistingSeatHolding } from '@/app/(payload)/api/seat-holding/seat/utils'
import { Event, Order, Payment, Promotion, User } from '@/payload-types'
import { generateCode } from '@/utilities/generateCode'
import { BasePayload, PayloadRequest } from 'payload'
import { ORDER_ITEM_STATUS } from '../../constants'

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

  // const totalBeforeDiscount = orderItems.reduce((acc, item) => acc + item.price, 0)

  const newOrder = await payload.create({
    collection: 'orders',
    data: {
      ...(orderData || {}),
      orderCode,
      user: customerData.id,
      status: 'completed',
      // totalBeforeDiscount,
      // totalDiscount: 0,
      // total: adjustedTotal ?? totalBeforeDiscount,
      customerData: customerInput as Record<string, any>,
      currency,
      note,
      createdByAdmin: req?.user?.id,
    },
    req: { transactionID },
    context: {
      triggerAfterCreated: false,
    },
    depth: 0,
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
        status: ORDER_ITEM_STATUS.completed.value,
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
  paymentEntityData,
  customerData,
  newOrder,
  totalBeforeDiscount,
  totalDiscount,
  total,
  transactionID,
  currency,
  payload,
}: {
  paymentEntityData: Partial<Payment>
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
      ...(paymentEntityData || {}),
      user: customerData.id,
      order: newOrder.id,
      currency,
      totalBeforeDiscount,
      totalDiscount,
      total,
      status: 'paid',
      paymentData: {},
      paidAt: new Date().toISOString(),
    },
    req: { transactionID },
    context: {
      triggerAfterCreated: false,
    },
    depth: 0,
  })
}

export const processPromotionsApplied = async ({
  promotionCodes,
  orderItems,
  event,
  userId,
  payload,
}: {
  promotionCodes?: string[]
  orderItems: NewOrderItemWithBookingType[]
  event: Event
  userId: number
  payload: BasePayload
}) => {
  let promotions: Promotion[] = []

  const eventId = event?.id

  if (promotionCodes?.length) {
    const _promotionCodes = [...new Set(promotionCodes)]

    const eventPromotionConfig = await payload
      .find({
        collection: 'promotionConfigs',
        limit: 1,
        where: {
          event: { equals: Number(eventId) },
        },
        select: {
          id: true,
          name: true,
          description: true,
          event: true,
          validationRules: true,
          stackingRules: true,
        },
        depth: 0,
      })
      .then((res) => res.docs?.[0])

    promotions = await Promise.all(
      _promotionCodes.map((promotionCode) =>
        checkPromotionCode({
          promotionCode,
          eventId,
          userId,
          payload,
        }),
      ),
    )

    const allowApplyingMultiplePromotions =
      eventPromotionConfig?.validationRules?.allowApplyingMultiplePromotions
    const maxAppliedPromotions = eventPromotionConfig?.validationRules?.maxAppliedPromotions || 1

    if (!allowApplyingMultiplePromotions && promotions.length > 1) {
      throw new Error('PROMO009')
    }

    if (allowApplyingMultiplePromotions && promotions.length > maxAppliedPromotions) {
      throw new Error(`PROMO010|${JSON.stringify({ maxAppliedPromotions })}`)
    }

    // todo handle stackingRules

    for (const promotion of promotions) {
      if (promotion.conditions?.isApplyCondition) {
        const appliedTicketClasses = promotion?.appliedTicketClasses || []

        const totalQuantityAppliedTicketClasses = orderItems.reduce((totalQuantity, orderItem) => {
          const ticketPriceInfo = event?.ticketPrices?.find(
            (ticketPrice: any) => ticketPrice.id === orderItem.ticketPriceId,
          )

          const appliedForTicket =
            appliedTicketClasses.length === 0 ||
            appliedTicketClasses.some((applied) => applied.ticketClass === ticketPriceInfo?.name)

          const quantity = 1 // for booking type seat, quantity always 1

          if (appliedForTicket) {
            totalQuantity += quantity
          }

          return totalQuantity
        }, 0)

        const canApplyPromoCode =
          !!promotion.conditions?.minTickets &&
          totalQuantityAppliedTicketClasses >= (promotion.conditions?.minTickets as number)

        if (!canApplyPromoCode) {
          throw new Error(`PROMO008|${JSON.stringify({ promotionCode: promotion.code })}`)
        }
      }
    }
  }

  let totalBeforeDiscount = 0
  let totalDiscount = 0

  const promotionsApplied: PromotionApplied[] = []

  if (promotions.length) {
    for (const promotion of promotions) {
      const calculateData = calculateTotalDiscountBookingTypeSeat({
        orderItems,
        promotion,
        event,
      })

      if (!totalBeforeDiscount) {
        totalBeforeDiscount = calculateData.totalBeforeDiscount
      }

      totalDiscount += calculateData.totalBeforeDiscount - calculateData.amount

      promotionsApplied.push({
        promotion: promotion.id,
        promotionCode: promotion.code,
        discountAmount: calculateData.totalBeforeDiscount - calculateData.amount,
      })
    }
  } else {
    const calculateData = calculateTotalDiscountBookingTypeSeat({
      orderItems,
      event,
    })
    totalBeforeDiscount = calculateData.totalBeforeDiscount
    totalDiscount = calculateData.totalDiscount
  }

  let amount = totalBeforeDiscount - totalDiscount
  amount = amount < 0 ? 0 : amount

  return {
    amount,
    totalBeforeDiscount,
    totalDiscount,
    promotionsApplied,
    promotions
  }
}
