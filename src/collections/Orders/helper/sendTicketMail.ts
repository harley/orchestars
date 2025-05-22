import { sendMailAndWriteLog } from '@/collections/Emails/utils'
import { EMAIL_CC } from '@/config/email'
import { generateTicketBookEmailHtml } from '@/mail/templates/TicketBookedEmail'
import { Event, User } from '@/payload-types'
import { BasePayload } from 'payload'

export const sendTicketMail = async ({
  event,
  user,
  ticketData,
  payload,
}: {
  event: Event
  user: User
  ticketData: { ticketId: number; ticketCode: string; seat: string; eventDate: string }[]
  payload: BasePayload
}) => {
  for (const data of ticketData) {
    const html = await generateTicketBookEmailHtml({
      ticketCode: data.ticketCode,
      seat: data.seat,
      eventName: event.title || '',
      eventDate: data.eventDate,
    })

    await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay of 1 second

    const resendMailData = {
      to: user.email,
      cc: EMAIL_CC,
      subject: 'Ticket Confirmation',
      html,
    }

    sendMailAndWriteLog({
      payload: payload,
      resendMailData,
      emailData: {
        user: user.id,
        event: event?.id,
        ticket: data?.ticketId,
      },
    })
  }
}
