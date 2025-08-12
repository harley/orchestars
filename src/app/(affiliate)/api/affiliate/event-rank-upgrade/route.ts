import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { AFFILIATE_RANKS } from '@/collections/Affiliate/constants'
import {
  EventAffiliateUserRank,
  AffiliateUserRank,
  EventAffiliateRank,
  AffiliateRank,
  Event,
} from '@/payload-types'
import { getGlobalRank } from '@/app/(affiliate)/utils/getGlobalRank'

export async function GET(req: NextRequest) {
  try {
    //Authenticate user
    const userRequest = await authorizeApiRequest()
    const userID = userRequest.id

    //Initialize Payload
    const payload = await getPayload()

    // Fetch event affiliate user ranks of this user
    const eventAffUserRanks = await payload
      .find({
        collection: 'event-affiliate-user-ranks',
        where: { affiliateUser: { equals: Number(userID) }, status: { equals: 'active' } },
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

    // Fetch global (to be updated to) Affiliate Rank and EventAffiliateRanks that has the same rank
    const { eventAffRankRecords, globalRank } = await getGlobalRank(Number(userID))

    if (!globalRank) {
      return NextResponse.json({ eligibleEvents: [] })
    }

    //  Filter events that can be upgraded (Pass to AffiliateRank to get minPoint -> Compare)
    const filtered = eventAffUserRanks.filter((eventRank) => {
      const eventAffRank = eventRank.eventAffiliateRank
      if (typeof eventAffRank === 'number') return false

      const currentEventRank = affiliateRankConfigs.find(
        (rank) => rank.rankName === eventAffRank.rankName,
      )
      if (!currentEventRank) return false

      return globalRank.minPoints > currentEventRank.minPoints
    })

    const eligibleEvents = await Promise.all(
      filtered.map(async (eventRank) => {
        // get current event aff rank
        const eventAffRank = eventRank.eventAffiliateRank as EventAffiliateRank

        // get current affiliate rank
        const affRank = await payload
          .find({
            collection: 'affiliate-ranks',
            where: { rankName: { equals: eventAffRank.rankName } },
          })
          .then((res) => res.docs?.[0] as AffiliateRank)

        // normalize eventId (relationship can be number|string or a populated object)
        const eventId =
          typeof eventRank.event === 'object' && eventRank.event !== null
            ? (eventRank.event as any).id
            : eventRank.event

        // get event aff rank (to be updated to)
        const newEventAffRank = eventAffRankRecords.find((rank) => eventId === rank.event)
        if (!newEventAffRank) {
          throw new Error('Event Affiliate Rank missing. Please contact admin.')
        }

        // normalize event title
        let eventTitle: string | undefined =
          typeof eventRank.event === 'object' && eventRank.event !== null
            ? (eventRank.event as any).title
            : undefined

        if (!eventTitle) {
          try {
            const eventDoc = await payload.findByID({
              collection: 'events',
              id: eventId,
              depth: 0,
            })
            eventTitle = (eventDoc as any)?.title ?? `Sự kiện #${eventId}`
          } catch {
            eventTitle = `Sự kiện #${eventId}`
          }
        }
        return {
          eventId,
          eventTitle,
          oldRank: eventAffRank,
          oldRankGlobal: affRank,
          newEventAffRank,
        }
      }),
    )
    return NextResponse.json({ eligibleEvents, globalRank })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Error getting events eligible for upgrade' },
      { status: 500 },
    )
  }
}
type RankUpdateRequestBody = {
  eventID: number
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
        where: {
          event: { equals: body.eventID },
          affiliateUser: { equals: userID },
          status: { equals: 'active' },
        }, //Since event is a relationship field in event-affiliate-user-ranks, it’s stored as a string or number (the ID of the related event)
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
    const { eventAffRankRecords, globalRank } = await getGlobalRank(Number(userID))

    // For event ID, find the event aff rank related
    const eventAffRanks = await payload
      .find({
        collection: 'event-affiliate-ranks',
        where: { event: { equals: body.eventID }, rankName: { equals: globalRank?.rankName } },
      })
      .then((res) => res.docs?.[0] as EventAffiliateRank)
    if (!eventAffRanks) {
      return NextResponse.json(
        { error: 'Event affiliate rank is not configured. Please contact an admin for support' },
        { status: 404 },
      )
    }
    const newRecordData = {
      event: body.eventID, // event ID
      affiliateUser: userID, // affiliate user ID
      eventAffiliateRank: eventAffRanks.id, // Existing event affiliate rank
      status: 'active' as const,
      isLocked: true,
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

    // Validate required fields
    // if (!newRecordData.event || !newRecordData.affiliateUser || !newRecordData.eventAffiliateRank) {
    //   throw new Error('Missing required fields: event, affiliateUser, or eventAffiliateRank')
    // }

    await payload.create({
      collection: 'event-affiliate-user-ranks',
      data: newRecordData as any,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error updating event affiliate rank' }, { status: 500 })
  }
}
