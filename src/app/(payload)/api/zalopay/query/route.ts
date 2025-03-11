import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import qs from 'qs'

// In production, store secrets in environment variables (.env)
// e.g. process.env.ZALO_APP_ID, process.env.ZALO_KEY1, etc.
const config = {
  app_id: process.env.ZALO_APP_ID || '2553',
  key1: process.env.ZALO_KEY1 || 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
  key2: process.env.ZALO_KEY2 || 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
  endpoint: `${process.env.ZALO_API_URL}/query` || 'https://sb-openapi.zalopay.vn/v2/query',
}

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    // The client should send { "app_trans_id": "..." }
    const body = await request.json()
    const { app_trans_id } = body

    if (!app_trans_id) {
      return NextResponse.json(
        { message: 'Missing app_trans_id' },
        { status: 400 }
      )
    }

    // Build the postData
    const postData = {
      app_id: config.app_id,
      app_trans_id, // from the request body
    }

    // Construct the HMAC input: app_id|app_trans_id|key1
    const data = `${postData.app_id}|${postData.app_trans_id}|${config.key1}`
    postData['mac'] = CryptoJS.HmacSHA256(data, config.key1).toString()

    // Make the POST request to ZaloPay
    const postConfig = {
      method: 'post',
      url: config.endpoint,
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
      { status: 500 }
    )
  }
}
