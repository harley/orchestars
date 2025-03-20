import { FieldHookArgs } from 'payload'
import { generateTicketBookEmailHtml } from '@/mail/templates/TicketBookedEmail'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { Event, User } from '@/payload-types'
import { getQRCodeStringBuffer } from '@/utilities/qrCode'

export const afterChangeStatus = async ({ value, originalDoc, req }: FieldHookArgs) => {
  // When an order's status is updated to 'completed'

  if (value === 'completed' && originalDoc) {
    try {
      const orderItems = await req.payload
        .find({
          collection: 'orderItems',
          where: { order: { equals: originalDoc.id } },
        })
        .then((res) => res.docs)

      if (!orderItems?.length) {
        return
      }

      const tickets = await Promise.all(
        orderItems.map((oItem) =>
          req.payload
            .update({
              collection: 'tickets',
              where: {
                orderItem: { equals: oItem.id },
                event: { equals: (oItem.event as Event).id },
              },
              data: {
                status: 'booked',
              },
            })
            .then((res) => res.docs?.[0]),
        ),
      )

      const userEmail = (tickets?.[0]?.user as User)?.email
      const eventName = (tickets?.[0]?.event as Event)?.title
      if (userEmail) {
        const ticketCodes = tickets.map((tk) => tk?.ticketCode).filter((code) => !!code) as string[]
        const ticketCodeBuffers = await Promise.all(
          ticketCodes.map(async (ticketCode) => ({
            ticketCode,
            buffer: await getQRCodeStringBuffer(ticketCode),
          })),
        )

        const html = await generateTicketBookEmailHtml({
          ticketCode: ticketCodes.join(', '),
          eventName: eventName || '',
        })

        const attachments = ticketCodeBuffers.map((tkBf) => ({
          content: tkBf.buffer,
          filename: `${tkBf.ticketCode}.png`,
          cid: `${tkBf.ticketCode}`,
        }))
        const attachmentPath = join(process.cwd(), 'public', 'eventTerms.doc')
        const fileBuffer = await readFile(attachmentPath)

        await req.payload.sendEmail({
          to: userEmail,
          subject: 'Ticket Confirmation',
          html,
          cc: 'receipts@orchestars.vn',
          attachDataUrls: true,
          attachments: [
            {
              content: fileBuffer,
              filename: 'eventTerms.doc',
              // contentType: 'application/msword',
            },
            ...attachments,
          ],
        })
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
    }
  }
  return value
}
