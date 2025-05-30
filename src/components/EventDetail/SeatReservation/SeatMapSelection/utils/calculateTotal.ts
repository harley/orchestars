import { Event, Promotion } from '@/payload-types'

export type TicketSelected = Record<
  string,
  {
    id: string
    ticketName: string
    seats: string[]
    total: number
    quantity: number
    currency?: string
  }
>

export const calculateTotalOrder = (
  promotionInfo: Promotion | null,
  ticketSelected: TicketSelected,
  event: Event,
) => {
  if (!promotionInfo) {
    return calculateTotalAmount(ticketSelected)
  }

  const appliedTicketClasses = promotionInfo?.appliedTicketClasses || []
  let totalAmountThatAppliedDiscount = 0
  let totalAmountNotThatAppliedDiscount = 0

  const totalQuantityAppliedTicketClasses = calculateTotalQuantity(
    ticketSelected,
    event,
    appliedTicketClasses,
  )
  const canApplyPromoCode = canApplyPromotion(promotionInfo, totalQuantityAppliedTicketClasses)
  if (canApplyPromoCode) {
    if (promotionInfo.discountApplyScope === 'per_order_item') {
      const {
        amountBeforeDiscount,
        totalAmountNotThatAppliedDiscount,
        totalAmountThatAppliedDiscount,
      } = calculateDiscountedAmountsPerOrderItem(
        ticketSelected,
        appliedTicketClasses,
        promotionInfo,
      )

      return {
        amountBeforeDiscount,
        amount: totalAmountThatAppliedDiscount + totalAmountNotThatAppliedDiscount,
        canApplyPromoCode: true,
      }
    }
    ;({ totalAmountThatAppliedDiscount, totalAmountNotThatAppliedDiscount } =
      calculateDiscountedAmounts(ticketSelected, appliedTicketClasses))
    const amountBeforeDiscount = totalAmountThatAppliedDiscount + totalAmountNotThatAppliedDiscount
    totalAmountThatAppliedDiscount = applyDiscount(promotionInfo, totalAmountThatAppliedDiscount)

    return {
      amountBeforeDiscount,
      amount: totalAmountThatAppliedDiscount + totalAmountNotThatAppliedDiscount,
      canApplyPromoCode: true,
    }
  }

  return calculateTotalAmount(ticketSelected)
}

export const isAppliedPromotion = (
  promotionInfo: Promotion,
  ticketSelected: TicketSelected,
  event: Event,
) => {
  const appliedTicketClasses = promotionInfo?.appliedTicketClasses || []
  const totalQuantityAppliedTicketClasses = calculateTotalQuantity(
    ticketSelected,
    event,
    appliedTicketClasses,
  )
  return canApplyPromotion(promotionInfo, totalQuantityAppliedTicketClasses)
}

export function calculateTotalAmount(ticketSelected: TicketSelected) {
  const amount = Object.values(ticketSelected).reduce((sum, tk) => sum + tk.total, 0) || 0
  return { amountBeforeDiscount: amount, amount, canApplyPromoCode: false }
}

export function calculateTotalQuantity(
  ticketSelected: TicketSelected,
  event: Event,
  appliedTicketClasses: NonNullable<Promotion['appliedTicketClasses']>,
) {
  return Object.values(ticketSelected).reduce((totalQuantity, ticketPriceSelected) => {
    const ticketPriceInfo = event?.ticketPrices?.find(
      (ticketPrice) => ticketPrice.id === ticketPriceSelected.id,
    )
    const appliedForTicket = isTicketApplied(appliedTicketClasses, ticketPriceInfo?.name as string)
    return appliedForTicket ? totalQuantity + ticketPriceSelected.quantity : totalQuantity
  }, 0)
}

export function canApplyPromotion(
  promotionInfo: Promotion,
  totalQuantityAppliedTicketClasses: number,
) {
  const applyWithCondition =
    promotionInfo.conditions?.isApplyCondition &&
    !!promotionInfo.conditions?.minTickets &&
    totalQuantityAppliedTicketClasses >= promotionInfo.conditions?.minTickets

  return !promotionInfo.conditions?.isApplyCondition || applyWithCondition
}

