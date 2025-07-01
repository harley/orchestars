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
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney } from '@/utilities/formatMoney'

type PerformanceData = {
  clicks: number
  orders: number
  overallConversionRate: number
  ticketsIssued: number
  averageTicketsPerOrder: number
  grossRevenue: number
  commission: number
  commissionRate: number
}

type LinkBreakdownData = {
  id: string
  name?: string
  utmSource?: string
  utmCampaign?: string
  clicks: number
  orders: number
  ticketsIssued: number
  conversionRate: number
  grossRevenue: number
  netRevenue: number
  commission: number
}[]

type SourceCampaignBreakdownData = {
  bySource: { source: string; revenue: number; percentage: number }[]
  byCampaign: { campaign: string; revenue: number; percentage: number }[]
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

  const fetchPerformanceData = async (timeRangeValue: string) => {
    const params = new URLSearchParams({
      timeRange: timeRangeValue,
    })

    const response = await fetch(`/api/affiliate/analytics/performance?${params.toString()}`)
    const result: ApiResponse = await response.json()
    if (result.success) {
      setPerformanceData(result.data as PerformanceData)
    } else {
      setPerformanceData(null)
      toast({
        title: 'Error',
        description: 'Failed to fetch some data',
        variant: 'destructive',
      })
    }
  }

  const fetchLinkBreakdownData = async (page = 1, timeRangeValue: string, sortByValue: string) => {
    const params = new URLSearchParams({
      timeRange: timeRangeValue,
      sortBy: sortByValue,
      page: page.toString(),
      limit: linkBreakdownPagination.limit.toString(),
    })

    const response = await fetch(`/api/affiliate/analytics/link-breakdown?${params.toString()}`)
    const result: ApiResponse = await response.json()
    if (result.success) {
      setLinkBreakdownData(result.data as LinkBreakdownData)
      setLinkBreakdownPagination(result.pagination as PaginationInfo)
    } else {
      toast({
        title: 'Error',
        description: 'Failed to fetch some data',
        variant: 'destructive',
      })
    }
  }

  const fetchSourceCampaignBreakdownData = async (timeRangeValue: string) => {
    const params = new URLSearchParams({
      timeRange: timeRangeValue,
    })

    const response = await fetch(`/api/affiliate/analytics/source-campaign-breakdown?${params.toString()}`)
    const result: ApiResponse = await response.json()
    if (result.success) {
      setSourceCampaignBreakdownData(result.data as SourceCampaignBreakdownData)
    } else {
      setSourceCampaignBreakdownData(null)
      toast({
        title: 'Error',
        description: 'Failed to fetch some data',
        variant: 'destructive',
      })
    }
  }

  const fetchInitialData = async () => {
    setLoading(true)
    await Promise.all([
      fetchPerformanceData(timeRange),
      fetchLinkBreakdownData(1, timeRange, sortBy),
      fetchSourceCampaignBreakdownData(timeRange),
    ])
    setLoading(false)
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const toggleTimeRange = async (value: string) => {
    setLoading(true)
    setTimeRange(value)
    await Promise.all([
      fetchPerformanceData(value),
      fetchLinkBreakdownData(linkBreakdownPagination.page, value, sortBy),
      fetchSourceCampaignBreakdownData(value),
    ])
    setLoading(false)
  }

  const toggleSortBy = async (value: string) => {
    setLoading(true)
    setSortBy(value)
    await fetchLinkBreakdownData(linkBreakdownPagination.page, timeRange, value)
    setLoading(false)
  }

  const handlePageChange = async (newPage: number) => {
    setLoading(true)
    await fetchLinkBreakdownData(newPage, timeRange, sortBy)
    setLoading(false)
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
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            {
              loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-gray-200" />
                  <Skeleton className="h-3 w-24 bg-gray-200" />
                </div>
              ) : !performanceData ? (
                <div className="text-center py-8">
                  Failed to load performance data
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {performanceData?.clicks.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {`Across all links`}
                  </p>
                </>
              )
            }
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {
              loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-gray-200" />
                  <Skeleton className="h-3 w-24 bg-gray-200" />
                </div>
              ) : !performanceData ? (
                <div className="text-center py-8">
                  Failed to load performance data
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {performanceData?.orders.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {`Conversion Rate: ${performanceData?.overallConversionRate.toLocaleString()}%`}
                  </p>
                </>
              )
            }
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tickets Issued</CardTitle>
          </CardHeader>
          <CardContent>
            {
              loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-gray-200" />
                  <Skeleton className="h-3 w-24 bg-gray-200" />
                </div>
              ) : !performanceData ? (
                <div className="text-center py-8">
                  Failed to load performance data
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {performanceData?.ticketsIssued.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {`Avg: ${performanceData?.averageTicketsPerOrder.toLocaleString()} per order`}
                  </p> 
                </>
              )
            }
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {
              loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-gray-200" />
                  <Skeleton className="h-3 w-24 bg-gray-200" />
                </div>
              ) : !performanceData ? (
                <div className="text-center py-8">
                  Failed to load performance data
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {`${formatMoney(performanceData?.grossRevenue ?? 0)}`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {`Before discounts`}
                  </p>
                </>
              )
            }
          </CardContent>
        </Card>
        {/* <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? 'Loading...' : `${formatMoney(performanceData?.commission ?? 0)}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? '' : `${performanceData?.commissionRate.toLocaleString()}% commission rate`}
            </p>
          </CardContent>
        </Card> */}
      </div>

      {/* Link Performance Table */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <CardTitle>Link Performance Breakdown</CardTitle>
            <CardDescription>Detailed metrics for each affiliate link</CardDescription>
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
                  {/* <TableHead className="text-right">Conversion</TableHead> */}
                  <TableHead className="text-right">Gross Revenue</TableHead>
                  {/* <TableHead className="text-right">Net Revenue</TableHead> */}
                  {/* <TableHead className="text-right">Commission</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="space-y-4">
                        <Skeleton className="h-7 w-full bg-gray-200" />
                        <Skeleton className="h-7 w-full bg-gray-200" />
                        <Skeleton className="h-7 w-full bg-gray-200" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : linkBreakdownData?.length === 0 || !linkBreakdownData ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
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
                      <TableCell className="text-right">{link.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{link.orders.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{link.ticketsIssued.toLocaleString()}</TableCell>
                      {/* <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span>{link.conversionRate.toLocaleString()}%</span>
                          {link.conversionRate >= 6 ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </TableCell> */}
                      <TableCell className="text-right">{formatMoney(link.grossRevenue)}</TableCell>
                      {/* <TableCell className="text-right">{formatMoney(link.netRevenue)} VND</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {link.commission.toLocaleString()} VND
                      </TableCell> */}
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
              <div className="flex flex-row justify-between">
                <Skeleton className="h-4 w-32 bg-gray-200" />
                <Skeleton className="h-4 w-24 bg-gray-200" />
              </div>
            ) : sourceCampaignBreakdownData?.bySource.length === 0 || !sourceCampaignBreakdownData ? (
              <div className="text-center py-8">
                No traffic source found
              </div>
            ) : (
              sourceCampaignBreakdownData?.bySource.map((item) => (
              <div key={item.source} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{item.source}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatMoney(item.revenue)} ({item.percentage.toLocaleString()}%)
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
              <div className="flex flex-row justify-between">
                <Skeleton className="h-4 w-32 bg-gray-200" />
                <Skeleton className="h-4 w-24 bg-gray-200" />
              </div>
            ) : sourceCampaignBreakdownData?.byCampaign.length === 0 || !sourceCampaignBreakdownData ? (
              <div className="text-center py-8">
                No campaign found
              </div>
            ) : (
              sourceCampaignBreakdownData?.byCampaign.map((item) => (
                <div key={item.campaign} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.campaign}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatMoney(item.revenue)} ({item.percentage.toLocaleString()}%)
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