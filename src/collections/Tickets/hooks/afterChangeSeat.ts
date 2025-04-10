import { FieldHookArgs } from 'payload'
import { generateTicketBookEmailHtml } from '@/mail/templates/TicketBookedEmail'

export const afterChangeSeat = async ({ value, originalDoc, req }: FieldHookArgs) => {
  if (originalDoc.status === "booked") {
    try {
      const user = await req.payload
      .findByID({
        collection: 'users',
        depth: 0,
        id: originalDoc?.user,
      })
      .then((res) => res)
      .catch(() => null)

      const event = await req.payload
        .findByID({
          collection: 'events',
          depth: 0,
          id: originalDoc?.event,
        })
        .then((res) => res)
        .catch(() => null)

      if (user?.email) {

        const html = await generateTicketBookEmailHtml({
          ticketCode: originalDoc.ticketCode,
          eventName: event?.title || '',
          eventDate: originalDoc?.eventDate || '',
          seat: value,
        })


        await req.payload.sendEmail({
          to: user?.email,
          subject: `Update_${event?.title || ''}: Ticket Confirmation`,
          cc: 'receipts@orchestars.vn',
          html

        })
      }
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }
  return value
}
