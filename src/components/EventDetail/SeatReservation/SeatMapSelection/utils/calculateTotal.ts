import { Event, Promotion } from '@/payload-types'

type TicketSelected = Record<
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
