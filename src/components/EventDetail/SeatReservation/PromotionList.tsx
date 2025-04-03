import React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Ticket } from 'lucide-react'
import { Promotion } from '@/payload-types'
import { useTranslate } from '@/providers/I18n/client'

const PromotionList = ({
  promotions,
  selectedPromotion,
  onSelectPromotion,
}: {
  promotions: Promotion[]
  selectedPromotion?: Promotion | null
  onSelectPromotion: (promotion: Promotion | null) => void
}) => {
  const { t } = useTranslate()

  const onSelect = (id: string) => {
    const existPromotion = promotions.find((promotion) => String(promotion.id) === id)

    onSelectPromotion(existPromotion || null)
  }

  return (
    promotions.length > 0 && (
      <div className="space-y-4 mb-4">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          <h3 className="font-medium">{t('event.availablePromotions')}</h3>
        </div>

        {promotions.length > 0 ? (
          <RadioGroup
            value={String(selectedPromotion?.id ?? '')}
            onValueChange={onSelect}
            className="space-y-2"
          >
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="flex items-start space-x-2 rounded-md border p-3 hover:bg-muted/50"
              >
                <RadioGroupItem
                  value={promotion.id.toString()}
                  id={`promo-${promotion.id}`}
                  className="mt-1"
                />
                <div className="grid gap-1">
                  <Label htmlFor={`promo-${promotion.id}`} className="font-semibold">
                    {promotion.code}
                  </Label>
                  <p className="text-[12px] font-medium text-primary">
                    {promotion.discountType === 'percentage'
                      ? `${promotion.discountValue}% ${t('event.off')}`
                      : `${t('event.currencySymbol')}${promotion.discountValue} ${t('event.off')}`}
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
          </RadioGroup>
        ) : (
          <div className="flex items-center justify-center p-4 border rounded-md bg-muted/20">
            <p className="text-sm text-muted-foreground">{t('event.noPromotionsAvailable')}</p>
          </div>
        )}
      </div>
    )
  )
}

export default PromotionList
