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

    return NextResponse.json({
      success: true,
      data: 
        {
          clicks: clicks.totalDocs.toLocaleString(),
          orders: orders.totalDocs.toLocaleString(),
          overallConversionRate: Number((clicks.totalDocs > 0 ? (orders.totalDocs / clicks.totalDocs) * 100 : 0).toFixed(2)),
          ticketsIssued: tickets.totalDocs.toLocaleString(),
          averageTicketsPerOrder: Number((orders.totalDocs > 0 ? (tickets.totalDocs / orders.totalDocs) : 0).toFixed(1)),
          grossRevenue: grossRevenue.toLocaleString(),
          commission: "0".toLocaleString(),
          commissionRate: "0".toLocaleString(),
        }
      ,
    })
  } catch (error) {
    console.error('Error fetching affiliate performance data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.',
      },
      { status: 500 },
    )
  }
}
