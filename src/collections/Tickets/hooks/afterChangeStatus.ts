import { FieldHookArgs } from 'payload'
import { generateTicketBookEmailHtml } from '@/mail/templates/TicketBookedEmail'
import { readFile } from 'fs/promises'
import { join } from 'path'
import QRCode from 'qrcode'

// Create the absolute path to the file in the public folder
const attachmentPath = join(process.cwd(), 'public', 'eventTerms.doc')

export const afterChangeStatus = async ({ value, originalDoc, req }: FieldHookArgs) => {
  if (value) {
    try {
      const fileBuffer = await readFile(attachmentPath)

      if (originalDoc.user?.email) {
        const getBufferImage = () =>
          new Promise((res) =>
            QRCode.toBuffer(originalDoc.ticketCode, async (err, buffer) => {
              res(buffer)
            }),
          )

        const ticketCodeBuffer = await getBufferImage()
        const html = await generateTicketBookEmailHtml({
          ticketCode: originalDoc.ticketCode,
          eventName: originalDoc.event?.title || '',
        })

        await req.payload.sendEmail({
          to: originalDoc.user?.email,
          subject: 'Ticket Confirmation',
          html,
          attachDataUrls: true,
          attachments: [
            {
              content: fileBuffer,
              filename: 'eventTerms.doc',
              // contentType: 'application/msword',
            },
            {
              content: ticketCodeBuffer,
              filename: `${originalDoc.ticketCode}.png`,
              cid: 'qrcode',
            },
          ],
        })
      }
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }
  return value
}
