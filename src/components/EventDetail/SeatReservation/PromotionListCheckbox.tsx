import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Ticket } from 'lucide-react'
import { Event, Promotion } from '@/payload-types'
import { useTranslate } from '@/providers/I18n/client'
import { formatMoney } from '@/utilities/formatMoney'
import { cn } from '@/lib/utils'
import { isAppliedPromotion, TicketSelected } from './SeatMapSelection/utils/calculateTotal'

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
  const { t } = useTranslate()

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

  return (
    promotions.length > 0 && (
      <div className="space-y-4 mb-4">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          <h3 className="font-medium">{t('event.availablePromotions')}</h3>
          <span className="text-xs text-muted-foreground">
            {t('event.maxPromotions', { count: maxAppliedPromotions })}
          </span>
        </div>

        <div className="space-y-2">
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className={cn(
                'flex items-start space-x-2 rounded-md border p-3 hover:bg-muted/50',
                (!isMatchedCondition(promotion) ||
                  (selectedPromotions.length >= maxAppliedPromotions &&
                    !selectedPromotions.find((p) => p.id === promotion.id))) &&
                  'opacity-50 cursor-not-allowed',
              )}
            >
              <Checkbox
                id={`promo-${promotion.id}`}
                checked={selectedPromotions.some((p) => p.id === promotion.id)}
                onCheckedChange={(checked) => handlePromotionChange(promotion, checked as boolean)}
                disabled={
                  !isMatchedCondition(promotion) ||
                  (selectedPromotions.length >= maxAppliedPromotions &&
                    !selectedPromotions.find((p) => p.id === promotion.id))
                }
                className="mt-1"
              />
              <div className="grid gap-1">
                <Label htmlFor={`promo-${promotion.id}`} className="font-semibold">
                  {promotion.code}
                </Label>
                <p className="text-[12px] font-medium text-primary">
                  {promotion.discountType === 'percentage'
                    ? `${promotion.discountValue}% ${t('event.off')}`
                    : `${formatMoney(promotion.discountValue, 'VND')} ${t('event.off')}`}
                  {promotion.discountApplyScope === 'total_order_value' &&
                    ` (${t('event.discountOnTotalOrderValue')})`}
                  {promotion.discountApplyScope === 'per_order_item' &&
                    ` (${t('event.discountOnPerOrderItem')})`}
                </p>
                {promotion.conditions?.minTickets && (
                  <p className="text-xs text-red-400">
                    {t('event.requiresMinimumTickets', {
                      count: promotion.conditions.minTickets,
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  )
}

export default PromotionListCheckbox
