import { FieldHookArgs } from 'payload'
import { generateTicketBookEmailHtml } from '@/mail/templates/TicketBookedEmail'

export const afterChangeStatus = async ({ value, originalDoc, req }: FieldHookArgs) => {
  if (value === "booked") {
    try {

      if (originalDoc.user?.email) {

        const html = await generateTicketBookEmailHtml({
          ticketCode: originalDoc.ticketCode,
          eventName: originalDoc.event?.title || '',
        })

        await req.payload.sendEmail({
          to: originalDoc.user?.email,
          subject: 'Ticket Confirmation',
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
