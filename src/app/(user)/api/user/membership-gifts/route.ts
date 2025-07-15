import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(user)/utils/authorizeApiRequest'
import { TICKET_ZONES } from '@/collections/Events/constants'

export async function GET(req: NextRequest) {
  try {
    // Verify the JWT token
    const userRequest = await authorizeApiRequest()
    const userId = userRequest.id
    const payload = await getPayload()

    const membershipGifts = await payload.find({
      collection: 'membership-gifts',
      where: {
        user: {
          equals: userId,
        }
      },
    })

    const res = membershipGifts?.docs?.map((gift) => {
      let expiresAt: string | null = null;
      if (gift.expiresAt) {
        expiresAt = new Date(gift.expiresAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }

      const label = TICKET_ZONES.find(zone => zone.value === gift.ticketGift)?.label || 'Unknown Zone';
      
      return {
        id: gift.id,
        label,
        type: gift.giftType,
        expiresAt
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: res
      },
      { status: 200 },
    )
  } catch (err) {
    const error = err as Error
    console.error('Error while fetching user tickets:', error)
    return NextResponse.json(
      {
        message: 'Failed to fetch tickets',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
