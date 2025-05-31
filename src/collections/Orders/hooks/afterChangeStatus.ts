import { FieldHookArgs } from 'payload'

import { Event, User } from '@/payload-types'
import { sendTicketMail } from '../helper/sendTicketMail'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'

export const afterChangeStatus = async ({ value, originalDoc, req, context }: FieldHookArgs) => {
  if (context.triggerAfterCreated === false) {
    return value
  }
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

        const startTime = event?.startDatetime ? tzFormat(toZonedTime(new Date(event.startDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm') : ''
        const endTime = event?.endDatetime ? tzFormat(toZonedTime(new Date(event.endDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm') : ''
        const eventLocation = event?.eventLocation as string

        if (userEmail) {
          const ticketData = tickets
            .filter((tk) => !!tk?.ticketCode)
            .map((tk) => ({
              ticketCode: tk?.ticketCode as string,
              seat: tk?.seat as string,
              ticketId: tk?.id,
              eventDate: `${startTime || 'N/A'} - ${endTime || 'N/A'}, ${tk?.eventDate || 'N/A'} (Giờ Việt Nam | Vietnam Time, GMT+7)`,
              eventLocation
            }))

          await sendTicketMail({
            event,
            user,
            ticketData,
            payload: req.payload,
          })
        }
      } catch (error) {
        console.error('Error updating ticket status:', error)
      }
    }

    await handler()
  }
  return value
}
