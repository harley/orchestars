// app/(payload)/api/zalopay/getbanks/route.ts
import { NextResponse } from 'next/server'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { ZALO_PAYMENT } from '@/config/payment'
export async function POST() {

  const reqtime = Date.now()
  const mac = CryptoJS.HmacSHA256(
    `${ZALO_PAYMENT.APP_ID}|${reqtime}`,
    ZALO_PAYMENT.KEY1
  ).toString()

  try {
    const response = await axios.post(
      ZALO_PAYMENT.ENDPOINT,
      new URLSearchParams({
        appid: ZALO_PAYMENT.APP_ID,
        reqtime: reqtime.toString(),
        mac,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
