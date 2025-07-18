export const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER as 'RESEND' | 'NODEMAILER') || 'RESEND'
export const EMAIL_DEFAULT_FROM_ADDRESS =
  process.env.EMAIL_DEFAULT_FROM_ADDRESS || 'info@orchestars.vn'
export const EMAIL_DEFAULT_FROM_NAME = process.env.EMAIL_DEFAULT_FROM_NAME || 'Orchestars'
export const EMAIL_CC = process.env.EMAIL_CC || ''
export const EMAIL_ADMIN_CC = process.env.EMAIL_ADMIN_CC || ''
export const EMAIL_QR_EVENT_GUIDELINE_URL =
  process.env.EMAIL_QR_EVENT_GUIDELINE_URL ||
  'https://orchestars.vn/check-in-process-rules-at-event-disney-25'
export const EMAIL_QR_EVENT_MAP_STAGE =
  process.env.EMAIL_QR_EVENT_MAP_STAGE ||
  'https://www.orchestars.vn/api/media/file/disney-25-map-stage.png'

export const NODEMAILER = {
  HOST: process.env.SMTP_HOST,
  PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  USER: process.env.SMTP_USER,
  PASS: process.env.SMTP_PASS,
}

export const RESEND = {
  API_KEY: process.env.RESEND_API_KEY || '',
}
