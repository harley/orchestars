// app/api/zalopay/createorder/route.ts
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import moment from 'moment'

export async function POST(request: NextRequest) {
  // parse JSON body if needed:
  // const body = await request.json() // if you expect a JSON body from the client
  const body = await request.json()
  const { app_user, app_time, item, embed_data, amount, bank_code } = body || {}
  if (!app_user || !app_time || !item || !embed_data || !amount || !bank_code) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
  }

  const config = {
    appid: process.env.ZALO_APPID || '2553',
    key1: process.env.ZALO_KEY1 || 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2: process.env.ZALO_KEY2 || 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
    endpoint:
      process.env.ZALO_ENDPOINT_CREATE || 'https://sb-openapi.zalopay.vn/v2/create',
  }

  const items = [{}]
  const transID = Math.floor(Math.random() * 1000000)

  const order = {
    app_id: config.appid,
    app_trans_id: moment().format('YYMMDD') + '_' + transID,
    app_user: 'user123',
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: 50000,
    bank_code: bank_code,
    description: `ZaloPayDemo - Payment for order #${transID}`,
  }

  const data = [
    order.app_id,
    order.app_trans_id,
    order.app_user,
    order.amount,
    order.app_time,
    order.embed_data,
    order.item,
  ].join('|')

  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString()

  try {
    const response = await axios.post(config.endpoint, null, {
      params: order,
    })

    return NextResponse.json(response.data, { status: 200 })
  } catch (error: any) {
    console.error('ZaloPay create order error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
