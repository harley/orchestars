import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import config from '@/payload.config'
import { Event, Promotion } from '@/payload-types'
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
  createUserPromotionRedemption,
  validateOrderItemsBookingTypeSeat,
} from '@/app/(payload)/api/bank-transfer/order/utils'

import {
  CustomerInfo,
  NewInputOrder,
  NewOrderItemWithBookingType,
} from '@/app/(payload)/api/bank-transfer/order/types'
import { createPayment, createZaloPaymentLink, generateZaloPayOrderData } from './utils'

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
      throw new Error('Có lỗi xảy ra! Vui lòng thử lại')
    }

    try {
      // 1 check user info, it not exist, will create a new one
      const customerData = await createCustomerIfNotExist({ customer, transactionID, payload })

      // now support only 1 event
      const eventId = event.id as number

      let promotion: Promotion | undefined

      // check promotion code if exist
      if (order.promotionCode) {
        promotion = await checkPromotionCode({
          promotionCode: order.promotionCode,
          eventId,
          userId: customerData.id,
          payload,
        })

        if (promotion.conditions?.isApplyCondition) {
          const appliedTicketClasses = promotion?.appliedTicketClasses || []

          const totalQuantityAppliedTicketClasses = orderItems.reduce(
            (totalQuantity, orderItem) => {
              const ticketPriceInfo = event?.ticketPrices?.find(
                (ticketPrice: any) => ticketPrice.id === orderItem.ticketPriceId,
              )

              const appliedForTicket =
                appliedTicketClasses.length === 0 ||
                appliedTicketClasses.some(
                  (applied) => applied.ticketClass === ticketPriceInfo?.name,
                )

              const quantity = 1 // for booking type seat, quantity always 1

              if (appliedForTicket) {
                totalQuantity += quantity
              }

              return totalQuantity
            },
            0,
          )

          const canApplyPromoCode =
            !!promotion.conditions.minTickets &&
            totalQuantityAppliedTicketClasses >= promotion.conditions.minTickets

          if (!canApplyPromoCode) {
            throw new Error(
              `Chưa thoả mãn số lượng vé tối thiểu để áp dụng mã giảm giá [${promotion.code}]`,
            )
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

      // Commit the transaction
      await payload.db.commitTransaction(transactionID)

      const nextResponse = NextResponse.json(resultData, { status: 200 })

      // clear seat holding code cookie and close session seat holding
      await clearSeatHolding({ nextResponse, payload })

      return nextResponse
    } catch (error: any) {
      // Rollback the transaction
      console.error('ZaloPay transaction create order error:', error)
      await payload.db.rollbackTransaction(transactionID)

      return NextResponse.json(
        { message: error?.message || 'Có lỗi xảy ra! Vui lòng thử lại', error },
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
      throw new Error('Có lỗi xảy ra! Vui lòng thử lại')
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

      return nextResponse
    } catch (error) {
      // Rollback the transaction
      console.error('ZaloPay transaction create order error:', error)
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
