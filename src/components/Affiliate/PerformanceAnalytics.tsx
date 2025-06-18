'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'

// Mock data - in real implementation, this would come from API
const mockAnalyticsData = {
  linkPerformance: [
    {
      id: '1',
      name: 'Summer Concert Series',
      utmSource: 'facebook',
      utmCampaign: 'summer-2024',
      clicks: 1247,
      orders: 89,
      ticketsIssued: 890,
      grossRevenue: 4450,
      netRevenue: 4005,
      conversionRate: 7.14,
      commission: 445,
    },
    {
      id: '2',
      name: 'Classical Nights',
      utmSource: 'instagram',
      utmCampaign: 'classical-nights',
      clicks: 892,
      orders: 56,
      ticketsIssued: 560,
      grossRevenue: 2800,
      netRevenue: 2520,
      conversionRate: 6.28,
      commission: 280,
    },
    {
      id: '3',
      name: 'Holiday Special',
      utmSource: 'newsletter',
      utmCampaign: 'holiday-2024',
      clicks: 634,
      orders: 41,
      ticketsIssued: 410,
      grossRevenue: 2050,
      netRevenue: 1845,
      conversionRate: 6.47,
      commission: 205,
    },
    {
      id: '4',
      name: 'Orchestra Gala',
      utmSource: 'google',
      utmCampaign: 'gala-2024',
      clicks: 456,
      orders: 23,
      ticketsIssued: 230,
      grossRevenue: 1150,
      netRevenue: 1035,
      conversionRate: 5.04,
      commission: 115,
    },
  ],
  revenueBreakdown: {
    bySource: [
      { source: 'facebook', revenue: 4450, percentage: 42.1 },
      { source: 'instagram', revenue: 2800, percentage: 26.5 },
      { source: 'newsletter', revenue: 2050, percentage: 19.4 },
      { source: 'google', revenue: 1150, percentage: 10.9 },
      { source: 'twitter', revenue: 120, percentage: 1.1 },
    ],
    byCampaign: [
      { campaign: 'summer-2024', revenue: 4450, percentage: 42.1 },
      { campaign: 'classical-nights', revenue: 2800, percentage: 26.5 },
      { campaign: 'holiday-2024', revenue: 2050, percentage: 19.4 },
      { campaign: 'gala-2024', revenue: 1150, percentage: 10.9 },
      { campaign: 'spring-promo', revenue: 120, percentage: 1.1 },
    ],
  },
}

type MetricsData = {
  clicks: string
  orders: string
  overallConversionRate: number
  ticketsIssued: string
  averageTicketsPerOrder: number
  grossRevenue: string
  commission: string
}

type PerformanceLinkData = {
  id: string
  name?: string
  utmSource?: string
  utmCampaign?: string
  clicks: string
  orders: string
  ticketsIssued: string
  conversionRate: number
  grossRevenue: string
  netRevenue: string
  commission: string
}

type PerformanceBreakdownData = PerformanceLinkData[]

type RevenueBreakdownData = {
  bySource: { source: string; revenue: string; percentage: number }[]
  byCampaign: { campaign: string; revenue: string; percentage: number }[]
}

