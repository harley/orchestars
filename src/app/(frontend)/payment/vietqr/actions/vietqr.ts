import { VIET_QR } from '@/config/payment'
import axios from 'axios'
import CryptoJS from 'crypto-js'

export const generateQrPayment = async ({ transactionKey }: { transactionKey: string }) => {
  try {
    const encryptKey = VIET_QR.ENCRYPT_KEY

    const encryptedKey = Buffer.from(transactionKey, 'base64').toString('utf-8')

    let params: URLSearchParams
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedKey, encryptKey)
      const decrypted_result = decryptedBytes?.toString(CryptoJS.enc.Utf8)

      params = new URLSearchParams(decrypted_result)
    } catch (error) {
      console.error('error while decrypt key', error)
      return null
    }
    // Extract individual fields
    const amount = params.get('amount')
    const addInfo = params.get('contentBankTransfer')

    // Validate amount is a number
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      //   return NextResponse.json({ message: 'Số tiền phải lớn hơn 0' }, { status: 400 })

      return null
    }

    // todo handle this payment has completed or not

    const result = await axios
      .post(
        'https://api.vietqr.io/v2/generate',
        {
          accountNo: VIET_QR.ACCOUNT_NO,
          accountName: VIET_QR.ACCOUNT_NAME,
          acqId: VIET_QR.ACQ_ID,
          addInfo,
          amount: Number(amount).toFixed(0),
          template: VIET_QR.TEMPLATE,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': VIET_QR.X_CLIENT_ID,
            'x-api-key': VIET_QR.X_API_KEY,
          },
        },
      )
      .then((res) => res.data?.data || res.data)

    return {
      accountNo: VIET_QR.ACCOUNT_NO,
      accountName: VIET_QR.ACCOUNT_NAME,
      bankName: VIET_QR.BANK_NAME,
      acqId: VIET_QR.ACQ_ID,
      contentBankTransfer: addInfo,
      amount,
      ...(result || {}),
    }
  } catch (error) {
    console.error('error generateQrPayment', error)
    return null
  }
}
