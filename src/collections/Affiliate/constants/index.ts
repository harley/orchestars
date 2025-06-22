export type AffiliateRank = 'seller' | 'fan' | 'ambassador' | 'patron'

export const AFFILIATE_RANK: Record<AffiliateRank, { label: string; value: AffiliateRank }> = {
  seller: { label: 'Seller', value: 'seller' },
  fan: { label: 'Fan', value: 'fan' },
  ambassador: { label: 'Ambassador', value: 'ambassador' },
  patron: { label: 'Patron', value: 'patron' },
}

export const AFFILIATE_RANKS = Object.values(AFFILIATE_RANK)


export const AFFILIATE_RANK_STATUS = {
  draft: { label: 'Draft', value: 'draft' },
  active: { label: 'Active', value: 'active' },
  disabled: { label: 'Disabled', value: 'disabled' },
}

export const AFFILIATE_RANK_STATUSES = Object.values(AFFILIATE_RANK_STATUS)
