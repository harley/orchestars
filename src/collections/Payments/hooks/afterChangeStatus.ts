import { USER_PROMOTION_REDEMPTION_STATUS } from '@/collections/Promotion/constants/status'
import { FieldHookArgs } from 'payload'

export const afterChangeStatus = async ({ value, originalDoc, req, context }: FieldHookArgs) => {
  if (context.triggerAfterCreated === false) {
    return value
  }
  if (value === 'paid' && originalDoc.order) {
    const handler = async () => {
      const orderId = (originalDoc.order?.id || originalDoc.order) as number

      try {
        await req.payload.update({
          collection: 'orders',
          id: orderId,
          data: { status: 'completed' },
          req: { transactionID: req.transactionID as string },
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
          req: { transactionID: req.transactionID as string },
        })
      } catch (error) {
        console.error('Error updating userPromotionRedemptions status:', error)
      }
    }

    await handler()
  }
  return value
}
