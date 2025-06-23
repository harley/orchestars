import { NextRequest, NextResponse } from 'next/server';

import { getPayload } from '@/payload-config/getPayloadConfig';
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest';
import { getDateRangeFromTimeRange } from '@/app/(affiliate)/utils/getDateRangeFromTimeRange';
import { getLinkId } from '@/app/(affiliate)/utils/getLinkId';

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
      const affiliateLinkId = getLinkId(affiliateLink);

      if (affiliateLinkId) {
        const utmParams = linkUtmMap.get(affiliateLinkId);
        if (!utmParams) {
          console.error(`No UTM parameters found for affiliate link ID: ${affiliateLinkId}`);
          return;
        }
        
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
      .map(([source, numericRevenue]) => ({
        source,
        _numericRevenue: numericRevenue,
        percentage: totalRevenue > 0 ? parseFloat(((numericRevenue / totalRevenue) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => b._numericRevenue - a._numericRevenue)
      .slice(0, 5)
      .map(item => ({
        source: item.source,
        revenue: item._numericRevenue.toLocaleString(),
        percentage: item.percentage
      }));

    const topCampaignsByRevenue = Array.from(revenueByCampaign.entries())
      .map(([campaign, numericRevenue]) => ({
        campaign,
        _numericRevenue: numericRevenue,
        percentage: totalRevenue > 0 ? parseFloat(((numericRevenue / totalRevenue) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => b._numericRevenue - a._numericRevenue)
      .slice(0, 5)
      .map(item => ({
        campaign: item.campaign,
        revenue: item._numericRevenue.toLocaleString(),
        percentage: item.percentage
      }));

    return NextResponse.json({
      success: true,
      data: {
        bySource: topSourcesByRevenue,
        byCampaign: topCampaignsByRevenue
      },
    })

  } catch (error) {
    console.error('Error fetching affiliate revenue analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.'
      },
      { status: 500 }
    )
  }
}