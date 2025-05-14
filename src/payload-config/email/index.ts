import { getResendAdapter } from './resend'
import { getNodemailerAdapter } from './nodemailer'
import { EMAIL_PROVIDER } from '@/config/email'

export const emailAdapter = () => {
  if (EMAIL_PROVIDER === 'NODEMAILER') {
    return getNodemailerAdapter()
  }

  return getResendAdapter()
}