export function PerformanceAnalytics() {
  const [timeRange, setTimeRange] = useState('30d')
  const [sortBy, setSortBy] = useState('revenue')
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null)
  const [performanceBreakdownData, setPerformanceBreakdownData] = useState<PerformanceBreakdownData | null>(null)
  const [revenueBreakdownData, setRevenueBreakdownData] = useState<RevenueBreakdownData | null>(null)

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await fetch(`/api/affiliate/analytics/performance?timeRange=${timeRange}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }

        const data = await response.json()
        console.log('Fetched analytics data:', data)
        setMetricsData(data.data)
      } catch (err) {
        console.error('Error fetching analytics data:', err)
      }
    }
    fetchPerformanceData()
  }, [timeRange])

  useEffect(() => {
    const fetchPerformanceBreakdown = async () => {
      try {
        const response = await fetch(`/api/affiliate/analytics/performance-breakdown?timeRange=${timeRange}&sortBy=${sortBy}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch performance breakdown')
        }

        const data = await response.json()
        setPerformanceBreakdownData(data.data)
        console.log('Fetched performance breakdown:', data)
      } catch (err) {
        console.error('Error fetching performance breakdown:', err)
      }
    }

    fetchPerformanceBreakdown()
  }, [timeRange, sortBy])

  useEffect(() => {
    const fetchRevenueBreakdown = async () => {
      try {
        const response = await fetch(`/api/affiliate/analytics/revenue?timeRange=${timeRange}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch revenue breakdown')
        }

        const data = await response.json()
        console.log('Fetched revenue breakdown:', data)
        setRevenueBreakdownData(data.data)
      } catch (err) {
        console.error('Error fetching revenue breakdown:', err)
      }
    }

    fetchRevenueBreakdown()
  }, [timeRange])

  const sortedData = [...mockAnalyticsData.linkPerformance].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.grossRevenue - a.grossRevenue
      case 'clicks':
        return b.clicks - a.clicks
      case 'orders':
        return b.orders - a.orders
      case 'conversion':
        return b.conversionRate - a.conversionRate
      default:
        return 0
    }
  })

  const totalMetrics = mockAnalyticsData.linkPerformance.reduce(
    (acc, link) => ({
      clicks: acc.clicks + link.clicks,
      orders: acc.orders + link.orders,
      ticketsIssued: acc.ticketsIssued + link.ticketsIssued,
      grossRevenue: acc.grossRevenue + link.grossRevenue,
      netRevenue: acc.netRevenue + link.netRevenue,
      commission: acc.commission + link.commission,
    }),
    { clicks: 0, orders: 0, ticketsIssued: 0, grossRevenue: 0, netRevenue: 0, commission: 0 }
  )

  const overallConversionRate = totalMetrics.clicks > 0 ? (totalMetrics.orders / totalMetrics.clicks) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Analytics
          </CardTitle>
          <CardDescription>
            Detailed breakdown of your affiliate link performance and revenue tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="clicks">Clicks</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="conversion">Conversion Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData?.clicks}</div>
            <p className="text-xs text-muted-foreground">Across all links</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData?.orders}</div>
            <p className="text-xs text-muted-foreground">Conversion rate: {metricsData?.overallConversionRate}%</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tickets Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData?.ticketsIssued}</div>
            <p className="text-xs text-muted-foreground">Avg {metricsData?.averageTicketsPerOrder} per order</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData?.grossRevenue} VND</div>
            <p className="text-xs text-muted-foreground">Before discounts</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metricsData?.commission} VND</div>
            <p className="text-xs text-muted-foreground">0% commission rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Link Performance Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Link Performance Breakdown</CardTitle>
          <CardDescription>Detailed metrics for each affiliate link</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link Name</TableHead>
                  <TableHead>Source/Campaign</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Tickets</TableHead>
                  <TableHead className="text-right">Conversion</TableHead>
                  <TableHead className="text-right">Gross Revenue</TableHead>
                  <TableHead className="text-right">Net Revenue</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceBreakdownData?.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {link.utmSource}
                        </Badge>
                        <div className="text-xs text-muted-foreground">{link.utmCampaign}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{link.clicks}</TableCell>
                    <TableCell className="text-right">{link.orders}</TableCell>
                    <TableCell className="text-right">{link.ticketsIssued}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{link.conversionRate}%</span>
                        {link.conversionRate >= 6 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{link.grossRevenue} VND</TableCell>
                    <TableCell className="text-right">{link.netRevenue} VND</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {link.commission} VND
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Revenue by Source</CardTitle>
            <CardDescription>Performance breakdown by traffic source</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenueBreakdownData?.bySource.map((item) => (
              <div key={item.source} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{item.source}</span>
                  <span className="text-sm text-muted-foreground">
                    ${item.revenue} ({item.percentage}%)
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Revenue by Campaign</CardTitle>
            <CardDescription>Performance breakdown by campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenueBreakdownData?.byCampaign.map((item) => (
              <div key={item.campaign} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.campaign}</span>
                  <span className="text-sm text-muted-foreground">
                    ${item.revenue} ({item.percentage}%)
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
