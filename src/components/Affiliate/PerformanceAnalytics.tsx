'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { BarChart3, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

type PerformanceData = {
  clicks: string
  orders: string
  overallConversionRate: number
  ticketsIssued: string
  averageTicketsPerOrder: number
  grossRevenue: string
  commission: string
  commissionRate: string
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

  // Pagination
  const [linkBreakdownPagination, setLinkBreakdownPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // Filters
  const [timeRange, setTimeRange] = useState('30d')
  const [sortBy, setSortBy] = useState('revenue')

  const fetchPerformanceData = async (page = 1) => {
    const params = new URLSearchParams({
      timeRange,
    })

    const response = await fetch(`/api/affiliate/analytics/performance?${params.toString()}`)
    const result: ApiResponse = await response.json()
    if (result.success) {
      setPerformanceData(result.data as PerformanceData)
    } else {
      throw new Error(result.error || 'Failed to fetch performance data')
    }
  }

  const fetchLinkBreakdownData = async (page = 1) => {
    const params = new URLSearchParams({
      timeRange,
      sortBy,
      page: page.toString(),
      limit: linkBreakdownPagination.limit.toString(),
    })

    const response = await fetch(`/api/affiliate/analytics/link-breakdown?${params.toString()}`)
    const result: ApiResponse = await response.json()
    if (result.success) {
      setLinkBreakdownData(result.data as LinkBreakdownData)
      setLinkBreakdownPagination(result.pagination as PaginationInfo)
    } else {
      throw new Error(result.error || 'Failed to fetch link breakdown data')
    }
  }

  const fetchSourceCampaignBreakdownData = async (page = 1) => {
    const params = new URLSearchParams({
      timeRange,
    })

    const response = await fetch(`/api/affiliate/analytics/source-campaign-breakdown?${params.toString()}`)
    const result: ApiResponse = await response.json()
    if (result.success) {
      setSourceCampaignBreakdownData(result.data as SourceCampaignBreakdownData)
    } else {
      throw new Error(result.error || 'Failed to fetch source/campaign breakdown data')
    }
  }

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchPerformanceData(),
        fetchLinkBreakdownData(),
        fetchSourceCampaignBreakdownData(),
      ])
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch initial data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const toggleTimeRange = async (value: string) => {
    try {
      setLoading(true)
      setTimeRange(value)

      await Promise.all([
        fetchPerformanceData(),
        fetchLinkBreakdownData(),
        fetchSourceCampaignBreakdownData(),
      ])
    } catch (error) {
      console.error('Error changing time range:', error)
      toast({
        title: 'Error',
        description: 'Failed to change time range',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSortBy = async (value: string) => {
    try {
      setLoading(true)
      setSortBy(value)
      await fetchLinkBreakdownData()
    } catch (error) {
      console.error('Error changing sort by:', error)
      toast({
        title: 'Error',
        description: 'Failed to change sort option',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    fetchLinkBreakdownData(newPage)
  }

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
              <Select value={timeRange} onValueChange={toggleTimeRange}>
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
              <Select value={sortBy} onValueChange={toggleSortBy}>
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
            <div className="text-2xl font-bold">
              {loading ? 'Loading...' : performanceData?.clicks}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? '' : `Across all links`}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? 'Loading...' : performanceData?.orders}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? '' : `Conversion Rate: ${performanceData?.overallConversionRate}%`}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tickets Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? 'Loading...' : performanceData?.ticketsIssued}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? '' : `Avg: ${performanceData?.averageTicketsPerOrder} per order`}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? 'Loading...' : `${performanceData?.grossRevenue} VND`}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? '' : `Before discounts`}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? 'Loading...' : `${performanceData?.commission} VND`}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? '' : `${performanceData?.commissionRate}% commission rate`}
            </p>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading affiliate links...
                    </TableCell>
                  </TableRow>
                ) : linkBreakdownData?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No affiliate links found
                      </TableCell>
                    </TableRow>
                ) : (
                  linkBreakdownData?.map((link) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {linkBreakdownPagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(linkBreakdownPagination.page - 1) * linkBreakdownPagination.limit + 1} to{' '}
                {Math.min(linkBreakdownPagination.page * linkBreakdownPagination.limit, linkBreakdownPagination.totalDocs)} of{' '}
                {linkBreakdownPagination.totalDocs} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(linkBreakdownPagination.page - 1)}
                  disabled={!linkBreakdownPagination.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {linkBreakdownPagination.page} of {linkBreakdownPagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(linkBreakdownPagination.page + 1)}
                  disabled={!linkBreakdownPagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
            { loading ? (
              <div className="text-center py-8">
                Loading revenue data...
              </div>
            ) : sourceCampaignBreakdownData?.bySource.length === 0 ? (
              <div className="text-center py-8">
                No traffic source found
              </div>
            ) : (
              sourceCampaignBreakdownData?.bySource.map((item) => (
              <div key={item.source} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{item.source}</span>
                  <span className="text-sm text-muted-foreground">
                    ${item.revenue} ({item.percentage}%)
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Revenue by Campaign</CardTitle>
            <CardDescription>Performance breakdown by campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                Loading campaign data...
              </div>
            ) : sourceCampaignBreakdownData?.byCampaign.length === 0 ? (
              <div className="text-center py-8">
                No campaign found
              </div>
            ) : (
              sourceCampaignBreakdownData?.byCampaign.map((item) => (
                <div key={item.campaign} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.campaign}</span>
                    <span className="text-sm text-muted-foreground">
                      ${item.revenue} ({item.percentage}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
