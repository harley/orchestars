import { FieldHookArgs } from 'payload'
import {
  AffiliateRank,
  AffiliateUserRank as AffiliateUserRankType,
  EventAffiliateRank,
  EventAffiliateUserRank,
} from '@/payload-types'
import { AFFILIATE_RANK } from '../constants'

export const createEventAffiliateRankIfNotExists = async ({
  eventId,
  affiliateUserId,
  eventAffiliateUserRank,
  affiliateRanks,
  req,
}: {
  eventId: number
  affiliateUserId: number
  eventAffiliateUserRank?: EventAffiliateUserRank
  affiliateRanks: AffiliateRank[]
  req: FieldHookArgs['req']
}) => {
  // if eventAffiliateUserRank is not set, get default rank of user
  let eventAffiliateRank: EventAffiliateRank | null =
    eventAffiliateUserRank?.eventAffiliateRank as EventAffiliateRank | null

  let affiliateUserRank: AffiliateUserRankType | undefined = undefined

  if (!eventAffiliateRank) {
    // 1. Fetch the user's currentRank from affiliate-user-ranks
    affiliateUserRank = await req.payload
      .find({
        collection: 'affiliate-user-ranks',
        where: {
          affiliateUser: { equals: affiliateUserId },
        },
        limit: 1,
        depth: 0,
      })
      .then((res) => res.docs?.[0])

    // 2. Use currentRank to get the EventAffiliateRank for this event
    const userCurrentRank = affiliateUserRank?.currentRank || AFFILIATE_RANK.Tier1.value
    eventAffiliateRank = await req.payload
      .find({
        collection: 'event-affiliate-ranks',
        where: {
          event: { equals: eventId },
          rankName: { equals: userCurrentRank },
          status: { equals: 'active' },
        },
        limit: 1,
        depth: 0,
      })
      .then((res) => res.docs?.[0] || null)

    if (!eventAffiliateRank) {
      // create event affiliate rank based on the affiliate user rank
      eventAffiliateRank = await req.payload.create({
        collection: 'event-affiliate-ranks',
        data: {
          event: eventId as number,
          rankName: userCurrentRank,
          status: 'active',
          eventRewards: affiliateRanks.find((rank) => rank.rankName === userCurrentRank)?.rewards,
        },
      })
    }
  }

  return eventAffiliateRank
}