export function calculateDiscountedAmounts(
  ticketSelected: TicketSelected,
  appliedTicketClasses: NonNullable<Promotion['appliedTicketClasses']>,
) {
  let totalAmountThatAppliedDiscount = 0
  let totalAmountNotThatAppliedDiscount = 0

  for (const tk of Object.values(ticketSelected)) {
    const appliedForTicket = isTicketApplied(appliedTicketClasses, tk?.ticketName)
    if (appliedForTicket) {
      totalAmountThatAppliedDiscount += tk.total
    } else {
      totalAmountNotThatAppliedDiscount += tk.total
    }
  }

  return { totalAmountThatAppliedDiscount, totalAmountNotThatAppliedDiscount }
}

export function calculateDiscountedAmountsPerOrderItem(
  ticketSelected: TicketSelected,
  appliedTicketClasses: NonNullable<Promotion['appliedTicketClasses']>,
  promotionInfo: Promotion,
) {
  let totalAmountThatAppliedDiscount = 0
  let totalAmountNotThatAppliedDiscount = 0
  let amountBeforeDiscount = 0

  for (const tk of Object.values(ticketSelected)) {
    const appliedForTicket = isTicketApplied(appliedTicketClasses, tk?.ticketName)
    let totalValueOrderItem = tk.total
    amountBeforeDiscount += totalValueOrderItem
    if (appliedForTicket) {
      if (promotionInfo.discountType === 'percentage') {
        totalValueOrderItem -= (totalValueOrderItem * promotionInfo.discountValue) / 100
      } else if (promotionInfo.discountType === 'fixed_amount') {
        const discount = (tk.seats.length || 1) * promotionInfo.discountValue
        totalValueOrderItem = totalValueOrderItem - discount
      }

      totalAmountThatAppliedDiscount += totalValueOrderItem
    } else {
      totalAmountNotThatAppliedDiscount += totalValueOrderItem
    }
  }

  return { amountBeforeDiscount, totalAmountThatAppliedDiscount, totalAmountNotThatAppliedDiscount }
}

export function applyDiscount(promotionInfo: Promotion, totalAmountThatAppliedDiscount: number) {
  if (promotionInfo.discountType === 'percentage') {
    return totalAmountThatAppliedDiscount * (1 - promotionInfo.discountValue / 100)
  } else if (promotionInfo.discountType === 'fixed_amount') {
    return Math.max(0, totalAmountThatAppliedDiscount - promotionInfo.discountValue)
  }
  return totalAmountThatAppliedDiscount
}

function isTicketApplied(
  appliedTicketClasses: NonNullable<Promotion['appliedTicketClasses']>,
  ticketName: string,
) {
  return (
    appliedTicketClasses.length === 0 ||
    appliedTicketClasses.some((applied) => applied.ticketClass === ticketName)
  )
}

export const calculateMultiPromotionsTotalOrder = (
  promotions: Promotion[],
  ticketSelected: TicketSelected,
  event: Event,
) => {
  if (!promotions?.length) {
    return calculateTotalOrder(null, ticketSelected, event)
  }
  let amountBeforeDiscount = 0
  let amount = 0
  let canApplyPromoCode = false
  let totalDiscount = 0

  for (const promotion of promotions) {
    const {
      amountBeforeDiscount: amountBeforeDiscountPromo,
      amount: amountPromo,
      canApplyPromoCode: canApplyPromoCodePromo,
    } = calculateTotalOrder(promotion, ticketSelected, event)
    amountBeforeDiscount = amountBeforeDiscount || amountBeforeDiscountPromo
    totalDiscount += amountBeforeDiscountPromo - amountPromo
    canApplyPromoCode = canApplyPromoCode || canApplyPromoCodePromo
  }

  amount = amountBeforeDiscount - totalDiscount

  return { amountBeforeDiscount, amount, canApplyPromoCode }
}
