'use client'

import React from 'react'
import type { User, AffiliateLink, AffiliateClickLog, AffiliateSetting, Order } from '@/payload-types'
import { Users, Link, MousePointer, TrendingUp, DollarSign } from 'lucide-react'
import {
  PayloadCard,
  PayloadCardContent,
  PayloadCardDescription,
  PayloadCardHeader,
  PayloadCardTitle,
  PayloadGrid,
  PayloadGridItem
} from './PayloadUIComponents'

interface Props {
  affiliateUsers: User[]
  recentClickLogs: AffiliateClickLog[]
  _affiliateSettings: AffiliateSetting[]
  affiliateLinks: AffiliateLink[]
  affiliateOrders: Order[]
}

const DashboardTab: React.FC<Props> = ({
  affiliateUsers,
  recentClickLogs,
  _affiliateSettings,
  affiliateLinks,
  affiliateOrders,
}) => {
  // Calculate metrics
  const totalAffiliateUsers = affiliateUsers.length
  const totalAffiliateLinks = affiliateLinks.length
  const totalClicks = recentClickLogs.length


  // Calculate revenue metrics
  const totalRevenue = affiliateOrders.reduce((sum, order) => {
    return sum + (order.total || 0)
  }, 0)

  const totalOrders = affiliateOrders.length

  // Calculate recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentClicks = recentClickLogs.filter(log =>
    new Date(log.createdAt) > sevenDaysAgo
  ).length

  const recentLinks = affiliateLinks.filter(link =>
    new Date(link.createdAt) > sevenDaysAgo
  ).length

  const recentOrders = affiliateOrders.filter(order =>
    new Date(order.createdAt) > sevenDaysAgo
  ).length

  const recentRevenue = affiliateOrders
    .filter(order => new Date(order.createdAt) > sevenDaysAgo)
    .reduce((sum, order) => sum + (order.total || 0), 0)

  return (
    <div>
      {/* Overview Cards */}
      <PayloadGrid cols={3} gap="md">
        <PayloadGridItem>
          <PayloadCard>
            <PayloadCardHeader>
              <div className="payload-flex payload-flex--between">
                <PayloadCardTitle>Total Affiliate Users</PayloadCardTitle>
                <Users style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-600)' }} />
              </div>
            </PayloadCardHeader>
            <PayloadCardContent>
              <div style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'calc(var(--base) / 4)'
              }}>
                {totalAffiliateUsers}
              </div>
              <p style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--theme-elevation-600)',
                margin: 0
              }}>
                Active affiliate accounts
              </p>
            </PayloadCardContent>
          </PayloadCard>
        </PayloadGridItem>

        <PayloadGridItem>
          <PayloadCard>
            <PayloadCardHeader>
              <div className="payload-flex payload-flex--between">
                <PayloadCardTitle>Affiliate Links</PayloadCardTitle>
                <Link style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-600)' }} />
              </div>
            </PayloadCardHeader>
            <PayloadCardContent>
              <div style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'calc(var(--base) / 4)'
              }}>
                {totalAffiliateLinks}
              </div>
              <p style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--theme-elevation-600)',
                margin: 0
              }}>
                +{recentLinks} created this week
              </p>
            </PayloadCardContent>
          </PayloadCard>
        </PayloadGridItem>

        <PayloadGridItem>
          <PayloadCard>
            <PayloadCardHeader>
              <div className="payload-flex payload-flex--between">
                <PayloadCardTitle>Total Clicks</PayloadCardTitle>
                <MousePointer style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-600)' }} />
              </div>
            </PayloadCardHeader>
            <PayloadCardContent>
              <div style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'calc(var(--base) / 4)'
              }}>
                {totalClicks}
              </div>
              <p style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--theme-elevation-600)',
                margin: 0
              }}>
                {recentClicks} clicks this week
              </p>
            </PayloadCardContent>
          </PayloadCard>
        </PayloadGridItem>

        <PayloadGridItem>
          <PayloadCard>
            <PayloadCardHeader>
              <div className="payload-flex payload-flex--between">
                <PayloadCardTitle>Total Revenue</PayloadCardTitle>
                <DollarSign style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-600)' }} />
              </div>
            </PayloadCardHeader>
            <PayloadCardContent>
              <div style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'calc(var(--base) / 4)'
              }}>
                ${totalRevenue.toLocaleString()}
              </div>
              <p style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--theme-elevation-600)',
                margin: 0
              }}>
                +${recentRevenue.toLocaleString()} this week
              </p>
            </PayloadCardContent>
          </PayloadCard>
        </PayloadGridItem>
      </PayloadGrid>

      {/* Additional Metrics */}
      <PayloadGrid cols={3} gap="md" className="payload-mt">
        <PayloadGridItem>
          <PayloadCard>
            <PayloadCardHeader>
              <div className="payload-flex payload-flex--between">
                <PayloadCardTitle>Total Orders</PayloadCardTitle>
                <TrendingUp style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-600)' }} />
              </div>
            </PayloadCardHeader>
            <PayloadCardContent>
              <div style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'calc(var(--base) / 4)'
              }}>
                {totalOrders}
              </div>
              <p style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--theme-elevation-600)',
                margin: 0
              }}>
                +{recentOrders} orders this week
              </p>
            </PayloadCardContent>
          </PayloadCard>
        </PayloadGridItem>

        <PayloadGridItem>
          <PayloadCard>
            <PayloadCardHeader>
              <div className="payload-flex payload-flex--between">
                <PayloadCardTitle>Conversion Rate</PayloadCardTitle>
                <TrendingUp style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-600)' }} />
              </div>
            </PayloadCardHeader>
            <PayloadCardContent>
              <div style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'calc(var(--base) / 4)'
              }}>
                {totalClicks > 0 ? ((totalOrders / totalClicks) * 100).toFixed(2) : '0.00'}%
              </div>
              <p style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--theme-elevation-600)',
                margin: 0
              }}>
                Orders per click
              </p>
            </PayloadCardContent>
          </PayloadCard>
        </PayloadGridItem>

        <PayloadGridItem>
          <PayloadCard>
            <PayloadCardHeader>
              <div className="payload-flex payload-flex--between">
                <PayloadCardTitle>Avg Order Value</PayloadCardTitle>
                <DollarSign style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-600)' }} />
              </div>
            </PayloadCardHeader>
            <PayloadCardContent>
              <div style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'calc(var(--base) / 4)'
              }}>
                ${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}
              </div>
              <p style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--theme-elevation-600)',
                margin: 0
              }}>
                Revenue per order
              </p>
            </PayloadCardContent>
          </PayloadCard>
        </PayloadGridItem>
      </PayloadGrid>

      {/* Recent Activity */}
      <PayloadGrid cols={2} gap="md" className="payload-mt">
        <PayloadGridItem>
          <PayloadCard>
            <PayloadCardHeader>
              <PayloadCardTitle>
                <div className="payload-flex payload-flex--gap">
                  <TrendingUp style={{ width: '20px', height: '20px' }} />
                  Recent Click Activity
                </div>
              </PayloadCardTitle>
              <PayloadCardDescription>Latest affiliate link clicks</PayloadCardDescription>
            </PayloadCardHeader>
            <PayloadCardContent>
              <div>
                {recentClickLogs.slice(0, 5).map((log) => (
                  <div key={log.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    paddingBottom: 'calc(var(--base) / 2)',
                    marginBottom: 'calc(var(--base) / 2)',
                    borderBottom: '1px solid var(--theme-elevation-100)'
                  }}>
                    <div>
                      <p style={{
                        fontSize: 'var(--font-size-small)',
                        fontWeight: 'var(--font-weight-medium)',
                        margin: '0 0 calc(var(--base) / 4) 0'
                      }}>
                        {typeof log.affiliateUser === 'object' && log.affiliateUser?.email
                          ? log.affiliateUser.email
                          : 'Unknown User'}
                      </p>
                      <p style={{
                        fontSize: 'var(--font-size-small)',
                        color: 'var(--theme-elevation-600)',
                        margin: 0
                      }}>
                        {log.ip && `IP: ${log.ip}`}
                        {log.location && ` • ${log.location}`}
                      </p>
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--theme-elevation-600)'
                    }}>
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {recentClickLogs.length === 0 && (
                  <p style={{
                    fontSize: 'var(--font-size-small)',
                    color: 'var(--theme-elevation-600)',
                    margin: 0
                  }}>
                    No recent clicks
                  </p>
                )}
              </div>
            </PayloadCardContent>
          </PayloadCard>
        </PayloadGridItem>

        <PayloadGridItem>
          <PayloadCard>
            <PayloadCardHeader>
              <PayloadCardTitle>
                <div className="payload-flex payload-flex--gap">
                  <DollarSign style={{ width: '20px', height: '20px' }} />
                  Top Performing Affiliates
                </div>
              </PayloadCardTitle>
              <PayloadCardDescription>Based on revenue generated</PayloadCardDescription>
            </PayloadCardHeader>
            <PayloadCardContent>
              <div>
                {affiliateUsers
                  .map((user) => {
                    const userRevenue = affiliateOrders
                      .filter(order => {
                        if (typeof order.affiliate?.affiliateUser === 'object' && order.affiliate.affiliateUser) {
                          return order.affiliate.affiliateUser.id === user.id
                        }
                        return order.affiliate?.affiliateUser === user.id
                      })
                      .reduce((sum, order) => sum + (order.total || 0), 0)

                    return { user, revenue: userRevenue }
                  })
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 5)
                  .map(({ user, revenue }) => (
                    <div key={user.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      paddingBottom: 'calc(var(--base) / 2)',
                      marginBottom: 'calc(var(--base) / 2)',
                      borderBottom: '1px solid var(--theme-elevation-100)'
                    }}>
                      <div>
                        <p style={{
                          fontSize: 'var(--font-size-small)',
                          fontWeight: 'var(--font-weight-medium)',
                          margin: '0 0 calc(var(--base) / 4) 0'
                        }}>
                          {user.email}
                        </p>
                        <p style={{
                          fontSize: 'var(--font-size-small)',
                          color: 'var(--theme-elevation-600)',
                          margin: 0
                        }}>
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : 'No name provided'}
                        </p>
                      </div>
                      <div style={{
                        fontSize: 'var(--font-size-small)',
                        fontWeight: 'var(--font-weight-medium)'
                      }}>
                        ${revenue.toLocaleString()}
                      </div>
                    </div>
                  ))}
                {affiliateUsers.length === 0 && (
                  <p style={{
                    fontSize: 'var(--font-size-small)',
                    color: 'var(--theme-elevation-600)',
                    margin: 0
                  }}>
                    No affiliate users
                  </p>
                )}
              </div>
            </PayloadCardContent>
          </PayloadCard>
        </PayloadGridItem>
      </PayloadGrid>
    </div>
  )
}

export default DashboardTab
