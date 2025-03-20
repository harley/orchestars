type UserPromotionRedemptionStatus = 'pending' | 'used' | 'cancelled'
export const USER_PROMOTION_REDEMPTION_STATUS: Record<
  UserPromotionRedemptionStatus,
  { label: string; value: UserPromotionRedemptionStatus }
> = {
  pending: {
    label: 'Pending', // user has been processing the order for payment
    value: 'pending',
  },
  used: {
    label: 'Used', // user has been succeed the payment
    value: 'used',
  },
  cancelled: {
    label: 'Cancelled', // user canceled order or the payment is expire
    value: 'cancelled',
  },
}

export const USER_PROMOTION_REDEMPTION_STATUSES = Object.values(USER_PROMOTION_REDEMPTION_STATUS)
