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
import { checkSeatAvailable, createOrderAndTickets, createPayment } from './utils'
import { sendTicketMail } from '../helper/sendTicketMail'

type AdminCreateOrderData = {
  customer: CustomerInfo
  order: NewInputOrder & { note?: string; adjustedTotal?: number }
}

export const createOrderHandler = async (req: PayloadRequest) => {
  try {
    if (!req.user) {
      throw new Error('UNAUTHORIZED')
    }

    const body = ((await req.json?.()) || {}) as AdminCreateOrderData

    const customer = body.customer

    const order = body.order
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
        adjustedTotal,
        note: order.note,
      })

      // create payment record
      await createPayment({
        customerData,
        newOrder,
        totalDiscount: newOrder.totalDiscount as number,
        totalBeforeDiscount: newOrder.totalBeforeDiscount as number,
        total: newOrder.total as number,
        transactionID,
        currency: order.currency,
        payload,
      })

      // Commit the transaction
      await payload.db.commitTransaction(transactionID)

      // send mail
      const user = newTickets?.[0]?.user as User
      const ticketData = newTickets.map((tk) => ({
        ticketCode: tk?.ticketCode as string,
        seat: tk?.seat as string,
        eventDate: tk?.eventDate as string,
        ticketId: tk?.id,
      }))
      sendTicketMail({
        event,
        user,
        ticketData,
        payload,
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
