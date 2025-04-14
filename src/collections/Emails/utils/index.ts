import { Email } from '@/payload-types'
import { BasePayload } from 'payload'

export const sendMailAndWriteLog = async ({
  resendMailData,
  emailData,
  payload,
}: {
  resendMailData: {
    to: string
    cc: string
    subject: string
    html: string
  }
  emailData: Partial<Email>
  payload: BasePayload
}) => {
  const resendResult = await sendMail({ payload, mailData: resendMailData })

  if (resendResult) {
    createEmailRecord({
      data: {
        ...resendMailData,
        ...emailData,
        extraData: resendResult as Record<string, any>,
        sentAt: new Date().toISOString(),
      },
      payload,
    })
  }
}

const sendMail = async ({
  payload,
  mailData,
}: {
  payload: BasePayload
  mailData: { to?: string; cc?: string; subject?: string; html: string }
}) => {
  try {
    return await payload.sendEmail(mailData)
  } catch (error) {
    console.error('Error while sending mail: ', error)
  }
}

const createEmailRecord = async ({
  data,
  payload,
}: {
  payload: BasePayload
  data: Partial<Email>
}) => {
  try {
    return payload.create({
      collection: 'emails',
      data: data as any,
    })
  } catch (error) {
    console.error('Error while writing email history log', error)
  }
}
