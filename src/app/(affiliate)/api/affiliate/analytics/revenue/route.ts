import { NextRequest, NextResponse } from 'next/server';

import { getPayload } from '@/payload-config/getPayloadConfig';
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest';
import { getDateRangeFromTimeRange } from '@/app/(affiliate)/utils/getDateRangeFromTimeRange';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const userRequest = await authorizeApiRequest();
    const payload = await getPayload();

    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);

    const links = await payload.find({
      collection: 'affiliate-links',
      where: {
        affiliateUser: {
          equals: userRequest.id,
        },
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
      }
    })

    const revenueBySource = new Map<string, number>();
    const revenueByCampaign = new Map<string, number>();
    const linkUtmMap = new Map();

    links.docs.forEach(link => {
      linkUtmMap.set(link.id, {
        source: link.utmParams?.source || '',
        campaign: link.utmParams?.campaign || ''
      })
    })

    orders.docs.forEach(order => {
      const revenue = order.totalBeforeDiscount || 0;
      const affiliateLink = order.affiliate?.affiliateLink;
      const affiliateLinkId = typeof affiliateLink === 'object' && affiliateLink !== null
        ? affiliateLink.id
        : affiliateLink;

      if (affiliateLinkId) {
        const utmParams = linkUtmMap.get(affiliateLinkId);
        
        // Add revenue by source
        const currentSourceRevenue = revenueBySource.get(utmParams.source) || 0;
        revenueBySource.set(utmParams.source, currentSourceRevenue + revenue);
        
        // Add revenue by campaign
        const currentCampaignRevenue = revenueByCampaign.get(utmParams.campaign) || 0;
        revenueByCampaign.set(utmParams.campaign, currentCampaignRevenue + revenue);
      }
    });

    const totalRevenue = Array.from(revenueBySource.values()).reduce((sum, value) => sum + value, 0);

    const topSourcesByRevenue = Array.from(revenueBySource.entries())
      .map(([source, revenue]) => ({
        source,
        revenue: revenue.toLocaleString(),
        percentage: totalRevenue > 0 ? parseFloat(((revenue / totalRevenue) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue))
      .slice(0, 5);

    const topCampaignsByRevenue = Array.from(revenueByCampaign.entries())
      .map(([campaign, revenue]) => ({
        campaign,
        revenue: revenue.toLocaleString(),
        percentage: totalRevenue > 0 ? parseFloat(((revenue / totalRevenue) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue))
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        bySource: topSourcesByRevenue,
        byCampaign: topCampaignsByRevenue
      }
    })

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.'
      },
      { status: 500 }
    )
  }
}