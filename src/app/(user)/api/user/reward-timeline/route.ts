import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(user)/utils/authorizeApiRequest'

export async function GET(req: NextRequest) {
  try {
    // Verify the JWT token
    const userRequest = await authorizeApiRequest()
    const userId = userRequest.id
    const payload = await getPayload()

    const membershipHistories = await payload.find({
      collection: 'membership-histories',
      where: {
        user: {
          equals: userId,
        }
      }
    })

    console.log('Membership histories:', membershipHistories)

    const rewardHistories = membershipHistories?.docs?.map((history) => {
      let price = 0;
      if (history.order && typeof history.order === "object" && "total" in history.order) {
        price = history.order.total as number;
      }

      const date = new Date(history.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      let rewardType = price > 0 ? 'Bonus' : 'Purchase';

      return {
        description: history.description,
        date,
        points: history.pointsChange,
        price,
        rewardType
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: rewardHistories
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
