import { addQueueEmail } from '@/collections/Emails/utils'
import { EMAIL_CC } from '@/config/email'
import { generateTicketDisneyEventBookEmailHtml } from '@/mail/templates/TicketDisneyEventBookedEmail'
import { Event, User } from '@/payload-types'
import { TransactionID } from '@/types/TransactionID'
import { BasePayload } from 'payload'

export const sendTicketMail = async ({
  event,
  user,
  ticketData,
  payload,
  transactionID
}: {
  event: Event
  user: User
  ticketData: { ticketId: number; ticketCode: string; seat: string; eventDate: string; eventLocation?: string }[]
  payload: BasePayload
  transactionID?: TransactionID
}) => {
  for (const data of ticketData) {
    const html = generateTicketDisneyEventBookEmailHtml({
      ticketCode: data.ticketCode,
      seat: data.seat,
      eventName: event.title || '',
      eventDate: data.eventDate,
      eventLocation: data.eventLocation
    })

    await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay of 1 second

    const resendMailData = {
      to: user.email,
      cc: EMAIL_CC,
      subject: 'Ticket Confirmation',
      html,
    }

    await addQueueEmail({
      payload,
      resendMailData,
      emailData: {
        user: user.id,
        event: event?.id,
        ticket: data?.ticketId,
      },
      transactionID
    })
  }
}
