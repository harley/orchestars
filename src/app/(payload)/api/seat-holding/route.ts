import { NextRequest, NextResponse, userAgent } from 'next/server'
import payload, { Where } from 'payload'
import config from '@/payload.config'
import { generatePassword } from '@/utilities/generatePassword'
import { headers } from 'next/headers'

type SeatHoldingRequest = {
  seatName: string
  eventId: number
  eventScheduleId: string
  seatHoldingCode?: string // current session seatHoldingCode
  userInfo?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const body: SeatHoldingRequest = await request.json()
    if (!body.seatName) {
      return NextResponse.json({ message: 'Ghế ngồi không được để trống' }, { status: 400 })
    }
    if (!body.eventId) {
      return NextResponse.json({ message: 'Sự kiện không được để trống' }, { status: 400 })
    }

    if (!body.eventScheduleId) {
      return NextResponse.json(
        { message: 'Ngày tham gia sự kiện không được để trống' },
        { status: 400 },
      )
    }

    await payload.init({ config })

    // check event exist
    const event = await payload
      .findByID({
        collection: 'events',
        id: Number(body.eventId),
        select: {
          id: true,
          title: true,
          schedules: true,
        },
      })
      .then((evt) => evt)

    if (!event) {
      throw new Error('Sự kiện không tồn tại')
    }

    const existSchedule = event.schedules?.some((sch) => sch?.id === body.eventScheduleId)

    if (!existSchedule) {
      throw new Error(`Ngày tham dự sự kiện không đúng`)
    }

    await checkSeatAvailable(body)

    const expireMinute = 30 * 1000 * 60
    const expireTime = new Date(new Date().getTime() + expireMinute).toISOString()

    if (body.seatHoldingCode) {
      // Validate existing seat holding
      const existingHolding = await payload.find({
        collection: 'seatHoldings',
        limit: 1,
        where: {
          code: { equals: body.seatHoldingCode },
          closedAt: { exists: false },
          expire_time: { greater_than: new Date().toISOString() },
        },
      })
      const seatHolding = existingHolding.docs?.[0]
      if (seatHolding) {
        await payload.update({
          collection: 'seatHoldings',
          id: seatHolding.id,
          data: {
            expire_time: expireTime,
            event: body.eventId as number,
            eventScheduleId: body.eventScheduleId,
            seatName: body.seatName,
          },
          select: {
            id: true,
            code: true,
            expire_time: true,
          },
        })

        return NextResponse.json(
          {
            seatHoldingCode: body.seatHoldingCode,
            expireTime,
          },
          { status: 200 },
        )
      }
    }

    const seatHoldingCode = generatePassword(60)
    const userInfo = body.userInfo
    const userAgentData = userAgent(request) || request.headers.get('user-agent') || ''
    const headersList = await headers()
    const ipAddress = headersList.get('request-ip') || headersList.get('x-forwarded-for')

    await payload.create({
      collection: 'seatHoldings',
      data: {
        code: seatHoldingCode,
        event: body.eventId as number,
        eventScheduleId: body.eventScheduleId,
        expire_time: expireTime,
        seatName: body.seatName,
        userInfo,
        ipAddress,
        userAgent: JSON.stringify(userAgentData),
      },
      select: {
        id: true,
        code: true,
        expire_time: true,
      },
    })

    return NextResponse.json({ seatHoldingCode, expireTime }, { status: 200 })
  } catch (error: any) {
    console.error('Error occurred while holding seat', error)
    return NextResponse.json(
      { message: error?.message || 'Có lỗi xảy ra! Vui lòng thử lại' },
      { status: 400 },
    )
  }
}

const checkSeatAvailable = async (body: SeatHoldingRequest) => {
  const arrSeatNames = [...new Set(body.seatName.split(','))] as string[]

  const conditions: Where = {
    or: arrSeatNames.map((seatName) => ({
      seatName: { like: seatName },
    })),
    event: { equals: body.eventId },
    eventScheduleId: { equals: body.eventScheduleId },
    closedAt: { exists: false },
    expire_time: { greater_than: new Date().toISOString() },
  }

  if (body.seatHoldingCode) {
    conditions.code = { not_equals: body.seatHoldingCode }
  }

  const existingSeats = await payload
    .find({
      collection: 'seatHoldings',
      where: conditions,
      select: {
        id: true,
        seatName: true,
        seatHoldingCode: true,
      },
    })
    .then((res) => res.docs)

  if (existingSeats?.length) {
    const unavailableSeats = existingSeats.map((ext) => ext.seatName).join(', ')
    throw new Error(
      `Ghế [${unavailableSeats}] đang được giữ bởi người khác! Vui lòng chọn ghế khác`,
    )
  }

  // Check all seats in parallel, grouped by event
  const existingTicketSeats = await payload
    .find({
      collection: 'tickets',
      limit: arrSeatNames.length,
      where: {
        and: [
          {
            status: {
              in: ['booked', 'pending_payment', 'hold'],
            },
          },
          {
            seat: {
              in: arrSeatNames,
            },
          },
          {
            event: {
              equals: Number(body.eventId),
            },
          },
          {
            eventScheduleId: {
              equals: body.eventScheduleId,
            },
          },
        ],
      },
      select: {
        id: true,
        seat: true,
      },
    })
    .then((res) => res.docs)

  if (existingTicketSeats?.length > 0) {
    const unavailableSeats = existingTicketSeats.map((ticket) => ticket.seat).join(', ')
    throw new Error(`Ghế ${unavailableSeats} hiện đã được đặt. Vui lòng chọn ghế khác.`)
  }
}
