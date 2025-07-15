import { addQueueEmail } from '@/collections/Emails/utils'
import { EMAIL_CC } from '@/config/email'
import { getGiftTicketAndAccountSetupEmailHtml } from '@/mail/templates/GiftTicketAndAccountSetup'
import { Event, User } from '@/payload-types'
import { TransactionID } from '@/types/TransactionID'
import { BasePayload } from 'payload'

export const sendGiftTicketAndAccountSetupMail = async ({
  event,
  user,
  ticketData,
  payload,
  transactionID,
  giftedByName,
  setupLink,
}: {
  event: Event
  user: User
  ticketData: {
    ticketId: number
    ticketCode: string
    seat: string
    eventDate: string
    eventLocation?: string
  }[]
  payload: BasePayload
  giftedByName: string
  setupLink?: string
  transactionID?: TransactionID
}) => {
  for (const data of ticketData) {
    const html = getGiftTicketAndAccountSetupEmailHtml({
      ticketCode: data.ticketCode,
      seat: data.seat,
      eventName: event.title || '',
      eventDate: data.eventDate,
      eventLocation: data.eventLocation,
      giftedByName: giftedByName,
      setupLink: setupLink,
    })

    const resendMailData = {
      to: user.email,
      cc: EMAIL_CC,
      subject: 'Ticket Gift Confirmation',
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
      transactionID,
    })
  }
}
