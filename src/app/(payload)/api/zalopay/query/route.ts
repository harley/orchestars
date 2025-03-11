import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import qs from 'qs'
import { ZALO_PAYMENT } from '@/config/payment'

// In production, store secrets in environment variables (.env)
// e.g. process.env.ZALO_APP_ID, process.env.ZALO_KEY1, etc.

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    // The client should send { "app_trans_id": "..." }
    const body = await request.json()
    const { app_trans_id } = body

    if (!app_trans_id) {
      return NextResponse.json({ message: 'Missing app_trans_id' }, { status: 400 })
    }

    // Build the postData
    const postData = {
      app_id: ZALO_PAYMENT.APP_ID,
      app_trans_id, // from the request body
      mac: '',
    }

    // Construct the HMAC input: app_id|app_trans_id|key1
    const data = `${postData.app_id}|${postData.app_trans_id}|${ZALO_PAYMENT.KEY1}`
    postData['mac'] = CryptoJS.HmacSHA256(data, ZALO_PAYMENT.KEY1).toString()

    // Make the POST request to ZaloPay
    const postConfig = {
      method: 'post',
      url: ZALO_PAYMENT.ENDPOINT,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify(postData),
    }

    const response = await axios(postConfig)
    return NextResponse.json(response.data, { status: 200 })
  } catch (error: any) {
    console.error('ZaloPay query error:', error)
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 },
    )
  }
}
