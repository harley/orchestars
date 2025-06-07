import { Promotion } from '@/payload-types'
import { BasePayload } from 'payload'
import { USER_PROMOTION_REDEMPTION_STATUS } from '../constants/status'

export const updateTotalUsedPromotion = async ({
  promotionId,
  payload,
  transactionID
}: {
  payload: BasePayload
  promotionId: Promotion['id']
  transactionID?: string
}) => {
  console.log('----> Updating promotion total used')
  const countTotalUserUsed = await payload
    .count({
      collection: 'userPromotionRedemptions',
      where: {
        promotion: { equals: promotionId },
        status: { equals: USER_PROMOTION_REDEMPTION_STATUS.used.value },
      },
      req: { transactionID },
    })
    .then((res) => res.totalDocs)

  await payload.update({
    collection: 'promotions',
    id: promotionId,
    data: {
      totalUsed: countTotalUserUsed,
    },
    depth: 0,
    req: { transactionID },
  })
}
