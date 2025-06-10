'use client'

import React, { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AffiliateSidebar } from '@/components/Affiliate/AffiliateSidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AffiliateMetricsCard } from '@/components/Affiliate/AffiliateMetricsCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, MousePointer, TrendingUp, Target, ShoppingCart, Eye, Ticket } from 'lucide-react'
import { ProtectedRoute } from '@/components/Affiliate/ProtectedRoute'

// Mock conversion data
const mockConversionData = {
  summary: {
    totalClicks: 28470,
    totalOrders: 1560,
    totalTicketsIssued: 15600,
    overallConversionRate: 5.48,
    uniqueVisitors: 18920,
    returningCustomers: 312,
    averageSessionDuration: 4.2,
  },
  conversionFunnel: [
    { stage: 'Clicks', count: 28470, percentage: 100, dropOff: 0 },
    { stage: 'Page Views', count: 24850, percentage: 87.3, dropOff: 12.7 },
    { stage: 'Add to Cart', count: 8940, percentage: 31.4, dropOff: 68.6 },
    { stage: 'Checkout Started', count: 3420, percentage: 12.0, dropOff: 88.0 },
    { stage: 'Payment Info', count: 2180, percentage: 7.7, dropOff: 92.3 },
    { stage: 'Orders Completed', count: 1560, percentage: 5.5, dropOff: 94.5 },
  ],
  conversionBySource: [
    { source: 'Facebook', clicks: 9850, orders: 712, rate: 7.23, quality: 'High' },
    { source: 'Instagram', clicks: 7420, orders: 445, rate: 6.0, quality: 'High' },
    { source: 'Newsletter', clicks: 5680, orders: 267, rate: 4.7, quality: 'Medium' },
    { source: 'Google Ads', clicks: 3240, orders: 97, rate: 2.99, quality: 'Low' },
    { source: 'Twitter', clicks: 1580, orders: 28, rate: 1.77, quality: 'Low' },
    { source: 'Direct', clicks: 700, orders: 11, rate: 1.57, quality: 'Low' },
  ],
  conversionByEvent: [
    { event: 'Summer Concert Series', clicks: 8920, orders: 634, rate: 7.11, revenue: 12450 },
    { event: 'Classical Nights', clicks: 6780, orders: 378, rate: 5.58, revenue: 8900 },
    { event: 'Holiday Special', clicks: 5240, orders: 267, rate: 5.1, revenue: 7200 },
    { event: 'Orchestra Gala', clicks: 3890, orders: 156, rate: 4.01, revenue: 6100 },
    { event: 'Spring Festival', clicks: 2340, orders: 89, rate: 3.8, revenue: 4800 },
    { event: 'Chamber Music', clicks: 1300, orders: 36, rate: 2.77, revenue: 3200 },
  ],
  conversionTrends: [
    { period: 'Week 1', clicks: 4200, orders: 245, rate: 5.83 },
    { period: 'Week 2', clicks: 4850, orders: 267, rate: 5.51 },
    { period: 'Week 3', clicks: 5120, orders: 289, rate: 5.64 },
    { period: 'Week 4', clicks: 4680, orders: 234, rate: 5.0 },
    { period: 'Week 5', clicks: 5340, orders: 312, rate: 5.84 },
    { period: 'Week 6', clicks: 4280, orders: 213, rate: 4.98 },
  ],
}

