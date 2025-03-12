const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'

export const ZALO_PAYMENT = {
  APP_ID: process.env.ZALO_APPID || '2554',
  KEY1: process.env.ZALO_KEY1 || 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
  KEY2: process.env.ZALO_KEY2 || 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
  ENDPOINT: process.env.ZALO_API_URL || 'https://sb-openapi.zalopay.vn',
  REDIRECT_URL: `${APP_BASE_URL}/payment/result`,
  CALLBACK_URL: `${APP_BASE_URL}/api/zalopay/callback`,
}
