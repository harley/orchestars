import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from '@/payload-config/getPayloadConfig';
import { TICKET_STATUS } from '@/collections/Tickets/constants';
import { generateCode } from '@/utilities/generateCode';

export const POST = async (req: NextRequest) => {
  try {
    const payload = await getPayload();
    // 1. Fetch user info for id=1
    const userId = 2155
    const user = await payload.findByID({ collection: 'users', id: userId, depth: 0 });
    if (!user) {
      return NextResponse.json({ error: 'User with id=1 not found' }, { status: 404 });
    }
    // 2. Prepare customer info
    const customerInfo = {
      firstName: user.firstName || ' ',
      lastName: user.lastName || ' ',
      phoneNumber: user.phoneNumber || ' ',
      email: user.email || '',
    };
    // 3. Start transaction
    const transactionID = await payload.db.beginTransaction();
    if (!transactionID) {
      return NextResponse.json({ error: 'Failed to start transaction' }, { status: 500 });
    }
    const eventId = 7
    const eventScheduleId = '683a7215ebb0977f425da45d'
    const ticketPriceName = 'EXTRA'
    const ticketPriceId = 'EXTRA'
    const date = '19'
    try {
      // 5. Prepare tickets/order items
      const ticketsData: any[] = [];
      const orderItemsData: any[] = [];
      for (let i = 1; i <= 72; i++) {
        const codeNumber = i.toString().padStart(2, '0');
        let ticketCode = generateCode('TK', {timestampLength: 4})
        ticketCode = `${ticketCode}-EXTRA-${date}.${codeNumber}`;
        const seat = `EXTRA${codeNumber}`
        ticketsData.push({ ticketCode });
        orderItemsData.push({
          price: 0,
          quantity: 1,
          seat: seat, // Use code as seat label for uniqueness
          eventId,
          ticketPriceId,
          eventScheduleId,
        });
      }
      // 6. Create order
      const orderCode = generateCode('ORD-EXTRA', { timestampLength: 4 })
      const order = await payload.create({
        collection: 'orders',
        data: {
          user: user.id,
          orderCode: orderCode,
          status: 'completed',
          category: 'manual_extra',
          currency: 'VND',
          totalBeforeDiscount: 0,
          totalDiscount: 0,
          total: 0,
          customerData: customerInfo,
        },
        req: { transactionID },
        context: { triggerAfterCreated: false },
        depth: 0,
      });
      // 7. Create order items
      const orderItemIds: number[] = [];
      for (let i = 0; i < orderItemsData.length; i++) {
        const item = orderItemsData[i];
        const orderItem = await payload.create({
          collection: 'orderItems',
          data: {
            order: order.id,
            event: eventId,
            ticketPriceId: item.ticketPriceId,
            ticketPriceName,
            seat: item.seat,
            price: 0,
            quantity: 1,
          },
          req: { transactionID },
        });
        orderItemIds.push(orderItem.id);
      }
      // 8. Create tickets
      const createdTickets: string[] = [];
      for (let i = 0; i < ticketsData.length; i++) {
        const ticket = await payload.create({
          collection: 'tickets',
          data: {
            ticketCode: ticketsData[i].ticketCode,
            attendeeName: `${customerInfo.firstName} ${customerInfo.lastName}`,
            seat: ticketsData[i].ticketCode,
            status: TICKET_STATUS.booked.value,
            ticketPriceName,
            ticketPriceInfo: { id: ticketPriceId, name: ticketPriceName, price: 0 },
            event: eventId,
            eventScheduleId: eventScheduleId,
            orderItem: orderItemIds[i],
            user: user.id,
            order: order.id,
          },
          req: { transactionID },
        });
        createdTickets.push(ticket.ticketCode as string);
      }
      // 9. Create payment
      await payload.create({
        collection: 'payments',
        data: {
          user: user.id,
          order: order.id,
          paymentMethod: null,
          currency: 'VND',
          totalBeforeDiscount: 0,
          totalDiscount: 0,
          total: 0,
          status: 'paid',
          paymentData: {},
          paidAt: new Date().toISOString(),
        },
        req: { transactionID },
        context: { triggerAfterCreated: false },
        depth: 0,
      });
      // 10. Commit transaction
      await payload.db.commitTransaction(transactionID);
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderCode: order.orderCode,
        ticketCodes: createdTickets,
      });
    } catch (error: any) {
      await payload.db.rollbackTransaction(transactionID);
      return NextResponse.json({ error: error?.message || 'Failed to generate extra tickets' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
};
