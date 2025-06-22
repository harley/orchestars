'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

type PerformanceData = {
  clicks: string
  orders: string
  overallConversionRate: number
  ticketsIssued: string
  averageTicketsPerOrder: number
  grossRevenue: string
  commission: string
}

type LinkBreakdownData = {
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
}[]

type SourceCampaignBreakdownData = {
  bySource: { source: string; revenue: string; percentage: number }[]
  byCampaign: { campaign: string; revenue: string; percentage: number }[]
}

type PaginationInfo = {
  page: number
  limit: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ApiResponse {
  success: boolean
  data: PerformanceData | LinkBreakdownData | SourceCampaignBreakdownData
  pagination?: PaginationInfo
  error?: string
}

export function PerformanceAnalytics() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  // Data
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [linkBreakdownData, setLinkBreakdownData] = useState<LinkBreakdownData | null>(null)
  const [sourceCampaignBreakdownData, setSourceCampaignBreakdownData] = useState<SourceCampaignBreakdownData | null>(null)

  // Filters
  const [timeRange, setTimeRange] = useState('30d')
  const [sortBy, setSortBy] = useState('revenue')

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      const [performanceResponse, linkBreakdownResponse, sourceCampaignBreakdownResponse] = await Promise.all([
        fetch(`/api/affiliate/analytics/performance?timeRange=${timeRange}`),
        fetch(`/api/affiliate/analytics/performance-breakdown?timeRange=${timeRange}&sortBy=${sortBy}`),
        fetch(`/api/affiliate/analytics/revenue?timeRange=${timeRange}`)
      ])

      if (!performanceResponse.ok || !linkBreakdownResponse.ok || !sourceCampaignBreakdownResponse.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const [performanceResult, linkBreakdownResult, sourceCampaignBreakdownResult]: [ApiResponse, ApiResponse, ApiResponse] = await Promise.all([
        performanceResponse.json(),
        linkBreakdownResponse.json(),
        sourceCampaignBreakdownResponse.json()
      ])

      if (performanceResult.success && linkBreakdownResult.success && sourceCampaignBreakdownResult.success) {
        setPerformanceData(performanceResult.data as PerformanceData)
        setLinkBreakdownData(linkBreakdownResult.data as LinkBreakdownData)
        setSourceCampaignBreakdownData(sourceCampaignBreakdownResult.data as SourceCampaignBreakdownData)
      } else {
        const errorMessage = performanceResult.error || linkBreakdownResult.error || sourceCampaignBreakdownResult.error || 'Failed to fetch analytics data'
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange, sortBy])

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
            <div className="text-2xl font-bold">{performanceData?.clicks}</div>
            <p className="text-xs text-muted-foreground">Across all links</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.orders}</div>
            <p className="text-xs text-muted-foreground">Conversion rate: {performanceData?.overallConversionRate}%</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tickets Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.ticketsIssued}</div>
            <p className="text-xs text-muted-foreground">Avg {performanceData?.averageTicketsPerOrder} per order</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.grossRevenue} VND</div>
            <p className="text-xs text-muted-foreground">Before discounts</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{performanceData?.commission} VND</div>
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
                {linkBreakdownData?.map((link) => (
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
            {sourceCampaignBreakdownData?.bySource.map((item) => (
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
            {sourceCampaignBreakdownData?.byCampaign.map((item) => (
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
