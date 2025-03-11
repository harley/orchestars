export const ZALO_PAYMENT = {
  APP_ID: process.env.ZALO_APPID || '2554',
  KEY1: process.env.ZALO_KEY1 || 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
  KEY2: process.env.ZALO_KEY2 || 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
  ENDPOINT: process.env.ZALO_API_URL || 'https://sb-openapi.zalopay.vn',
  REDIRECT_URL: `${process.env.APP_BASE_URL}/payment/result`|| 'http://localhost:3000/payment/result',
  CALLBACK_URL:
  `${process.env.APP_BASE_URL}/api/zalopay/callback`||
    'https://65ae-14-191-175-74.ngrok-free.app/api/zalopay/callback',
}
