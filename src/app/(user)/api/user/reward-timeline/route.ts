import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(user)/utils/authorizeApiRequest'

export async function GET(_req: NextRequest) {
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

    const rewardHistories = membershipHistories?.docs?.map((history) => {
      let amount = 0;
      if (history.order && typeof history.order === "object" && "total" in history.order) {
        amount = history.order.total as number;
      }

      const date = new Date(history.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const type = amount > 0 ? 'bonus' : 'purchase';

      return {
        id: history.id,
        description: history.description,
        date,
        pointsEarned: history.pointsChange,
        amount,
        type
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
    console.error('Error while fetching reward timeline:', error)
    return NextResponse.json(
      {
        message: 'Failed to fetch reward timeline',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
