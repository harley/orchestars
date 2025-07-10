import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      ticketId,
      ticketCode,
      eventId,
      eventScheduleId,
      eventDate,
      userEmail,
      firstName,
      lastName,
    } = body

    if (!ticketId || !ticketCode || !eventId || !userEmail) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    const payload = await getPayload()

    // 1. Find the ticket
    const ticketRes = await payload.findByID({
      collection: 'tickets',
      id: ticketId,
      depth: 2, // get user, event, order
    })
    if (!ticketRes) {
      return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 })
    }

    // 2. Validate ticket info
    if (
      ticketRes.ticketCode !== ticketCode ||
      ticketRes.event !== eventId ||
      (eventScheduleId && ticketRes.eventScheduleId !== eventScheduleId) ||
      (ticketRes.user && ticketRes.user.email !== userEmail) ||
      (firstName && ticketRes.user?.firstName !== firstName) ||
      (lastName && ticketRes.user?.lastName !== lastName)
    ) {
      return NextResponse.json({ success: false, message: 'Ticket information does not match' }, { status: 400 })
    }

    // 3. Check ticket status
    if (ticketRes.status !== 'booked') {
      return NextResponse.json({ success: false, message: 'Ticket is not valid for check-in (not booked)' }, { status: 400 })
    }

    // 4. Check order status
    if (!ticketRes.order) {
      return NextResponse.json({ success: false, message: 'No order found for this ticket' }, { status: 400 })
    }
    const orderId = typeof ticketRes.order === 'string' ? ticketRes.order : ticketRes.order.id
    const order = await payload.findByID({ collection: 'orders', id: orderId })
    if (!order || order.status !== 'completed') {
      return NextResponse.json({ success: false, message: 'Order is not completed/paid' }, { status: 400 })
    }

    // 5. Check if already checked in
    const checkinRes = await payload.find({
      collection: 'checkinRecords',
      where: {
        ticketCode: { equals: ticketCode },
        event: { equals: eventId },
        ...(eventScheduleId ? { eventScheduleId: { equals: eventScheduleId } } : {}),
        seat: { equals: ticketRes.seat },
      },
      limit: 1,
    })
    if (checkinRes.docs.length > 0) {
      return NextResponse.json({ success: false, message: 'Ticket already checked in' }, { status: 400 })
    }

    // All checks passed
    return NextResponse.json({
      success: true,
      message: 'Ticket is valid for check-in',
      ticket: {
        id: ticketRes.id,
        ticketCode: ticketRes.ticketCode,
        event: ticketRes.event,
        eventScheduleId: ticketRes.eventScheduleId,
        eventDate: ticketRes.eventDate,
        seat: ticketRes.seat,
        user: ticketRes.user ? {
          email: ticketRes.user.email,
          firstName: ticketRes.user.firstName,
          lastName: ticketRes.user.lastName,
        } : null,
        status: ticketRes.status,
        orderStatus: order.status,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
