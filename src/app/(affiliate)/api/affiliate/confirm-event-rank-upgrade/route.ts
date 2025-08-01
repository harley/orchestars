import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'

export async function POST(req: NextRequest) {
  try {
    const user = await authorizeApiRequest()
    const body = await req.json()
    const { eventIds, newRank } = body

    if (!Array.isArray(eventIds) || !newRank) {
      return NextResponse.json({ error: 'Missing eventIds or newRank' }, { status: 400 })
    }

    // Disable record cũ và tạo record mới cho từng event
    for (const eventId of eventIds) {
      await payload.update({
        collection: 'event-affiliate-user-ranks',
        where: {
          affiliateUser: { equals: user.id },
          event: { equals: eventId },
        },
        data: {
          status: 'disabled',
        },
      })
      await payload.create({
        collection: 'event-affiliate-user-ranks',
        data: {
          affiliateUser: user.id,
          event: eventId,
          eventAffiliateRank: newRank,
          status: 'active',
          totalPoints: 0,
          totalRevenue: 0,
          totalRevenueBeforeTax: 0,
          totalRevenueAfterTax: 0,
          totalRevenueBeforeDiscount: 0,
          totalTicketsSold: 0,
          totalCommissionEarned: 0,
          totalTicketsRewarded: 0,
          lastActivityDate: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error confirming event rank upgrade:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
