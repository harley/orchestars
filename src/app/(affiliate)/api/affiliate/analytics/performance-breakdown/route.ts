import { NextRequest, NextResponse } from 'next/server';

import { getPayload } from '@/payload-config/getPayloadConfig';
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest';
import { getDateRangeFromTimeRange } from '@/app/(affiliate)/utils/getDateRangeFromTimeRange';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const sortBy = searchParams.get('sortBy') || 'revenue';
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

    const logs = links.docs.map(link => {
      clicks.docs.map(click => {
        console.log(click.affiliateLink)
        console.log(link.id)
      })
    })

    const performanceData = links.docs.map(link => {
      const linkName = 'Unnamed Link';
      const linkSource = link.utmParams?.source || 'Unknown';
      const linkCampaign = link.utmParams?.campaign || 'Unknown';
      
      const linkClicks = clicks.docs.filter(click => {
        const affiliateLinkId = typeof click.affiliateLink === 'object' && click.affiliateLink !== null
          ? click.affiliateLink.id
          : click.affiliateLink;
        return affiliateLinkId === link.id;
      }).length;

      const linkOrders = orders.docs.filter(order => {
        const affiliateLink = order.affiliate?.affiliateLink;
        const affiliateLinkId = typeof affiliateLink === 'object' && affiliateLink !== null
          ? affiliateLink.id
          : affiliateLink;
        return affiliateLinkId === link.id;
      }).length;
      
      const linkTickets = tickets.docs.filter(ticket => {
        const orderId = typeof ticket.order === 'object' && ticket.order !== null
          ? ticket.order.id
          : ticket.order;
        return typeof orderId === 'number' && orderIds.includes(orderId);
      }).length;
      
      const linkConversion = linkClicks > 0 ? (linkOrders / linkClicks) * 100 : 0;
      
      const linkGrossRevenue = orders.docs
        .filter(order => {
          const affiliateLink = order.affiliate?.affiliateLink;
          const affiliateLinkId = typeof affiliateLink === 'object' && affiliateLink !== null
            ? affiliateLink.id
            : affiliateLink;
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
        clicks: linkClicks.toLocaleString(),
        orders: linkOrders.toLocaleString(),
        ticketsIssued: linkTickets.toLocaleString(),
        conversionRate: parseFloat(linkConversion.toFixed(2)),
        grossRevenue: linkGrossRevenue.toLocaleString(),
        netRevenue: linkNetRevenue.toLocaleString(),
        commission: linkCommission.toLocaleString(),
      }
    })

    switch (sortBy) {
      case 'revenue':
        performanceData.sort((a, b) => parseFloat(b.netRevenue) - parseFloat(a.netRevenue));
        break;
      case 'clicks':
        performanceData.sort((a, b) => parseInt(String(b.clicks), 10) - parseInt(String(a.clicks), 10));
        break;
      case 'orders':
        performanceData.sort((a, b) => parseInt(String(b.orders), 10) - parseInt(String(a.orders), 10));
        break;
      case 'conversion':
        performanceData.sort((a, b) => b.conversionRate - a.conversionRate);
        break;
      default:
        return 0
    }

    return NextResponse.json({
      success: true,
      data: performanceData.slice(0, 4),
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