import { NextRequest, NextResponse } from 'next/server'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'

// In-memory store
const notificationsByUser: Record<string, any[]> = {}

export async function POST(req: NextRequest) {
  try {
    const user = await authorizeApiRequest() // 🔐 authenticate affiliate user
    const userId = user.id

    const body = await req.json()
    const { eligibleEvents, eligibleRank } = body

    if (!Array.isArray(eligibleEvents) || !eligibleRank) {
      return NextResponse.json({ error: 'Missing eligibleEvents or eligibleRank' }, { status: 400 })
    }

    // Lưu thông báo
    notificationsByUser[userId] = [
      ...(notificationsByUser[userId] || []),
      {
        type: 'event-rank-upgrade',
        rank: eligibleRank,
        eligibleEvents,
        timestamp: Date.now(),
      },
    ]

    return NextResponse.json({ message: 'Notification saved' })
  } catch (err) {
    console.error('Error saving notification:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authorizeApiRequest() // 🔐 authenticate affiliate user
    const notifications = notificationsByUser[user.id] || []

    return NextResponse.json({ notifications })
  } catch (err) {
    console.error('Error fetching notifications:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
