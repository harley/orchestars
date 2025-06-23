import { NextRequest, NextResponse } from 'next/server';

import { getPayload } from '@/payload-config/getPayloadConfig';
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest';
import { getDateRangeFromTimeRange } from '@/app/(affiliate)/utils/getDateRangeFromTimeRange';
import { getLinkId } from '@/app/(affiliate)/utils/getLinkId';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const sortBy = searchParams.get('sortBy') || 'revenue';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const userRequest = await authorizeApiRequest();
    const payload = await getPayload();

    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);

    const links = await payload.find({
      collection: 'affiliate-links',
      where: {
        affiliateUser: {
          equals: userRequest.id,
        },
      }
    })

    const clicks = await payload.find({
      collection: 'affiliate-click-logs',
      where: {
        'affiliateUser.email': {
          equals: userRequest.email,
        },
        createdAt: {
          greater_than_equal: startDate,
          less_than_equal: endDate,
        }
      }
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
    });

    const orderIds = orders.docs.map(order => order.id);

    const tickets = await payload.find({
      collection: 'tickets',
      where: {
        order: {
          in: orderIds,
        },
      },
    })

    const performanceData = links.docs.map(link => {
      const linkName = 'Unnamed Link';
      const linkSource = link.utmParams?.source || 'Unknown';
      const linkCampaign = link.utmParams?.campaign || 'Unknown';
      
      const linkClicks = clicks.docs.filter(click => {
        const affiliateLinkId = getLinkId(click.affiliateLink);
        return affiliateLinkId === link.id;
      }).length;

      const linkOrders = orders.docs.filter(order => {
        const affiliateLink = order.affiliate?.affiliateLink;
        const affiliateLinkId = getLinkId(affiliateLink);
        return affiliateLinkId === link.id;
      }).length;

      const linkTickets = tickets.docs.filter(ticket => {
        const ticketOrderId = typeof ticket.order === 'object' && ticket.order !== null ? ticket.order.id : ticket.order;
        const order = orders.docs.find(o => o.id === ticketOrderId);

        const affiliateLink = order?.affiliate?.affiliateLink;
        const affiliateLinkId = getLinkId(affiliateLink);
        return affiliateLinkId === link.id;
      }).length;
      
      const linkConversion = linkClicks > 0 ? (linkOrders / linkClicks) * 100 : 0;
      
      const linkGrossRevenue = orders.docs
        .filter(order => {
          const affiliateLink = order.affiliate?.affiliateLink;
          const affiliateLinkId = getLinkId(affiliateLink);
          return affiliateLinkId === link.id;
        })
        .reduce((sum, order) => sum + (order.total || 0), 0);

      const linkNetRevenue = linkGrossRevenue;
      
      const linkCommission = 0;

      return {
        id: link.id,
        name: linkName,
        utmSource: linkSource,
        utmCampaign: linkCampaign,
        clicks: linkClicks,
        orders: linkOrders,
        ticketsIssued: linkTickets,
        conversionRate: linkConversion,
        grossRevenue: linkGrossRevenue,
        netRevenue: linkNetRevenue,
        commission: linkCommission,
      }
    })

    switch (sortBy) {
      case 'revenue':
        performanceData.sort((a, b) => b.netRevenue - a.netRevenue);
        break;
      case 'clicks':
        performanceData.sort((a, b) => b.clicks - a.clicks);
        break;
      case 'orders':
        performanceData.sort((a, b) => b.orders - a.orders);
        break;
      case 'conversion':
        performanceData.sort((a, b) => b.conversionRate - a.conversionRate);
        break;
      default:
        throw new Error('Invalid sort parameter: ' + sortBy);
    }

    return NextResponse.json({
      success: true,
      data: performanceData.slice((page - 1) * limit, page * limit).map(item => ({
        id: item.id,
        name: item.name,
        utmSource: item.utmSource,
        utmCampaign: item.utmCampaign,
        clicks: item.clicks.toLocaleString(),
        orders: item.orders.toLocaleString(),
        ticketsIssued: item.ticketsIssued.toLocaleString(),
        conversionRate: Number(item.conversionRate.toFixed(2)),
        grossRevenue: item.grossRevenue.toLocaleString(),
        netRevenue: item.netRevenue.toLocaleString(),
        commission: item.commission.toLocaleString(),
      })),
      pagination: {
        page: page,
        limit: limit,
        totalPages: Math.ceil(performanceData.length / limit),
        totalDocs: performanceData.length,
        hasNextPage: page < Math.ceil(performanceData.length / limit),
        hasPrevPage: page > 1,
      }
    })

  } catch (error) {
    console.error('Error fetching affiliate performance breakdown data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.',
      },
      { status: 500 },
    )
  }
}