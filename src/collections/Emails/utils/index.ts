import { IS_LOCAL_DEVELOPMENT } from '@/config/app'
import { Email } from '@/payload-types'
import { BasePayload } from 'payload'
import { EMAIL_PROVIDER } from '@/config/email'
import { logError } from '@/collections/Logs/utils'

export const sendMailAndWriteLog = async ({
  resendMailData,
  emailData,
  payload,
}: {
  resendMailData: {
    to: string
    cc?: string
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
    if (IS_LOCAL_DEVELOPMENT && EMAIL_PROVIDER === 'RESEND') {
      return { id: `mock-id-${Math.random()}` }
    }
    return await payload.sendEmail(mailData)
  } catch (error: any) {
    console.error('Error while sending mail: ', error)

    logError({
      payload,
      action: 'SEND_MAIL_ERROR',
      description: `Error sending mail: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
      data: {
        error: {
          error,
          stack: error?.stack,
          errorMessage:
            error instanceof Error ? error.message : error || 'An unknown error occurred',
        },
        data: mailData,
      },
    })
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
  } catch (error: any) {
    console.error('Error while writing email history log', error)

    logError({
      payload,
      action: 'SAVE_MAIL_ERROR',
      description: `Error saving mail: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
      data: {
        error: {
          error,
          stack: error?.stack,
          errorMessage:
            error instanceof Error ? error.message : error || 'An unknown error occurred',
        },
        data: data,
      },
    })
  }
}
