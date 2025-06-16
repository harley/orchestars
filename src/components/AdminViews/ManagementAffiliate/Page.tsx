import React from 'react'
import { redirect } from 'next/navigation'
import { AdminViewProps, getPayload } from 'payload'
import config from '@/payload.config'
import AffiliateManagementClient from './Page.client'
import type {
  User,
  AffiliateLink,
  AffiliateClickLog,
  AffiliateSetting,
  Order,
} from '@/payload-types'
import { DefaultTemplate } from '@payloadcms/next/templates'


const AffiliateManagementPage = async ({
  initPageResult,
  params,
  searchParams,
}: AdminViewProps) => {
  if (!initPageResult?.req?.user) {
    return redirect('/admin/login')
  }

  const payload = await getPayload({ config })

  try {
    // Fetch affiliate users
    const affiliateUsers = await payload.find({
      collection: 'users',
      where: {
        role: {
          equals: 'affiliate',
        },
      },
      limit: 100,
      sort: 'email',
    })

    // Fetch recent affiliate click logs for dashboard
    const recentClickLogs = await payload.find({
      collection: 'affiliate-click-logs',
      limit: 50,
      sort: '-createdAt',
      depth: 2,
    })

    // Fetch affiliate settings and links for dashboard metrics only
    // Individual user data is now fetched via API calls in the client components
    const affiliateSettings = await payload.find({
      collection: 'affiliate-settings',
      limit: 100,
      sort: '-createdAt',
      depth: 2,
    })

    const affiliateLinks = await payload.find({
      collection: 'affiliate-links',
      limit: 100,
      sort: '-createdAt',
      depth: 2,
    })

    // Fetch affiliate orders for revenue calculation
    const affiliateOrders = await payload.find({
      collection: 'orders',
      where: {
        'affiliate.affiliateUser': {
          exists: true,
        },
        status: {
          in: ['completed'],
        },
      },
      limit: 1000,
      sort: '-createdAt',
      depth: 2,
    })

    return (
      <DefaultTemplate
        params={params}
        searchParams={searchParams}
        i18n={initPageResult.req.i18n}
        payload={initPageResult.req.payload}
        permissions={initPageResult.permissions}
        user={initPageResult.req.user || undefined}
        locale={initPageResult.locale}
        visibleEntities={initPageResult.visibleEntities}
      >
        
        <AffiliateManagementClient
          affiliateUsers={affiliateUsers.docs as User[]}
          recentClickLogs={recentClickLogs.docs as AffiliateClickLog[]}
          affiliateSettings={affiliateSettings.docs as AffiliateSetting[]}
          affiliateLinks={affiliateLinks.docs as AffiliateLink[]}
          affiliateOrders={affiliateOrders.docs as Order[]}
        />
      </DefaultTemplate>
    )
  } catch (error) {
    console.error('Error fetching affiliate data:', error)
    return (
      <div className="p-4">
        <h1>Error loading affiliate management page</h1>
        <p>Please try again later.</p>
      </div>
    )
  }
}

export default AffiliateManagementPage
