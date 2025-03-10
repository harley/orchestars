import { NextRequest, NextResponse } from 'next/server'
import CryptoJS from 'crypto-js'

const config = {
  key2: process.env.ZALO_KEY2 || 'eG4r0GcoNtRGbO8',
}

export async function POST(request: NextRequest) {
  const result: Record<string, any> = {}

  try {
    const body = await request.json()
    const dataStr = body.data
    const reqMac = body.mac

    const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString()
    console.log('Computed mac =', mac)

    if (reqMac !== mac) {
      result.return_code = -1
      result.return_message = 'mac not equal'
    } else {
      const dataJson = JSON.parse(dataStr)
      console.log(
        'Update order status = success where app_trans_id =',
        dataJson['app_trans_id']
      )
      result.return_code = 1
      result.return_message = 'success'
    }
  } catch (ex: any) {
    result.return_code = 0
    result.return_message = ex.message
  }

  return NextResponse.json(result)
}
