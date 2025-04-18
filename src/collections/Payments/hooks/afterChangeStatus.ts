import { USER_PROMOTION_REDEMPTION_STATUS } from '@/collections/Promotion/constants/status'
import { FieldHookArgs } from 'payload'

export const afterChangeStatus = async ({ value, originalDoc, req }: FieldHookArgs) => {
  if (value === 'paid' && originalDoc.order) {
    const handler = async () => {
      const orderId = (originalDoc.order?.id || originalDoc.order) as number
      try {
        await req.payload.update({
          collection: 'orders',
          id: orderId,
          data: { status: 'completed' },
        })
      } catch (error) {
        console.error('Error updating order status:', error)
      }

      try {
        const userId = originalDoc.user?.id || originalDoc.user
        const paymentId = originalDoc.id

        //   update userPromotionRedemptions status = used
        console.log('----> Updating userPromotionRedemptions status to used')
        await req.payload.update({
          collection: 'userPromotionRedemptions',
          where: {
            payment: { equals: paymentId },
            user: { equals: userId },
            redeemAt: { exists: false },
            status: { equals: USER_PROMOTION_REDEMPTION_STATUS.pending.value },
          },
          data: {
            status: USER_PROMOTION_REDEMPTION_STATUS.used.value,
            redeemAt: new Date().toISOString(),
          },
        })

        // update promotion total used
        const promotionId = originalDoc.promotion?.id || originalDoc.promotion
        if (promotionId) {
          console.log('----> Updating promotion total used')
          const countTotalUserUsed = await req.payload
            .count({
              collection: 'userPromotionRedemptions',
              where: {
                promotion: { equals: promotionId },
                status: { equals: USER_PROMOTION_REDEMPTION_STATUS.used.value },
              },
            })
            .then((res) => res.totalDocs)

          await req.payload.update({
            collection: 'promotions',
            id: promotionId,
            data: {
              totalUsed: countTotalUserUsed,
            },
          })
        }
      } catch (error) {
        console.error('Error updating userPromotionRedemptions status:', error)
      }
    }

    handler()
  }
  return value
}
