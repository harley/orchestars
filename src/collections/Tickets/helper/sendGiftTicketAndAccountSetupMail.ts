import { addQueueEmail } from '@/collections/Emails/utils'
import { EMAIL_CC } from '@/config/email'
import { getGiftTicketAndAccountSetupEmailHtml } from '@/mail/templates/GiftTicketAndAccountSetup'
import { User } from '@/payload-types'
import { TransactionID } from '@/types/TransactionID'
import { BasePayload } from 'payload'

export const sendGiftTicketAndAccountSetupMail = async ({
  user,
  ticketData,
  payload,
  transactionID,
  giftedByName,
  setupLink,
}: {
  user: User
  ticketData: {
    ticketId: number
    ticketCode: string
    seat: string
    eventId: number
    eventName: string
    eventDate: string
    eventLocation?: string
  }[]
  payload: BasePayload
  giftedByName: string
  setupLink?: string
  transactionID?: TransactionID
}) => {
  await Promise.all(
    ticketData.map(async (data) => {
      const html = getGiftTicketAndAccountSetupEmailHtml({
        ticketCode: data.ticketCode,
        seat: data.seat,
        eventName: data.eventName || '',
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

      return await addQueueEmail({
        payload,
        resendMailData,
        emailData: {
          user: user.id,
          event: data?.eventId,
          ticket: data?.ticketId,
        },
        transactionID,
      })
    }),
  )
}
