'use client'

import React, { useState, useCallback } from 'react'
import { SelectInput } from '@payloadcms/ui'
import type { User } from '@/payload-types'
import { UserCheck, Settings, Link } from 'lucide-react'
import {
  PayloadCard,
  PayloadCardContent,
  PayloadCardDescription,
  PayloadCardHeader,
  PayloadCardTitle,
  PayloadTabs,
  PayloadTabsContent,
  PayloadTabsList,
  PayloadTabsTrigger,
  PayloadGrid,
  PayloadGridItem,
} from './PayloadUIComponents'
import AffiliateSettingsTab from './AffiliateSettingsTab'
import AffiliateLinksTab from './AffiliateLinksTab'

interface Props {
  affiliateUsers: User[]
  selectedAffiliateUser: User | null
  onSelectAffiliateUser: (user: User | null) => void
}

const ManageAffiliateUserTab: React.FC<Props> = ({
  affiliateUsers,
  selectedAffiliateUser,
  onSelectAffiliateUser,
}) => {
  const [activeNestedTab, setActiveNestedTab] = useState<'settings' | 'links'>('settings')
  // const [settingsCount, setSettingsCount] = useState(0)
  // const [linksCount, setLinksCount] = useState(0)

  // Prepare options for user selector
  const userOptions = [
    { label: 'Select an affiliate user...', value: '' },
    ...affiliateUsers.map((user) => ({
      label: `${user.email} ${user.firstName && user.lastName ? `(${user.firstName} ${user.lastName})` : ''}`,
      value: user.id.toString(),
      user: user,
    })),
  ]

  const handleUserSelection = (option: any) => {
    if (!option || !option.value) {
      onSelectAffiliateUser(null)
      return
    }

    const selectedUser = affiliateUsers.find((user) => user.id.toString() === option.value)
    onSelectAffiliateUser(selectedUser || null)
  }

  // Callbacks to update counts from child components
  const handleSettingsCountUpdate = useCallback((_count: number) => {
    // setSettingsCount(count)
  }, [])

  const handleLinksCountUpdate = useCallback((_count: number) => {
    // setLinksCount(count)
  }, [])

  return (
    <div>
      {/* User Selection */}
      <PayloadCard className="payload-card--dropdown">
        <PayloadCardHeader>
          <PayloadCardTitle>
            <div className="payload-flex payload-flex--gap">
              <UserCheck style={{ width: '20px', height: '20px' }} />
              Step 1: Select Affiliate User
            </div>
          </PayloadCardTitle>
          <PayloadCardDescription>
            Choose an affiliate user to manage their settings and links
          </PayloadCardDescription>
        </PayloadCardHeader>
        <PayloadCardContent className="payload-card__content--dropdown">
          <div style={{ maxWidth: '400px' }}>
            <div className="field-type">
              <label className="field-label">Affiliate User</label>
              <SelectInput
                path="selectedUser"
                name="selectedUser"
                options={userOptions}
                value={selectedAffiliateUser?.id.toString() || ''}
                onChange={handleUserSelection}
              />
            </div>
          </div>

          {selectedAffiliateUser && (
            <div
              style={{
                marginTop: 'var(--base)',
                padding: 'var(--base)',
                backgroundColor: 'var(--theme-elevation-50)',
                borderRadius: 'var(--border-radius-s)',
                border: '1px solid var(--theme-elevation-100)',
              }}
            >
              <h4
                style={{
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--theme-text)',
                  marginBottom: 'calc(var(--base) / 2)',
                  fontSize: 'var(--font-size-base)',
                }}
              >
                Selected User Details
              </h4>
              <PayloadGrid cols={2} gap="md">
                <PayloadGridItem>
                  <div style={{ fontSize: 'var(--font-size-small)' }}>
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Email:</span>{' '}
                    {selectedAffiliateUser.email}
                  </div>
                </PayloadGridItem>
                <PayloadGridItem>
                  <div style={{ fontSize: 'var(--font-size-small)' }}>
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Name:</span>{' '}
                    {selectedAffiliateUser.firstName && selectedAffiliateUser.lastName
                      ? `${selectedAffiliateUser.firstName} ${selectedAffiliateUser.lastName}`
                      : 'Not provided'}
                  </div>
                </PayloadGridItem>
                <PayloadGridItem>
                  <div style={{ fontSize: 'var(--font-size-small)' }}>
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Phone:</span>{' '}
                    {selectedAffiliateUser.phoneNumber || 'Not provided'}
                  </div>
                </PayloadGridItem>
                <PayloadGridItem>
                  <div style={{ fontSize: 'var(--font-size-small)' }}>
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Username:</span>{' '}
                    {selectedAffiliateUser.username || 'Not provided'}
                  </div>
                </PayloadGridItem>
              </PayloadGrid>
            </div>
          )}
        </PayloadCardContent>
      </PayloadCard>

      {/* Step 2: Nested Tabs */}
      {selectedAffiliateUser && (
        <PayloadCard className="payload-mt">
          <PayloadCardHeader>
            <PayloadCardTitle>Step 2: Manage User Data</PayloadCardTitle>
            <PayloadCardDescription>
              Configure settings and manage links for {selectedAffiliateUser.email}
            </PayloadCardDescription>
          </PayloadCardHeader>
          <PayloadCardContent>
            <PayloadTabs
              defaultValue="settings"
              value={activeNestedTab}
              onValueChange={(value) => setActiveNestedTab(value as 'settings' | 'links')}
            >
              <PayloadTabsList>
                <PayloadTabsTrigger value="settings">
                  <div className="payload-flex payload-flex--gap">
                    <Settings style={{ width: '16px', height: '16px' }} />
                    Settings
                  </div>
                </PayloadTabsTrigger>
                <PayloadTabsTrigger value="links">
                  <div className="payload-flex payload-flex--gap">
                    <Link style={{ width: '16px', height: '16px' }} />
                    Links
                  </div>
                </PayloadTabsTrigger>
              </PayloadTabsList>

              <PayloadTabsContent value="settings">
                <AffiliateSettingsTab
                  selectedUser={selectedAffiliateUser}
                  onCountUpdate={handleSettingsCountUpdate}
                />
              </PayloadTabsContent>

              <PayloadTabsContent value="links">
                <AffiliateLinksTab
                  selectedUser={selectedAffiliateUser}
                  onCountUpdate={handleLinksCountUpdate}
                />
              </PayloadTabsContent>
            </PayloadTabs>
          </PayloadCardContent>
        </PayloadCard>
      )}

      {/* No User Selected State */}
      {!selectedAffiliateUser && (
        <PayloadCard className="payload-mt">
          <PayloadCardContent>
            <div className="payload-empty-state">
              <UserCheck style={{ width: '48px', height: '48px' }} />
              <h3>No User Selected</h3>
              <p>
                Please select an affiliate user from the dropdown above to manage their settings and
                links.
              </p>
            </div>
          </PayloadCardContent>
        </PayloadCard>
      )}
    </div>
  )
}

export default ManageAffiliateUserTab
