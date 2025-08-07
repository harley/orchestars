import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { AFFILIATE_RANKS } from '@/collections/Affiliate/constants'
import {
  EventAffiliateUserRank,
  AffiliateUserRank,
  EventAffiliateRank,
  AffiliateRank,
} from '@/payload-types'

export async function GET(req: NextRequest) {
  try {
    //Authenticate user
    const userRequest = await authorizeApiRequest()
    const userID = userRequest.id

    //Initialize Payload
    const payload = await getPayload()

    // Fetch current affiliate user rank
    const affiliateUserRank = await payload
      .find({
        collection: 'affiliate-user-ranks',
        where: { affiliateUser: { equals: Number(userID) } },
        limit: 1,
        depth: 0,
      })
      .then((res) => res.docs?.[0] as AffiliateUserRank)

    if (!affiliateUserRank?.currentRank) {
      return NextResponse.json({ eligibleEvents: [] }) // No rank = no eligible upgrade
    }

    // Fetch event affiliate user ranks of this user
    const eventAffUserRanks = await payload
      .find({
        collection: 'event-affiliate-user-ranks',
        where: { affiliateUser: { equals: Number(userID) } },
        limit: 100,
        depth: 1,
      })
      .then((res) => res.docs as EventAffiliateUserRank[])

    // Fetch all affiliate rank configs
    const affiliateRankConfigs = await payload
      .find({
        collection: 'affiliate-ranks',
        where: {
          rankName: { in: AFFILIATE_RANKS.map((rank) => rank.value) },
        },
        limit: AFFILIATE_RANKS.length,
        depth: 0,
      })
      .then((res) => res.docs)

    // Get point value of current rank
    const globalRank = affiliateRankConfigs.find(
      (rank) => rank.rankName === affiliateUserRank.currentRank,
    )

    if (!globalRank) {
      return NextResponse.json({ eligibleEvents: [] }) // invalid config
    }
    // (Idea: Pass to AffiliateRank to get minPoint -> compare)
    // Compare and filter events that can be upgraded
    const eligibleEvents = eventAffUserRanks
      .filter((eventRank) => {
        const eventAffRank = eventRank.eventAffiliateRank
        // typeof eventRank.event === 'object' ? eventRank.event.id : eventRank.event,
        if (typeof eventAffRank === 'number') return false
        const currentEventRank = affiliateRankConfigs.find(
          (rank) => rank.rankName === eventAffRank.rankName,
        )

        if (!currentEventRank) return false

        return globalRank.minPoints > currentEventRank.minPoints
      })
      .map((eventRank) => {
        const eventAffRank = eventRank.eventAffiliateRank as EventAffiliateRank

        return {
          eventId: typeof eventRank.event === 'object' ? eventRank.event.id : eventRank.event,
          oldRank: eventAffRank,
        }
      })
    return NextResponse.json({ eligibleEvents, globalRank })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Error getting events eligible for upgrade' },
      { status: 500 },
    )
  }
}
// POST Request:
// Nhận event ID
// Query event aff user rank gắn với event ID đó
// -> update existing record status = completed
// -> tạo 1 record mới với hạng mới eligible (status active)

type RankUpdateRequestBody = {
  eventID: number
  newRank: AffiliateRank
}
export async function POST(req: NextRequest) {
  try {
    //Authenticate user
    const userRequest = await authorizeApiRequest()
    const userID = userRequest.id

    //Initialize Payload
    const payload = await getPayload()
    const body = (await req.json()) as RankUpdateRequestBody //parse the json

    //For event ID, query the event aff user rank related to that ID
    const rankToUpdate = await payload
      .find({
        collection: 'event-affiliate-user-ranks',
        where: { event: { equals: body.eventID }, affiliateUser: { equals: userID } }, //Since event is a relationship field in event-affiliate-user-ranks, it’s stored as a string or number (the ID of the related event)
        limit: 1,
        depth: 1,
      })
      .then((res) => res.docs?.[0] as EventAffiliateUserRank)

    if (!rankToUpdate) {
      return NextResponse.json({ error: 'Rank not found' }, { status: 404 })
    }
    //Update existing record status = completed
    await payload.update({
      collection: 'event-affiliate-user-ranks',
      id: rankToUpdate.id,
      data: {
        status: 'completed',
      },
    })
    const newRecordData = {
      event: rankToUpdate.event, // reuse event ID
      affiliateUser: rankToUpdate.affiliateUser,
      eventAffiliateRank: body.newRank.id, // updated rank
      status: 'active' as const,
      isLocked: false,
      totalPoints: 0,
      totalRevenue: 0,
      totalRevenueAfterTax: 0,
      totalRevenueBeforeTax: 0,
      totalRevenueBeforeDiscount: 0,
      totalTicketsSold: 0,
      totalCommissionEarned: 0,
      totalTicketsRewarded: 0,
      lastActivityDate: new Date().toISOString(),
    }

    await payload.create({
      collection: 'event-affiliate-user-ranks',
      data: newRecordData,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error updating event affiliate rank' }, { status: 500 })
  }
}
