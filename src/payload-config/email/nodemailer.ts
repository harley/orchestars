import { IS_LOCAL_DEVELOPMENT } from '@/config/app'
import { EMAIL_DEFAULT_FROM_ADDRESS, EMAIL_DEFAULT_FROM_NAME, NODEMAILER } from '@/config/email'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

export const getNodemailerAdapter = () => {
  if (IS_LOCAL_DEVELOPMENT) {
    return nodemailerAdapter({
      defaultFromAddress: EMAIL_DEFAULT_FROM_ADDRESS,
      defaultFromName: EMAIL_DEFAULT_FROM_NAME,
      transportOptions: {
        host: NODEMAILER.HOST,
        port: NODEMAILER.PORT,
      },
    })
  }

  return nodemailerAdapter({
    defaultFromAddress: EMAIL_DEFAULT_FROM_ADDRESS,
    defaultFromName: EMAIL_DEFAULT_FROM_NAME,
    // Nodemailer transportOptions
    transportOptions: {
      host: NODEMAILER.HOST,
      port: NODEMAILER.PORT,
      auth: {
        user: NODEMAILER.USER,
        pass: NODEMAILER.PASS,
      },
    },
  })
}
