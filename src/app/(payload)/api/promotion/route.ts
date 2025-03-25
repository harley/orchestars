import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import config from '@/payload.config'
import { isAfter, isBefore } from 'date-fns'
type SeatHoldingRequest = {
  code: string
  eventId: number
}

export async function POST(request: NextRequest) {
  try {
    const body: SeatHoldingRequest = await request.json()
    if (!body.code) {
      return NextResponse.json({ message: 'Mã giảm giá không được để trống' }, { status: 400 })
    }
    if (!body.eventId) {
      return NextResponse.json({ message: 'Sự kiện không được để trống' }, { status: 400 })
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
        },
      })
      .then((res) => res.docs?.[0])

    if (!promotion) {
      throw new Error('Mã giảm giá không hợp lệ')
    }
    if (!promotion.maxRedemptions || promotion.maxRedemptions < 1) {
      throw new Error('Mã giảm giá đã hết lượt sử dụng')
    }
    const currentTime = new Date()
    if (promotion.startDate && isAfter(promotion.startDate, currentTime)) {
      throw new Error('Không thể dùng mã giảm giá trước thời gian quy định')
    }

    if (promotion.endDate && isBefore(promotion.endDate, currentTime)) {
      throw new Error('Mã giảm giá đã hết hạn')
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
      throw new Error('Mã giảm giá đã hết lượt sử dụng')
    }

    return NextResponse.json(promotion, { status: 200 })
  } catch (error: any) {
    console.error('Error occurred while checking promotion code', error)
    return NextResponse.json(
      { message: error?.message || 'Có lỗi xảy ra! Vui lòng thử lại' },
      { status: 400 },
    )
  }
}
