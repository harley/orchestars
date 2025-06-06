import { USER_PROMOTION_REDEMPTION_STATUS } from '@/collections/Promotion/constants/status'
import { updateTotalUsedPromotion } from '@/collections/Promotion/utils'
import { FieldHookArgs } from 'payload'

export const updateTotalUsedPromotionAfterChangeStatus = async ({
  originalDoc,
  previousDoc,
  value,
  req,
}: FieldHookArgs) => {
  if (
    value === USER_PROMOTION_REDEMPTION_STATUS.used.value &&
    previousDoc?.status !== originalDoc?.status
  ) {
    const handler = async () => {
      try {
        const promotionId = originalDoc.promotion?.id || originalDoc.promotion
        if (promotionId) {
          await updateTotalUsedPromotion({
            promotionId,
            payload: req.payload,
            transactionID: req.transactionID as string,
          })
        }
      } catch (error) {
        console.error('Error updating userPromotionRedemptions status:', error)
      }
    }

    await handler()
  }
  return value
}
