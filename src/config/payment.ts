const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'

export const ZALO_PAYMENT = {
  APP_ID: process.env.ZALO_APPID || '2554',
  KEY1: process.env.ZALO_KEY1 || 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
  KEY2: process.env.ZALO_KEY2 || 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
  ENDPOINT: process.env.ZALO_API_URL || 'https://sb-openapi.zalopay.vn',
  REDIRECT_URL: `${APP_BASE_URL}/payment/result`,
  CALLBACK_URL: `${APP_BASE_URL}/api/zalopay/callback`,
}

export const VIET_QR = {
  X_CLIENT_ID: process.env.VIET_QR_X_CLIENT_ID || '',
  X_API_KEY: process.env.VIET_QR_X_API_KEY || '',
  ACCOUNT_NO: process.env.VIET_QR_ACCOUNT_NO || '',
  ACCOUNT_NAME: process.env.VIET_QR_ACCOUNT_NAME || '',
  BANK_NAME: process.env.VIET_QR_BANK_NAME || '',
  ACQ_ID: process.env.VIET_QR_ACQ_ID || '',
  TEMPLATE: process.env.VIET_QR_TEMPLATE || 'compact',
}
