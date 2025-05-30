import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import config from '@/payload.config'
import { isAfter, isBefore } from 'date-fns'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'

type SeatHoldingRequest = {
  code: string
  eventId: number
}

export async function POST(request: NextRequest) {
  try {
    const body: SeatHoldingRequest = await request.json()
    if (!body.code) {
      throw new Error('PROMO001')
    }
    if (!body.eventId) {
      throw new Error('EVT001')
    }

    await payload.init({ config })

    // check promotion exist - case insensitive
    const promotion = await payload
      .find({
        collection: 'promotions',
        limit: 1,
        where: {
          event: { equals: Number(body.eventId) },
          code: { equals: body.code.toUpperCase() },
          status: { equals: 'active' },
        },
        select: {
          id: true,
          maxRedemptions: true,
          code: true,
          appliedTicketClasses: true,
          perUserLimit: true,
          discountType: true,
          discountValue: true,
          status: true,
          startDate: true,
          endDate: true,
          conditions: true,
          discountApplyScope: true,
        },
      })
      .then((res) => res.docs?.[0])

    if (!promotion) {
      throw new Error(`PROMO002|${JSON.stringify({ promotionCode: body.code })}`)
    }
    if (!promotion.maxRedemptions || promotion.maxRedemptions < 1) {
      throw new Error(`PROMO003|${JSON.stringify({ promotionCode: promotion.code })}`)
    }
    const currentTime = new Date()
    if (promotion.startDate && isAfter(promotion.startDate, currentTime)) {
      throw new Error('PROMO004')
    }

    if (promotion.endDate && isBefore(promotion.endDate, currentTime)) {
      throw new Error('PROMO005')
    }

    const userPromotionsPendingPayment = await payload
      .count({
        collection: 'userPromotionRedemptions',
        where: {
          promotion: { equals: promotion.id },
          status: { equals: 'pending' },
          expireAt: { greater_than_equal: currentTime.toISOString() },
        },
      })
      .then((res) => res.totalDocs)

    const remainNumberRedemption =
      promotion.maxRedemptions - (promotion.totalUsed || 0) - userPromotionsPendingPayment

    if (remainNumberRedemption <= 0) {
      throw new Error(`PROMO003|${JSON.stringify({ promotionCode: promotion.code })}`)
    }

    return NextResponse.json(promotion, { status: 200 })
  } catch (error: any) {
    console.error('Error occurred while checking promotion code', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}

// get public promotions

export async function GET(request: NextRequest, _context: any) {
  try {
    const searchParams = request.nextUrl.searchParams
    await payload.init({ config })

    const eventId = searchParams.get('eventId')

    const currentTime = new Date().toISOString()

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

    return NextResponse.json({ promotions, eventPromotionConfig }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json([], { status: 200 })
  }
}
