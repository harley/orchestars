import { FieldHookArgs } from 'payload'
// import { generateTicketBookEmailHtml } from '@/mail/templates/TicketBookedEmail'
import { sendMailAndWriteLog } from '@/collections/Emails/utils'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
import { generateTicketDisneyEventBookEmailHtml } from '@/mail/templates/TicketDisneyEventBookedEmail'

export const afterChangeSeat = async ({ value, originalDoc, data, req }: FieldHookArgs) => {
  if (originalDoc.status === 'booked' && data?.allowSendMailAfterChanged) {
    const handler = async () => {
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
          const startTime = event?.startDatetime
            ? tzFormat(toZonedTime(new Date(event.startDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')
            : ''
          const endTime = event?.endDatetime
            ? tzFormat(toZonedTime(new Date(event.endDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')
            : ''
          const eventLocation = event?.eventLocation as string

          const html = generateTicketDisneyEventBookEmailHtml({
            ticketCode: originalDoc.ticketCode,
            eventName: event?.title || '',
            eventDate: `${startTime || 'N/A'} - ${endTime || 'N/A'}, ${originalDoc?.eventDate || 'N/A'} (Giờ Việt Nam | Vietnam Time, GMT+7)`,
            seat: value,
            eventLocation,
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
              status: 'sent'
            },
          })
        }
      } catch (error) {
        console.error('Error sending email:', error)
      }
    }

    handler()
  }
  return value
}
