export type AffiliateUserStatus = 'pending' | 'approved' | 'rejected'

export const AFFILIATE_USER_STATUS: Record<AffiliateUserStatus, { label: string; value: AffiliateUserStatus }> = {
  pending: { label: 'Pending', value: 'pending' },
  approved: { label: 'Approved', value: 'approved' },
  rejected: { label: 'Rejected', value: 'rejected' },
}

export const AFFILIATE_USER_STATUSES = Object.values(AFFILIATE_USER_STATUS)

export type UserRole = 'affiliate' | 'user'

export const USER_ROLE: Record<UserRole, { label: string; value: UserRole }> = {
  affiliate: { label: 'Affiliate', value: 'affiliate' },
  user: { label: 'User', value: 'user' },
}

export const USER_ROLES = Object.values(USER_ROLE)
