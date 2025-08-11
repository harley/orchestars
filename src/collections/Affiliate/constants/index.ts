// add explain the tier by description for all tiers, smallest tier 1
// Tier 1: suitable for beginners or new users with basic access and minimal benefits.
// Tier 2: for users with moderate engagement or performance, offering more perks.
// Tier 3: a high-performing tier with premium features or rewards.
// Tier 4: the top tier with exclusive access, maximum benefits, and recognition.

export type AffiliateRank = 'Tier1' | 'Tier2' | 'Tier3' | 'Tier4'

export const AFFILIATE_RANK: Record<AffiliateRank, { label: string; value: AffiliateRank }> = {
  Tier1: { label: 'Friend', value: 'Tier1' },
  Tier2: { label: 'Fan', value: 'Tier2' },
  Tier3: { label: 'Ambassador', value: 'Tier3' },
  Tier4: { label: 'Champion', value: 'Tier4' },
}

export const AFFILIATE_RANKS = Object.values(AFFILIATE_RANK)

export const AFFILIATE_RANK_STATUS = {
  draft: { label: 'Draft', value: 'draft' },
  active: { label: 'Active', value: 'active' },
  disabled: { label: 'Disabled', value: 'disabled' },
}

export const AFFILIATE_RANK_STATUSES = Object.values(AFFILIATE_RANK_STATUS)

export const EVENT_AFFILIATE_RANK_STATUS = {
  draft: { label: 'Draft', value: 'draft' },
  active: { label: 'Active', value: 'active' },
  disabled: { label: 'Disabled', value: 'disabled' },
  completed: { label: 'Completed', value: 'completed' },
}

export const EVENT_AFFILIATE_RANK_STATUSES = Object.values(EVENT_AFFILIATE_RANK_STATUS)
