import {
  CustomerInfo,
  NewInputOrder,
  NewOrderItemWithBookingType,
} from '@/app/(payload)/api/bank-transfer/order/types'
import {
  checkEvents,
  checkRemainingQuantitySeats,
  createCustomerIfNotExist,
  validateCustomerInfo,
  validateOrderItemsBookingTypeSeat,
} from '@/app/(payload)/api/bank-transfer/order/utils'
import { Event, User } from '@/payload-types'
import { generateCode } from '@/utilities/generateCode'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'
import { NextResponse } from 'next/server'
import { PayloadRequest } from 'payload'
import {
  checkSeatAvailable,
  createOrderAndTickets,
  createPayment,
  processPromotionsApplied,
} from './utils'
import { sendTicketMail } from '../helper/sendTicketMail'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
import { USER_PROMOTION_REDEMPTION_STATUS } from '@/collections/Promotion/constants/status'
type AdminCreateOrderData = {
  customer: CustomerInfo
  order: NewInputOrder & {
    note?: string
    adjustedTotal?: number
    category?: string
    promotionCodes?: string[]
  }
}

export const createOrderHandler = async (req: PayloadRequest) => {
  try {
    if (!req.user) {
      throw new Error('UNAUTHORIZED')
    }

    const body = ((await req.json?.()) || {}) as AdminCreateOrderData

    const customer = body.customer

    const order = body.order
    console.log('order', order)

    let orderItems = order.orderItems as NewOrderItemWithBookingType[]

    await validateCustomerInfo({ customer })
    await validateOrderItemsBookingTypeSeat({ orderItems })

    let adjustedTotal
    if (order.adjustedTotal != undefined) {
      if (isNaN(+order.adjustedTotal)) {
        throw new Error('ORD006')
      }
      if (+order.adjustedTotal < 0) {
        throw new Error('ORD007')
      }
      adjustedTotal = +order.adjustedTotal
    }

    // for booking seat, quantity always 1
    orderItems = orderItems.map((ordItem) => ({ ...ordItem, quantity: 1 }))

    const orderCode = generateCode('ORD')
    const payload = req.payload

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

      const { amount, totalBeforeDiscount, totalDiscount, promotionsApplied, promotions } =
        await processPromotionsApplied({
          promotionCodes: order.promotionCodes,
          orderItems,
          event,
          userId: customerData.id,
          payload,
        })

      // create order
      const { newOrder, newTickets } = await createOrderAndTickets({
        orderCode,
        customerData,
        orderItems,
        events,
        transactionID,
        currency: order.currency,
        payload,
        customerInput: customer,
        req,
        note: order.note,
        orderData: {
          category: order.category,
          totalBeforeDiscount,
          totalDiscount,
          total: adjustedTotal ?? amount,
          promotionsApplied,
        },
      })

      // create payment record
      const payment = await createPayment({
        customerData,
        newOrder,
        totalDiscount: newOrder.totalDiscount as number,
        totalBeforeDiscount: newOrder.totalBeforeDiscount as number,
        total: newOrder.total as number,
        transactionID,
        currency: order.currency,
        payload,
        paymentEntityData: {
          promotionsApplied,
        },
      })

      if (promotions.length) {
        await Promise.all(
          promotions.map((promotion) =>
            payload.create({
              collection: 'userPromotionRedemptions',
              data: {
                promotion: promotion.id,
                user: customerData.id,
                event: event?.id,
                payment: payment.id,
                status: USER_PROMOTION_REDEMPTION_STATUS.used.value,
                redeemAt: new Date().toISOString(),
              },
              req: { transactionID },
              depth: 0,
            }),
          ),
        )
      }

      // Commit the transaction
      await payload.db.commitTransaction(transactionID)

      // send mail
      const user = newTickets?.[0]?.user as User

      const startTime = event?.startDatetime
        ? tzFormat(toZonedTime(new Date(event.startDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')
        : ''
      const endTime = event?.endDatetime
        ? tzFormat(toZonedTime(new Date(event.endDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')
        : ''
      const eventLocation = event?.eventLocation as string

      const ticketData = newTickets.map((tk) => ({
        ticketCode: tk?.ticketCode as string,
        seat: tk?.seat as string,
        ticketId: tk?.id,
        eventDate: `${startTime || 'N/A'} - ${endTime || 'N/A'}, ${tk?.eventDate || 'N/A'} (Giờ Việt Nam | Vietnam Time, GMT+7)`,
        eventLocation,
      }))
      await sendTicketMail({
        event,
        user,
        ticketData,
        payload,
      }).catch((err) => {
        console.error('Error while sending ticket mail in create order admin handler:', err)
      })

      const nextResponse = NextResponse.json({}, { status: 200 })

      return nextResponse
    } catch (error: any) {
      // Rollback the transaction
      console.error('admin create order error:', error)
      await payload.db.rollbackTransaction(transactionID)

      return NextResponse.json(
        { message: await handleNextErrorMsgResponse(error), error },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error('admin create order error:', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}
