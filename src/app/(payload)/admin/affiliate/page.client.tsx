'use client'

import React, { useState } from 'react'
import { Gutter } from '@payloadcms/ui'
import type { User, AffiliateLink, AffiliateClickLog, AffiliateSetting, Order } from '@/payload-types'
import { PayloadTabs, PayloadTabsContent, PayloadTabsList, PayloadTabsTrigger } from './components/PayloadUIComponents'
import DashboardTab from './components/DashboardTab'
import ManageAffiliateUserTab from './components/ManageAffiliateUserTab'
import AffiliateClickLogsTab from './components/AffiliateClickLogsTab'

interface Props {
  affiliateUsers: User[]
  recentClickLogs: AffiliateClickLog[]
  affiliateSettings: AffiliateSetting[]
  affiliateLinks: AffiliateLink[]
  affiliateOrders: Order[]
}

const AffiliateManagementClient: React.FC<Props> = ({
  affiliateUsers,
  recentClickLogs,
  affiliateSettings,
  affiliateLinks,
  affiliateOrders,
}) => {
  const [selectedAffiliateUser, setSelectedAffiliateUser] = useState<User | null>(null)

  return (
    <Gutter>
      <div style={{ padding: 'var(--base)' }}>
        <div style={{ marginBottom: 'calc(var(--base) * 2)' }}>
          <h1 style={{
            fontSize: 'var(--font-size-h1)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--theme-text)',
            marginBottom: 'calc(var(--base) / 2)'
          }}>
            Affiliate Management
          </h1>
          <p style={{
            color: 'var(--theme-elevation-600)',
            fontSize: 'var(--font-size-base)',
            margin: 0
          }}>
            Manage affiliate users, track performance, and configure affiliate settings
          </p>
        </div>

        <PayloadTabs defaultValue="dashboard">
          <PayloadTabsList>
            <PayloadTabsTrigger value="dashboard">
              Dashboard
            </PayloadTabsTrigger>
            <PayloadTabsTrigger value="manage-users">
              Manage Affiliate Users
            </PayloadTabsTrigger>
            <PayloadTabsTrigger value="click-logs">
              Affiliate Click Logs
            </PayloadTabsTrigger>
          </PayloadTabsList>

          <PayloadTabsContent value="dashboard">
            <DashboardTab
              affiliateUsers={affiliateUsers}
              recentClickLogs={recentClickLogs}
              _affiliateSettings={affiliateSettings}
              affiliateLinks={affiliateLinks}
              affiliateOrders={affiliateOrders}
            />
          </PayloadTabsContent>

          <PayloadTabsContent value="manage-users">
            <ManageAffiliateUserTab
              affiliateUsers={affiliateUsers}
              affiliateSettings={affiliateSettings}
              affiliateLinks={affiliateLinks}
              selectedAffiliateUser={selectedAffiliateUser}
              onSelectAffiliateUser={setSelectedAffiliateUser}
            />
          </PayloadTabsContent>

          <PayloadTabsContent value="click-logs">
            <AffiliateClickLogsTab
              clickLogs={recentClickLogs}
              affiliateUsers={affiliateUsers}
            />
          </PayloadTabsContent>
        </PayloadTabs>
      </div>
    </Gutter>
  )
}

export default AffiliateManagementClient