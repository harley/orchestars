import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticketCode, seatName, eventId, firstName, lastName, email } = body

    if (!ticketCode || !seatName || !eventId || !firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Compose the QR payload as a JSON string for security and extensibility
    const qrPayload = JSON.stringify({
      ticketCode,
      seatName,
      eventId,
      firstName,
      lastName,
      email,
    })

    // Generate QR code as a Data URL (PNG)
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H', // High error correction
      type: 'image/png',
      margin: 2,
      scale: 8,
    })

    return NextResponse.json({ qrDataUrl })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate QR code', details: error?.message }, { status: 500 })
  }
} 