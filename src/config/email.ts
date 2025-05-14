export const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER as 'RESEND' | 'NODEMAILER') || 'RESEND'
export const EMAIL_DEFAULT_FROM_ADDRESS = process.env.EMAIL_DEFAULT_FROM_ADDRESS || 'info@orchestars.vn'  
export const EMAIL_DEFAULT_FROM_NAME = process.env.EMAIL_DEFAULT_FROM_NAME || 'Orchestars' 

export const NODEMAILER = {
  HOST: process.env.SMTP_HOST,
  PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  USER: process.env.SMTP_USER,
  PASS: process.env.SMTP_PASS,
}

export const RESEND = {
  API_KEY: process.env.RESEND_API_KEY || '',
}
