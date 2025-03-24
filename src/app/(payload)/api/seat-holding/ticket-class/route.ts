import { NextRequest, NextResponse, userAgent } from 'next/server'
import payload from 'payload'
import config from '@/payload.config'
import { generatePassword } from '@/utilities/generatePassword'
import { headers } from 'next/headers'
import { Event } from '@/payload-types'
import { ORDER_STATUS } from '@/collections/Orders/constants'

type SeatHoldingRequest = {
  ticketClasses: { name: string; quantity: number }[]
  eventId: number
  eventScheduleId: string
  seatHoldingCode?: string // current session seatHoldingCode
  userInfo?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const body: SeatHoldingRequest = await request.json()
    if (!body.ticketClasses?.length) {
      return NextResponse.json({ message: 'Loại vé không được để trống' }, { status: 400 })
    }

    // merge duplicate ticket class item
    const mergedTicketClasses: Record<string, number> = {}

    for (const ticketClass of body.ticketClasses) {
      if (!ticketClass.name) {
        return NextResponse.json({ message: 'Tên loại vé không được để trống' }, { status: 400 })
      }
      if (!Number.isInteger(ticketClass.quantity) || ticketClass.quantity <= 0) {
        return NextResponse.json({
          message: 'Số lượng vé phải là số nguyên dương',
          status: 400,
        })
      }

      mergedTicketClasses[ticketClass.name] =
        (mergedTicketClasses[ticketClass.name] || 0) + ticketClass.quantity
    }

    body.ticketClasses = Object.entries(mergedTicketClasses).map(([name, quantity]) => ({
      name,
      quantity,
    }))

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
          ticketPrices: true,
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

    // check existing ticket class name
    for (const ticketClass of body.ticketClasses) {
      const existTicketClass = event.ticketPrices?.find((tkP) => tkP.name === ticketClass.name)
      if (!existTicketClass) {
        throw new Error(`Hạng vé [${ticketClass.name}] không tồn tại`)
      }
    }

    await checkTicketClassAvailable({ body, event })

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
            ticketClasses: body.ticketClasses,
            seatName: body.ticketClasses.map((tk) => tk.name).join(','),
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
        ticketClasses: body.ticketClasses,
        seatName: body.ticketClasses.map((tk) => tk.name).join(','),
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

const checkTicketClassAvailable = async ({
  body,
  event,
}: {
  body: SeatHoldingRequest
  event: Event
}) => {
  // as ticket class names
  const arrTicketPriceNames = [...new Set(body.ticketClasses.map((tk) => tk.name))] as string[]

  const countTicketClass = await payload.db.drizzle
    .execute(
      `
      SELECT name AS "ticketClassName", SUM(quantity) AS total 
      FROM seat_holdings_ticket_classes sh_ticket_class
      LEFT JOIN seat_holdings seat_holding ON sh_ticket_class."_parent_id" = seat_holding.id
      WHERE 
        seat_holding.event_id = '${body.eventId}'
        AND seat_holding."event_schedule_id" = '${body.eventScheduleId}'
        AND seat_holding."closed_at" IS NULL 
        AND seat_holding."expire_time" > '${new Date().toISOString()}'
        ${body.seatHoldingCode ? `AND seat_holding."code" != '${body.seatHoldingCode}'` : ''}
    group by name
  `,
    )
    .then((result) =>
      (result?.rows || []).reduce(
        (obj, row) => {
          obj[row.ticketClassName as string] = Number(row.total)

          return obj
        },
        {} as Record<string, number>,
      ),
    )

  console.log('countTicketClass', countTicketClass)

  // Check all seats in parallel, grouped by event
  const currentTime = new Date().toISOString()
  const existingTicketClasses = await payload.db.drizzle
    .execute(
      `
        SELECT 
          ticket.ticket_price_name AS "ticketPriceName", SUM(order_item.quantity) AS total
        FROM order_items order_item
        INNER JOIN orders ord  ON ord.id = order_item.order_id
        INNER JOIN (
            SELECT DISTINCT ON (order_item_id) * FROM tickets tk where tk.event_id=${event.id} ORDER BY order_item_id, id
        ) ticket 
            ON ticket.order_item_id = order_item.id

        WHERE 
            ( 
              (ord.status = '${ORDER_STATUS.completed.value}')
              OR
              (ord.status = '${ORDER_STATUS.processing.value}' AND ord.expire_at >= '${currentTime}')
            )
            AND order_item.event_id = ${body.eventId}
            AND ticket.ticket_price_name = ANY('{"${arrTicketPriceNames.join('","')}"}')
            AND ticket.event_schedule_id = '${body.eventScheduleId}'
            
        GROUP BY ticket.ticket_price_name
    `,
    )
    .then((result) =>
      (result.rows || []).reduce(
        (obj, row) => {
          obj[row.ticketPriceName as string] = Number(row.total)

          return obj
        },
        {} as Record<string, number>,
      ),
    )
  console.log('existingTicketSeats', existingTicketClasses)

  for (const inputTicketClass of body.ticketClasses) {
    const maxQuantity =
      event.ticketPrices?.find((tk) => tk.name === inputTicketClass?.name)?.quantity || 0

    const totalUnavailable =
      (Number(countTicketClass[inputTicketClass?.name]) || 0) +
      (Number(existingTicketClasses[inputTicketClass?.name]) || 0)

    if (totalUnavailable >= maxQuantity) {
      throw new Error(`Vé ${inputTicketClass.name} hiện đã được đặt hết! Vui lòng chọn vé khác.`)
    }

    const remaining = maxQuantity - totalUnavailable

    if (remaining < inputTicketClass.quantity) {
      throw new Error(
        `Vé ${inputTicketClass.name} hiện chỉ còn tối đa ${remaining} vé!. Vui lòng nhập lại số lượng mua`,
      )
    }
  }
}
