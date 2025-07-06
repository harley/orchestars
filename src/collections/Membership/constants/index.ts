export type MembershipRank = 'Tier1' | 'Tier2' | 'Tier3' | 'Tier4'

export const MEMBERSHIP_RANK: Record<MembershipRank, { label: string; value: MembershipRank }> = {
    Tier1: { label: 'Standard', value: 'Tier1' },
    Tier2: { label: 'Silver', value: 'Tier2' },
    Tier3: { label: 'Gold', value: 'Tier3' },
    Tier4: { label: 'Platinum', value: 'Tier4' },
}

export const MEMBERSHIP_RANKS = Object.values(MEMBERSHIP_RANK)

// 

export const DEFAULT_GIFT_EXPIRES_IN = 365

export const MEMBERSHIP_RANK_EXPIRES_IN = 380