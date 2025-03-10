// app/(payload)/api/zalopay/getbanks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import CryptoJS from 'crypto-js'

export async function POST(request: NextRequest) {
  const config = {
    appid: process.env.ZALO_APPID || '2553',
    key1: process.env.ZALO_KEY1 || 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    endpoint:
      process.env.ZALO_ENDPOINT ||
      'https://sbgateway.zalopay.vn/api/getlistmerchantbanks',
  }

  const reqtime = Date.now()
  const mac = CryptoJS.HmacSHA256(
    `${config.appid}|${reqtime}`,
    config.key1
  ).toString()

  try {
    const response = await axios.post(
      config.endpoint,
      new URLSearchParams({
        appid: config.appid,
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
