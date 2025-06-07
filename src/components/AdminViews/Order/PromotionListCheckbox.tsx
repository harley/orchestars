import React from 'react'
import { Ticket } from 'lucide-react'
import { Event, Promotion } from '@/payload-types'
import { formatMoney } from '@/utilities/formatMoney'
import {
  isAppliedPromotion,
  TicketSelected,
} from '@/components/EventDetail/SeatReservation/SeatMapSelection/utils/calculateTotal'
import styles from './PromotionListCheckbox.module.css'
import { CheckboxInput } from '@payloadcms/ui'

interface PromotionListCheckboxProps {
  promotions: Promotion[]
  selectedPromotions: Promotion[]
  onSelectPromotions: (promotions: Promotion[]) => void
  isAllowApplyMultiplePromotions?: boolean
  maxAppliedPromotions?: number
  ticketSelected: TicketSelected
  event: Event
}

const PromotionListCheckbox: React.FC<PromotionListCheckboxProps> = ({
  promotions,
  selectedPromotions,
  onSelectPromotions,
  isAllowApplyMultiplePromotions = false,
  maxAppliedPromotions = 1,
  ticketSelected,
  event,
}) => {
  const handlePromotionChange = (promotion: Promotion, checked: boolean) => {
    if (!isAllowApplyMultiplePromotions) {
      // Single selection mode
      onSelectPromotions(checked ? [promotion] : [])
      return
    }

    // Multiple selection mode
    if (checked) {
      // Don't add if we've reached the max limit
      if (selectedPromotions.length >= maxAppliedPromotions) {
        return
      }
      onSelectPromotions([...selectedPromotions, promotion])
    } else {
      onSelectPromotions(selectedPromotions.filter((p) => p.id !== promotion.id))
    }
  }

  const isMatchedCondition = (promotion: Promotion) => {
    return !!isAppliedPromotion(promotion, ticketSelected, event)
  }

  return promotions.length > 0 ? (
    <div className={styles.container}>
      <div className={styles.header}>
        <Ticket className={styles.icon} />
        <h3 className={styles.title}>Available Promotions</h3>
        <span className={styles.maxPromotions}>Max promotions: {maxAppliedPromotions}</span>
      </div>

      <div className={styles.promotionList}> 
        {promotions.map((promotion) => {
          const isDisabled =
            !isMatchedCondition(promotion) ||
            (selectedPromotions.length >= maxAppliedPromotions &&
              !selectedPromotions.find((p) => p.id === promotion.id))
          return (
            <div
              key={promotion.id}
              className={styles.promotionItem + (isDisabled ? ' ' + styles.disabled : '')}
            >
              <CheckboxInput
                id={`promo-${promotion.id}`}
                checked={selectedPromotions.some((p) => p.id === promotion.id)}
                onToggle={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (isDisabled) return
                  handlePromotionChange(promotion, e.target.checked)
                }}
                className={styles.checkbox}
              />
              <div className="grid gap-1">
                <label htmlFor={`promo-${promotion.id}`} className={styles.label}>
                  {promotion.code}
                </label>
                <p className={styles.discountInfo}>
                  {promotion.discountType === 'percentage'
                    ? `${promotion.discountValue}% off`
                    : `${formatMoney(promotion.discountValue, 'VND')} off`}
                  {promotion.discountApplyScope === 'total_order_value' &&
                    ' (Discount on total order value)'}
                  {promotion.discountApplyScope === 'per_order_item' &&
                    ' (Discount on per order item)'}
                </p>
                {promotion.conditions?.minTickets && (
                  <p className={styles.conditionText}>
                    Requires minimum tickets: {promotion.conditions.minTickets}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  ) : (
    <div className={styles.container}>
      <div className={styles.header}>
        <Ticket className={styles.icon} />
        <h3 className={styles.title}>No Available Promotions</h3>
      </div>
    </div>
  )
}

export default PromotionListCheckbox
