import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { VIET_QR } from '@/config/payment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const encryptKey = VIET_QR.ENCRYPT_KEY
    const to_decrypt_params = body.to_decrypt_params

    const decryptedBytes = CryptoJS.AES.decrypt(to_decrypt_params, encryptKey);
    const decrypted_result = decryptedBytes?.toString(CryptoJS.enc.Utf8);

    const params = new URLSearchParams(decrypted_result);
  
    // Extract individual fields
    const amount = params.get('amount');
    const addInfo = params.get('contentBankTransfer');
  
  
    // Validate amount is a number
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ message: 'Số tiền phải lớn hơn 0' }, { status: 400 })
    }

    let paymentDetails = {
      accountNo: VIET_QR.ACCOUNT_NO,
      accountName: VIET_QR.ACCOUNT_NAME,
      bankName: VIET_QR.BANK_NAME,
      acqId: VIET_QR.ACQ_ID,
      contentBankTransfer: addInfo,
      amount,
    }
    const response = await axios.post(
      'https://api.vietqr.io/v2/generate',
      {
        accountNo: VIET_QR.ACCOUNT_NO,
        accountName: VIET_QR.ACCOUNT_NAME,
        acqId: VIET_QR.ACQ_ID,
        addInfo,
        amount,
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
    paymentDetails = { ...paymentDetails, ...response.data.data };
    return NextResponse.json(paymentDetails, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
