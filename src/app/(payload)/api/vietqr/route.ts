import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { VIET_QR } from '@/config/payment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.addInfo || !body.amount) {
      return NextResponse.json(
        { message: 'Nội dung và số tiền không được để trống' },
        { status: 400 },
      )
    }

    // Validate amount is a number
    if (isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
      return NextResponse.json({ message: 'Số tiền phải lớn hơn 0' }, { status: 400 })
    }

    const response = await axios.post(
      'https://api.vietqr.io/v2/generate',
      {
        accountNo: VIET_QR.ACCOUNT_NO,
        accountName: VIET_QR.ACCOUNT_NAME,
        acqId: VIET_QR.ACQ_ID,
        addInfo: body.addInfo,
        amount: body.amount,
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

    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
