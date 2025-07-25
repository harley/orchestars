import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(user)/utils/authorizeApiRequest'

export async function GET(_req: NextRequest) {
  try {
    // Verify the JWT token
    const userRequest = await authorizeApiRequest()
    const userId = userRequest.id
    const payload = await getPayload()

    const membershipPoint = await payload.find({
      collection: 'memberships',
      where: {
        user: {
          equals: userId,
        }
      }
    })

    const membershipRank = membershipPoint?.docs?.[0]?.membershipRank;

    const membershipRankLabel =
      typeof membershipRank === "object" && membershipRank !== null && "rankNameLabel" in membershipRank
        ? membershipRank.rankNameLabel
        : "Standard";

    const nextRank = await payload.find({
      collection: 'membership-rank-configs',
      where: {
        'condition.minPoints': {
          greater_than: membershipPoint?.docs?.[0]?.totalPoints || 0,
        }
      },
      sort: 'condition_min_points',
      limit: 1,
    })

    const nextRankLabel = 
      nextRank?.docs?.[0]?.rankNameLabel ||
      (typeof membershipRank === "object" && membershipRank !== null && "rankNameLabel" in membershipRank
        ? membershipRank.rankNameLabel
        : "Platinum");

    const pointsToNextRank =
      nextRank?.docs?.[0]?.condition?.minPoints ||
      (typeof membershipRank === "object" && membershipRank !== null && "condition" in membershipRank
        ? membershipRank.condition?.minPoints
        : 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          totalPoints: membershipPoint?.docs?.[0]?.totalPoints || 0,
          membershipRank: membershipRankLabel,
          nextRank: nextRankLabel,
          pointsToNextRank: pointsToNextRank,
        }
      },
      { status: 200 },
    )
  } catch (err) {
    const error = err as Error
    console.error('Error while fetching membership point:', error)
    return NextResponse.json(
      {
        message: 'Failed to fetch membership point',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