export default function ConversionsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [sortBy, setSortBy] = useState('rate')

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'High':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AffiliateSidebar />
          <SidebarInset className="flex-1">
            <div className="flex flex-col gap-4 p-4 pt-0">
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
                <div className="p-6">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Conversion Analytics</h1>
                    <p className="text-muted-foreground">
                      Track conversion rates, analyze user behavior, and optimize your affiliate
                      performance
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-4 mb-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time Range</label>
                      <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                        <SelectContent>
                          <SelectItem value="rate">Conversion Rate</SelectItem>
                          <SelectItem value="clicks">Total Clicks</SelectItem>
                          <SelectItem value="orders">Total Orders</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
                    <AffiliateMetricsCard
                      title="Total Clicks"
                      value={mockConversionData.summary.totalClicks.toLocaleString()}
                      change={8.2}
                      period="vs last period"
                      icon={MousePointer}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Total Orders"
                      value={mockConversionData.summary.totalOrders.toLocaleString()}
                      change={15.3}
                      period="vs last period"
                      icon={ShoppingCart}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Tickets Issued"
                      value={mockConversionData.summary.totalTicketsIssued.toLocaleString()}
                      change={18.9}
                      period="vs last period"
                      icon={Ticket}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Conversion Rate"
                      value={`${mockConversionData.summary.overallConversionRate}%`}
                      change={-2.1}
                      period="vs last period"
                      icon={Target}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Unique Visitors"
                      value={mockConversionData.summary.uniqueVisitors.toLocaleString()}
                      change={12.4}
                      period="vs last period"
                      icon={Users}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Returning Customers"
                      value={mockConversionData.summary.returningCustomers.toLocaleString()}
                      change={22.8}
                      period="vs last period"
                      icon={TrendingUp}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Avg Session (min)"
                      value={mockConversionData.summary.averageSessionDuration.toString()}
                      change={5.7}
                      period="vs last period"
                      icon={Eye}
                      className="shadow-md"
                    />
                  </div>

                  {/* Main Content Tabs */}
                  <Tabs defaultValue="funnel" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
                      <TabsTrigger value="sources">By Sources</TabsTrigger>
                      <TabsTrigger value="events">By Events</TabsTrigger>
                      <TabsTrigger value="trends">Trends</TabsTrigger>
                    </TabsList>

                    <TabsContent value="funnel" className="space-y-4">
                      <Card className="shadow-md">
                        <CardHeader>
                          <CardTitle>Conversion Funnel Analysis</CardTitle>
                          <CardDescription>
                            Track user journey from click to purchase
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {mockConversionData.conversionFunnel.map((stage, index) => (
                            <div key={stage.stage} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  <span className="text-sm font-medium">{stage.stage}</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">
                                    {stage.count.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {stage.percentage}% of total
                                    {index > 0 && (
                                      <span className="ml-2 text-red-600">
                                        -{stage.dropOff.toFixed(1)}% drop-off
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Progress value={stage.percentage} className="h-3" />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="sources" className="space-y-4">
                      <Card className="shadow-md">
                        <CardHeader>
                          <CardTitle>Conversion by Traffic Sources</CardTitle>
                          <CardDescription>Performance breakdown by traffic source</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Source</TableHead>
                                  <TableHead className="text-right">Clicks</TableHead>
                                  <TableHead className="text-right">Orders</TableHead>
                                  <TableHead className="text-right">Conversion Rate</TableHead>
                                  <TableHead className="text-center">Quality Score</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {mockConversionData.conversionBySource.map((source) => (
                                  <TableRow key={source.source}>
                                    <TableCell className="font-medium">{source.source}</TableCell>
                                    <TableCell className="text-right">
                                      {source.clicks.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">{source.orders}</TableCell>
                                    <TableCell className="text-right">
                                      <span
                                        className={`font-medium ${source.rate >= 5 ? 'text-green-600' : source.rate >= 3 ? 'text-yellow-600' : 'text-red-600'}`}
                                      >
                                        {source.rate.toFixed(2)}%
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Badge className={getQualityColor(source.quality)}>
                                        {source.quality}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="events" className="space-y-4">
                      <Card className="shadow-md">
                        <CardHeader>
                          <CardTitle>Conversion by Events</CardTitle>
                          <CardDescription>
                            Performance breakdown by event campaigns
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Event</TableHead>
                                  <TableHead className="text-right">Clicks</TableHead>
                                  <TableHead className="text-right">Orders</TableHead>
                                  <TableHead className="text-right">Conversion Rate</TableHead>
                                  <TableHead className="text-right">Revenue</TableHead>
                                  <TableHead className="text-right">Revenue per Click</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {mockConversionData.conversionByEvent.map((event) => (
                                  <TableRow key={event.event}>
                                    <TableCell className="font-medium">{event.event}</TableCell>
                                    <TableCell className="text-right">
                                      {event.clicks.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">{event.orders}</TableCell>
                                    <TableCell className="text-right">
                                      <span
                                        className={`font-medium ${event.rate >= 5 ? 'text-green-600' : event.rate >= 3 ? 'text-yellow-600' : 'text-red-600'}`}
                                      >
                                        {event.rate.toFixed(2)}%
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      ${event.revenue.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      ${(event.revenue / event.clicks).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="trends" className="space-y-4">
                      <Card className="shadow-md">
                        <CardHeader>
                          <CardTitle>Conversion Rate Trends</CardTitle>
                          <CardDescription>Weekly conversion performance over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Period</TableHead>
                                  <TableHead className="text-right">Clicks</TableHead>
                                  <TableHead className="text-right">Orders</TableHead>
                                  <TableHead className="text-right">Conversion Rate</TableHead>
                                  <TableHead className="text-right">Trend</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {mockConversionData.conversionTrends.map((trend, index) => {
                                  const prevRate =
                                    index > 0
                                      ? mockConversionData?.conversionTrends?.[index - 1]?.rate || 0
                                      : trend.rate
                                  const change = trend.rate - prevRate
                                  return (
                                    <TableRow key={trend.period}>
                                      <TableCell className="font-medium">{trend.period}</TableCell>
                                      <TableCell className="text-right">
                                        {trend.clicks.toLocaleString()}
                                      </TableCell>
                                      <TableCell className="text-right">{trend.orders}</TableCell>
                                      <TableCell className="text-right">
                                        <span
                                          className={`font-medium ${trend.rate >= 5.5 ? 'text-green-600' : trend.rate >= 5 ? 'text-yellow-600' : 'text-red-600'}`}
                                        >
                                          {trend.rate.toFixed(2)}%
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {index > 0 && (
                                          <span
                                            className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                          >
                                            {change >= 0 ? '+' : ''}
                                            {change.toFixed(2)}%
                                          </span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
