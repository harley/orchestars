import type { AffiliateRank, AffiliateUserRank, EventAffiliateRank } from '@/payload-types'
import { getPayload } from '@/payload-config/getPayloadConfig'

/**
 * Fetch the user's GLOBAL affiliate rank (AffiliateRank),
 * based on their AffiliateUserRank.currentRank.
 *
 * Returns matching Affiliate Rank and EventAffiliateRanks that has the same rank.
 */
export async function getGlobalRank(userId: number): Promise<{
  eventAffRankRecords: EventAffiliateRank[]
  globalRank: AffiliateRank | null
}> {
  //Initialize Payload
  const payload = await getPayload()

  // 1) Get the user's AffiliateUserRank
  const affiliateUserRank =
    (await payload
      .find({
        collection: 'affiliate-user-ranks',
        where: { affiliateUser: { equals: Number(userId) } },
        limit: 1,
        depth: 0,
      })
      .then((r) => r.docs?.[0])) || null

  if (!affiliateUserRank?.currentRank) {
    return { eventAffRankRecords: [], globalRank: null }
  }
  // 2) Get all event affiliate rank that has the same rank
  const eventAffRankRecords = await payload
    .find({
      collection: 'event-affiliate-ranks',
      where: {
        rankName: { equals: affiliateUserRank.currentRank },
      },
      depth: 0,
    })
    .then((res) => res.docs)

  // 2) Get the new AffiliateRank config whose rankName matches currentRank
  const globalRank =
    (await payload
      .find({
        collection: 'affiliate-ranks',
        where: { rankName: { equals: affiliateUserRank.currentRank } },
        limit: 1,
        depth: 0,
      })
      .then((r) => r.docs?.[0])) || null

  return { eventAffRankRecords, globalRank }
}
