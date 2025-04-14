import { FieldHookArgs } from 'payload'
import { generateTicketBookEmailHtml } from '@/mail/templates/TicketBookedEmail'
import { sendMailAndWriteLog } from '@/collections/Emails/utils'

export const afterChangeSeat = async ({ value, originalDoc, data, req }: FieldHookArgs) => {
  if (originalDoc.status === 'booked' && data?.allowSendMailAfterChanged) {
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

        const resendMailData = {
          to: user?.email,
          subject: `Update_${event?.title || ''}: Ticket Confirmation`,
          cc: 'receipts@orchestars.vn',
          html,
        }

        sendMailAndWriteLog({
          payload: req.payload,
          resendMailData,
          emailData: {
            user: user.id,
            event: event?.id,
            ticket: originalDoc.id,
          },
        })
      }
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }
  return value
}
