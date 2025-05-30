import { NextRequest, NextResponse } from 'next/server'
import payload, { BasePayload } from 'payload'
import config from '@/payload.config'
import { Event, Promotion, User } from '@/payload-types'
import { generateCode } from '@/utilities/generateCode'
import {
  calculateTotalDiscount,
  calculateTotalDiscountBookingTypeSeat,
  checkEvents,
  checkPromotionCode,
  checkRemainingQuantitySeats,
  checkSeatAvailable,
  checkTicketClassAvailable,
  clearSeatHolding,
  createCustomerIfNotExist,
  createOrderAndTickets,
  createOrderAndTicketsWithTicketClassType,
  createOrderWithMultiplePromotionsAndTickets,
  createUserPromotionRedemption,
  validateCustomerInfo,
  validateOrderItemsBookingTypeSeat,
} from '@/app/(payload)/api/bank-transfer/order/utils'

import {
  CustomerInfo,
  NewInputOrder,
  NewOrderItemWithBookingType,
  PromotionApplied,
} from '@/app/(payload)/api/bank-transfer/order/types'
import {
  createMarketingTrackingOrder,
  createPayment,
  createZaloPaymentLink,
  generateZaloPayOrderData,
} from './utils'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'

enum BOOKING_TYPE {
  ticketClass = 'ticketClass',
  seat = 'seat',
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const bookingType = (body.bookingType as BOOKING_TYPE) || BOOKING_TYPE.ticketClass

  if (!bookingType || !Object.values(BOOKING_TYPE).includes(bookingType)) {
    return NextResponse.json({ message: 'Invalid booking type' }, { status: 400 })
  }

  if (bookingType === BOOKING_TYPE.seat) {
    return handleOrderWithBookingTypeSeat({ body })
  }

  return handleOrderWithBookingTypeTicketClass({ body })
}

