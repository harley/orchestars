import type { AffiliateRank, AffiliateUserRank } from '@/payload-types'
import { getPayload } from '@/payload-config/getPayloadConfig'

/**
 * Fetch the user's GLOBAL affiliate rank (AffiliateRank),
 * based on their AffiliateUserRank.currentRank.
 *
 * Returns both the AffiliateUserRank doc and the matched AffiliateRank.
 */
export async function getGlobalRank(userId: number): Promise<{
  affiliateUserRank: AffiliateUserRank | null
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
    return { affiliateUserRank: null, globalRank: null }
  }

  // 2) Get the AffiliateRank config whose rankName matches currentRank
  const globalRank =
    (await payload
      .find({
        collection: 'affiliate-ranks',
        where: { rankName: { equals: affiliateUserRank.currentRank } },
        limit: 1,
        depth: 0,
      })
      .then((r) => r.docs?.[0])) || null

  return { affiliateUserRank, globalRank }
}
