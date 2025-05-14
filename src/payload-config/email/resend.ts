import { resendAdapter } from '@payloadcms/email-resend'
import { EMAIL_DEFAULT_FROM_ADDRESS, EMAIL_DEFAULT_FROM_NAME, RESEND } from '@/config/email'

export const getResendAdapter = () => {
  return resendAdapter({
    defaultFromAddress: EMAIL_DEFAULT_FROM_ADDRESS,
    defaultFromName: EMAIL_DEFAULT_FROM_NAME,
    apiKey: RESEND.API_KEY,
  })
}
