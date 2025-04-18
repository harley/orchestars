import { FieldHookArgs } from 'payload'
import { generateTicketBookEmailHtml } from '@/mail/templates/TicketBookedEmail'

import { Event, User } from '@/payload-types'
import { sendMailAndWriteLog } from '@/collections/Emails/utils'

export const afterChangeStatus = async ({ value, originalDoc, req }: FieldHookArgs) => {
  // When an order's status is updated to 'completed'
  if (value === 'completed' && originalDoc) {
    const handler = async () => {
      try {
        const orderItems = await req.payload
          .find({
            collection: 'orderItems',
            where: { order: { equals: originalDoc.id } },
            limit: 100,
          })
          .then((res) => res.docs)

        if (!orderItems?.length) {
          return
        }

        const orConditions = orderItems.map((oItem) => ({
          orderItem: { equals: oItem.id },
          event: { equals: (oItem.event as Event).id },
        }))

        const tickets = await req.payload
          .update({
            collection: 'tickets',
            where: {
              or: orConditions,
            },
            data: {
              status: 'booked',
            },
          })
          .then((res) => res.docs || [])

        const user = tickets?.[0]?.user as User
        const event = tickets?.[0]?.event as Event
        const userEmail = user?.email

        const eventName = event?.title
        if (userEmail) {
          const ticketData = tickets
            .filter((tk) => !!tk?.ticketCode)
            .map((tk) => ({
              ticketCode: tk?.ticketCode as string,
              seat: tk?.seat as string,
              eventDate: tk?.eventDate as string,
              ticketId: tk?.id,
            }))

          // Loop through the ticket data and send an email with a delay of 1 second for each ticket
          for (const data of ticketData) {
            const html = await generateTicketBookEmailHtml({
              ticketCode: data.ticketCode,
              seat: data.seat,
              eventName: eventName || '',
              eventDate: data.eventDate,
            })

            await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay of 1 second

            const resendMailData = {
              to: userEmail,
              cc: 'receipts@orchestars.vn',
              subject: 'Ticket Confirmation',
              html,
            }

            sendMailAndWriteLog({
              payload: req.payload,
              resendMailData,
              emailData: {
                user: user.id,
                event: event?.id,
                ticket: data?.ticketId,
              },
            })
          }
        }
      } catch (error) {
        console.error('Error updating ticket status:', error)
      }
    }

    handler()
  }
  return value
}
