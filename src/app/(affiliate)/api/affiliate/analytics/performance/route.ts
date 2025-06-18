import { NextRequest, NextResponse } from 'next/server'

import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { getDateRangeFromTimeRange } from '@/app/(affiliate)/utils/getDateRangeFromTimeRange'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const userRequest = await authorizeApiRequest()
    const payload = await getPayload()

    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange)

    const clicks = await payload.find({
      collection: 'affiliate-click-logs',
      where: {
        createdAt: {
          greater_than_equal: startDate,
          less_than_equal: endDate,
        },
        'affiliateUser.email': {
          equals: userRequest.email,
        }
      },
      limit: 0,
    })

    const orders = await payload.find({
      collection: 'orders',
      where: {
        createdAt: {
          greater_than_equal: startDate,
          less_than_equal: endDate,
        },
        'affiliate.affiliateUser': {
          equals: userRequest.id,
        }
      },
      limit: 0,
    })

    const orderIds = orders.docs.map(order => order.id)
    const grossRevenue = orders.docs.reduce((sum, order) => sum + (order.total || 0), 0)

    const tickets = await payload.find({
      collection: 'tickets',
      where: {
        order: {
          in: orderIds
        }
      }
    })

    //    todo
    return NextResponse.json({
      success: true,
      data: 
        {
          clicks: clicks.totalDocs.toLocaleString(),
          orders: orders.totalDocs.toLocaleString(),
          overallConversionRate: (clicks.totalDocs > 0 ? (orders.totalDocs / clicks.totalDocs) * 100 : 0).toFixed(2),
          ticketsIssued: tickets.totalDocs.toLocaleString(),
          averageTicketsPerOrder: (tickets.totalDocs > 0 ? (tickets.totalDocs / orders.totalDocs) : 0).toFixed(1),
          grossRevenue: grossRevenue.toLocaleString(),
          commission: "0".toLocaleString(),
        }
      ,
    })
  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.',
      },
      { status: 500 },
    )
  }
}
