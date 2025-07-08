import { getPayload } from '@/payload-config/getPayloadConfig'
import { Promotion } from '@/payload-types'
import { unstable_cache } from 'next/cache'

const getPromotions = async ({ eventId }: { eventId: number }) => {
  try {
    const payload = await getPayload()
    const currentTime = new Date().toISOString()

    console.log(`fetching promotions by eventId ${eventId} at ${currentTime}`)

    const [promotions, eventPromotionConfig] = await Promise.all([
      payload
        .find({
          collection: 'promotions',
          limit: 10,
          where: {
            event: { equals: Number(eventId) },
            status: { equals: 'active' },
            startDate: { less_than_equal: currentTime },
            endDate: { greater_than_equal: currentTime },
            isPrivate: { equals: false },
          },
          select: {
            id: true,
            code: true,
            appliedTicketClasses: true,
            perUserLimit: true,
            discountType: true,
            discountValue: true,
            startDate: true,
            endDate: true,
            conditions: true,
            discountApplyScope: true,
          },
          depth: 0,
        })
        .then((res) => res.docs),
      payload
        .find({
          collection: 'promotionConfigs',
          limit: 1,
          where: {
            event: { equals: Number(eventId) },
          },
          select: {
            id: true,
            name: true,
            description: true,
            event: true,
            validationRules: true,
            stackingRules: true,
          },
          depth: 0,
        })
        .then((res) => res.docs?.[0]),
    ])

    return { promotions, eventPromotionConfig }
  } catch (error) {
    console.error('Error while fetching promotions', error)
    return { promotions: [] as Promotion[], eventPromotionConfig: undefined }
  }
}

export const getPromotionsCached = ({ eventId }: { eventId: number }) =>
  unstable_cache(async () => getPromotions({ eventId }), [`promotions:${eventId}`], {
    tags: [`promotions:${eventId}`],
    revalidate: 3600, // 1 hour
  })
