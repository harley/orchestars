import { FieldHookArgs } from 'payload'
import { generateTicketBookEmailHtml } from '@/mail/templates/TicketBookedEmail'

import { Event, User } from '@/payload-types'

export const afterChangeStatus = async ({ value, originalDoc, req }: FieldHookArgs) => {
  // When an order's status is updated to 'completed'

  if (value === 'completed' && originalDoc) {
    try {
      const orderItems = await req.payload
        .find({
          collection: 'orderItems',
          where: { order: { equals: originalDoc.id } },
        })
        .then((res) => res.docs)

      if (!orderItems?.length) {
        return
      }

      const tickets = await Promise.all(
        orderItems.map((oItem) =>
          req.payload
            .update({
              collection: 'tickets',
              where: {
                orderItem: { equals: oItem.id },
                event: { equals: (oItem.event as Event).id },
              },
              data: {
                status: 'booked',
              },
            })
            .then((res) => res.docs?.[0]),
        ),
      )

      const userEmail = (tickets?.[0]?.user as User)?.email
      const eventName = (tickets?.[0]?.event as Event)?.title
      if (userEmail) {
        const ticketData = tickets
          .filter((tk) => !!tk?.ticketCode)
          .map((tk) => ({
            ticketCode: tk?.ticketCode as string,
            seat: tk?.seat as string,
            eventDate: tk?.eventDate as string,
          }));
      
        // Loop through the ticket data and send an email with a delay of 1 second for each ticket
        for (const data of ticketData) {
          const html = await generateTicketBookEmailHtml({
            ticketCode: data.ticketCode,
            seat: data.seat,
            eventName: eventName || '',
            eventDate: data.eventDate,
          });
      
          await new Promise((resolve) => setTimeout(resolve, 1000));  // Delay of 1 second
      
          await req.payload
            .sendEmail({
              to: userEmail,
              cc: 'receipts@orchestars.vn',
              subject: 'Ticket Confirmation',
              html,
            })
            .catch((error) => {
              console.error('Error while sending mail ticket', error);
            });
        }      
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
    }
  }
  return value
}