const handleOrderWithBookingTypeSeat = async ({ body }: { body: Record<string, any> }) => {
  const customer = body.customer as CustomerInfo

  const order = body.order as NewInputOrder
  let orderItems = order.orderItems as NewOrderItemWithBookingType[]

  await validateCustomerInfo({ customer })
  await validateOrderItemsBookingTypeSeat({ orderItems })

  // for booking seat, quantity always 1
  orderItems = orderItems.map((ordItem) => ({ ...ordItem, quantity: 1 }))

  const orderCode = generateCode('ORD')

  try {
    await payload.init({ config })

    // // check seat available
    await checkSeatAvailable({ orderItems, payload })

    // check event id, ticket id is exist
    const events = await checkEvents({ orderItems, payload })

    const event = events?.[0] as Event

    await checkRemainingQuantitySeats({ event, orderItems, payload })

    const transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
      throw new Error('SYS001')
    }

    try {
      // 1 check user info, it not exist, will create a new one
      const customerData = await createCustomerIfNotExist({ customer, transactionID, payload })

      // now support only 1 event
      const eventId = event.id as number

      let resultData
      let newOrder

      if (!order.promotionCodes?.length) {
        const result = await createNewOrderWithSinglePromotion({
          order,
          orderCode,
          customer,
          eventId,
          events,
          orderItems,
          event,
          customerData,
          transactionID,
          payload,
        })

        resultData = result.resultData
        newOrder = result.newOrder
      } else {
        const result = await createNewOrderWithMultiPromotions({
          order,
          orderCode,
          customer,
          eventId,
          events,
          orderItems,
          event,
          customerData,
          transactionID,
          payload,
        })

        resultData = result.resultData
        newOrder = result.newOrder
      }

      // Commit the transaction
      await payload.db.commitTransaction(transactionID)

      const nextResponse = NextResponse.json(resultData, { status: 200 })

      // clear seat holding code cookie and close session seat holding
      await clearSeatHolding({ nextResponse, payload })

      createMarketingTrackingOrder({ newOrder })

      return nextResponse
    } catch (error: any) {
      // Rollback the transaction
      console.error('ZaloPay transaction create order error:', error)
      await payload.db.rollbackTransaction(transactionID)

      return NextResponse.json(
        { message: await handleNextErrorMsgResponse(error), error },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error('ZaloPay create order error:', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}

const handleOrderWithBookingTypeTicketClass = async ({ body }: { body: Record<string, any> }) => {
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
      throw new Error('SYS001')
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
      // set expire time in 20 minutes
      const expireAt = new Date(Date.now() + 20 * 60 * 1000)

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
        expireAt,
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
        expireAt,
        payload,
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

      createMarketingTrackingOrder({ newOrder })

      return nextResponse
    } catch (error) {
      // Rollback the transaction
      console.error('ZaloPay transaction create order error:', error)
      await payload.db.rollbackTransaction(transactionID)

      return NextResponse.json(
        { message: await handleNextErrorMsgResponse(error), error },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error('ZaloPay create order error:', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}

const createNewOrderWithSinglePromotion = async ({
  order,
  orderCode,
  customer,
  eventId,
  events,
  orderItems,
  event,
  customerData,
  transactionID,
  payload,
}: {
  order: NewInputOrder
  orderCode: string
  customer: CustomerInfo
  eventId: number
  events: Event[]
  orderItems: NewOrderItemWithBookingType[]
  event: Event
  customerData: User
  transactionID: number | Promise<number | string> | string
  payload: BasePayload
}) => {
  let promotion: Promotion | undefined

  if (order.promotionCode) {
    promotion = await checkPromotionCode({
      promotionCode: order.promotionCode,
      eventId,
      userId: customerData.id,
      payload,
    })

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
        !!promotion.conditions.minTickets &&
        totalQuantityAppliedTicketClasses >= promotion.conditions.minTickets

      if (!canApplyPromoCode) {
        throw new Error(`PROMO008|${JSON.stringify({ promotionCode: promotion.code })}`)
      }
    }
  }

  const { amount, totalBeforeDiscount, totalDiscount } = calculateTotalDiscountBookingTypeSeat({
    orderItems,
    promotion,
    event,
  })

  console.log(
    'amount, totalBeforeDiscount, totalDiscount',
    amount,
    totalBeforeDiscount,
    totalDiscount,
  )

  const { zalopayDataOrder } = generateZaloPayOrderData({
    orderCode,
    amount,
    orderItems,
    customer,
  })

  // set expire time in 20 minutes
  const EXPIRED_AT = new Date(Date.now() + 20 * 60 * 1000)

  // create order
  const { newOrder } = await createOrderAndTickets({
    orderCode,
    customerData,
    orderItems,
    promotion,
    events,
    transactionID,
    currency: order.currency,
    payload,
    customerInput: customer,
    expireAt: EXPIRED_AT,
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
    expireAt: EXPIRED_AT,
    payload,
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

  return { resultData, newOrder }
}

const createNewOrderWithMultiPromotions = async ({
  order,
  orderCode,
  customer,
  eventId,
  events,
  orderItems,
  event,
  customerData,
  transactionID,
  payload,
}: {
  order: NewInputOrder
  orderCode: string
  customer: CustomerInfo
  eventId: number
  events: Event[]
  orderItems: NewOrderItemWithBookingType[]
  event: Event
  customerData: User
  transactionID: number | Promise<number | string> | string
  payload: BasePayload
}) => {
  let promotions: Promotion[] = []

  if (order.promotionCodes?.length) {
    const promotionCodes = [...new Set(order.promotionCodes)]

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
      promotionCodes.map((promotionCode) =>
        checkPromotionCode({
          promotionCode,
          eventId,
          userId: customerData.id,
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
          !!promotion.conditions.minTickets &&
          totalQuantityAppliedTicketClasses >= promotion.conditions.minTickets

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

  console.log(
    'amount, totalBeforeDiscount, totalDiscount',
    amount,
    totalBeforeDiscount,
    totalDiscount,
  )

  const { zalopayDataOrder } = generateZaloPayOrderData({
    orderCode,
    amount,
    orderItems,
    customer,
  })

  // set expire time in 20 minutes
  const EXPIRED_AT = new Date(Date.now() + 20 * 60 * 1000)

  // create order
  const { newOrder } = await createOrderWithMultiplePromotionsAndTickets({
    orderCode,
    customerData,
    orderItems,
    events,
    amount,
    totalBeforeDiscount,
    totalDiscount,
    promotionsApplied,
    transactionID,
    currency: order.currency,
    payload,
    customerInput: customer,
    expireAt: EXPIRED_AT,
  })

  // create payment record
  const payment = await createPayment({
    customerData,
    newOrder,
    promotionsApplied,
    totalDiscount,
    totalBeforeDiscount,
    zaloPayOrder: zalopayDataOrder,
    transactionID,
    currency: order.currency,
    expireAt: EXPIRED_AT,
    payload,
  })

  // save user promotion redemption
  if (promotions.length) {
    await Promise.all(
      promotions.map((promotion) =>
        createUserPromotionRedemption({
          promotion,
          user: customerData,
          payment,
          eventId,
          transactionID,
          payload,
        }),
      ),
    )
  }

  const { result: resultData } = await createZaloPaymentLink({
    zalopayDataOrder,
  })

  // todo write payment history

  return { resultData, newOrder }
}
