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
import { DollarSign, TrendingUp, Calendar, PieChart, BarChart3 } from 'lucide-react'
import { ProtectedRoute } from '@/components/Affiliate/ProtectedRoute'

// Mock revenue data
const mockRevenueData = {
  summary: {
    totalGrossRevenue: 45250,
    totalNetRevenue: 40725,
    totalCommission: 4525,
    averageOrderValue: 89.5,
    monthlyGrowth: 18.7,
  },
  monthlyRevenue: [
    { month: 'Jan 2024', gross: 3200, net: 2880, commission: 320, orders: 36, tickets: 360 },
    { month: 'Feb 2024', gross: 4100, net: 3690, commission: 410, orders: 42, tickets: 420 },
    { month: 'Mar 2024', gross: 3800, net: 3420, commission: 380, orders: 38, tickets: 380 },
    { month: 'Apr 2024', gross: 5200, net: 4680, commission: 520, orders: 58, tickets: 580 },
    { month: 'May 2024', gross: 6150, net: 5535, commission: 615, orders: 67, tickets: 670 },
    { month: 'Jun 2024', gross: 7300, net: 6570, commission: 730, orders: 81, tickets: 810 },
  ],
  revenueByEvent: [
    {
      event: 'Summer Concert Series',
      gross: 12450,
      net: 11205,
      commission: 1245,
      percentage: 27.5,
    },
    { event: 'Classical Nights', gross: 8900, net: 8010, commission: 890, percentage: 19.7 },
    { event: 'Holiday Special', gross: 7200, net: 6480, commission: 720, percentage: 15.9 },
    { event: 'Orchestra Gala', gross: 6100, net: 5490, commission: 610, percentage: 13.5 },
    { event: 'Spring Festival', gross: 4800, net: 4320, commission: 480, percentage: 10.6 },
    { event: 'Chamber Music Series', gross: 3200, net: 2880, commission: 320, percentage: 7.1 },
    { event: 'Youth Concert', gross: 2600, net: 2340, commission: 260, percentage: 5.7 },
  ],
  revenueBySource: [
    { source: 'Facebook', gross: 15200, net: 13680, commission: 1520, percentage: 33.6 },
    { source: 'Instagram', gross: 11800, net: 10620, commission: 1180, percentage: 26.1 },
    { source: 'Newsletter', gross: 8900, net: 8010, commission: 890, percentage: 19.7 },
    { source: 'Google Ads', gross: 5400, net: 4860, commission: 540, percentage: 11.9 },
    { source: 'Twitter', gross: 2450, net: 2205, commission: 245, percentage: 5.4 },
    { source: 'Direct', gross: 1500, net: 1350, commission: 135, percentage: 3.3 },
  ],
}

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState('6m')
  const [viewType, setViewType] = useState('gross')

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
                    <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
                    <p className="text-muted-foreground">
                      Track your affiliate revenue performance across all campaigns and events
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
                          <SelectItem value="1m">Last Month</SelectItem>
                          <SelectItem value="3m">Last 3 Months</SelectItem>
                          <SelectItem value="6m">Last 6 Months</SelectItem>
                          <SelectItem value="1y">Last Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">View Type</label>
                      <Select value={viewType} onValueChange={setViewType}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gross">Gross Revenue</SelectItem>
                          <SelectItem value="net">Net Revenue</SelectItem>
                          <SelectItem value="commission">Commission</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
                    <AffiliateMetricsCard
                      title="Gross Revenue"
                      value={`$${mockRevenueData.summary.totalGrossRevenue.toLocaleString()}`}
                      change={mockRevenueData.summary.monthlyGrowth}
                      period="vs last period"
                      icon={DollarSign}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Net Revenue"
                      value={`$${mockRevenueData.summary.totalNetRevenue.toLocaleString()}`}
                      change={15.2}
                      period="vs last period"
                      icon={TrendingUp}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Your Commission"
                      value={`$${mockRevenueData.summary.totalCommission.toLocaleString()}`}
                      change={18.7}
                      period="vs last period"
                      icon={PieChart}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Avg Order Value"
                      value={`$${mockRevenueData.summary.averageOrderValue}`}
                      change={5.3}
                      period="vs last period"
                      icon={BarChart3}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Commission Rate"
                      value="10%"
                      change={0}
                      period="standard rate"
                      icon={Calendar}
                      className="shadow-md"
                    />
                  </div>

                  {/* Main Content Tabs */}
                  <Tabs defaultValue="monthly" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
                      <TabsTrigger value="events">By Events</TabsTrigger>
                      <TabsTrigger value="sources">By Sources</TabsTrigger>
                      <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                    </TabsList>

                    <TabsContent value="monthly" className="space-y-4">
                      <Card className="shadow-md">
                        <CardHeader>
                          <CardTitle>Monthly Revenue Trends</CardTitle>
                          <CardDescription>
                            Revenue performance over the last 6 months
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Month</TableHead>
                                  <TableHead className="text-right">Gross Revenue</TableHead>
                                  <TableHead className="text-right">Net Revenue</TableHead>
                                  <TableHead className="text-right">Commission</TableHead>
                                  <TableHead className="text-right">Orders</TableHead>
                                  <TableHead className="text-right">Tickets</TableHead>
                                  <TableHead className="text-right">Avg Order Value</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {mockRevenueData.monthlyRevenue.map((month) => (
                                  <TableRow key={month.month}>
                                    <TableCell className="font-medium">{month.month}</TableCell>
                                    <TableCell className="text-right">
                                      ${month.gross.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      ${month.net.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-green-600">
                                      ${month.commission.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">{month.orders}</TableCell>
                                    <TableCell className="text-right">{month.tickets}</TableCell>
                                    <TableCell className="text-right">
                                      ${(month.gross / month.orders).toFixed(2)}
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
                          <CardTitle>Revenue by Events</CardTitle>
                          <CardDescription>
                            Performance breakdown by event campaigns
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {mockRevenueData.revenueByEvent.map((event) => (
                            <div key={event.event} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <span className="text-sm font-medium">{event.event}</span>
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      Gross: ${event.gross.toLocaleString()}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      Commission: ${event.commission.toLocaleString()}
                                    </Badge>
                                  </div>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {event.percentage}%
                                </span>
                              </div>
                              <Progress value={event.percentage} className="h-2" />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="sources" className="space-y-4">
                      <Card className="shadow-md">
                        <CardHeader>
                          <CardTitle>Revenue by Traffic Sources</CardTitle>
                          <CardDescription>Performance breakdown by traffic source</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {mockRevenueData.revenueBySource.map((source) => (
                            <div key={source.source} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <span className="text-sm font-medium">{source.source}</span>
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      Gross: ${source.gross.toLocaleString()}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      Commission: ${source.commission.toLocaleString()}
                                    </Badge>
                                  </div>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {source.percentage}%
                                </span>
                              </div>
                              <Progress value={source.percentage} className="h-2" />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="breakdown" className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card className="shadow-md">
                          <CardHeader>
                            <CardTitle>Revenue Composition</CardTitle>
                            <CardDescription>Breakdown of revenue components</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Gross Revenue</span>
                              <span className="text-sm">
                                ${mockRevenueData.summary.totalGrossRevenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Discounts Applied</span>
                              <span className="text-sm text-red-600">
                                -$
                                {(
                                  mockRevenueData.summary.totalGrossRevenue -
                                  mockRevenueData.summary.totalNetRevenue
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Net Revenue</span>
                              <span className="text-sm">
                                ${mockRevenueData.summary.totalNetRevenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between border-t pt-2">
                              <span className="text-sm font-semibold">Your Commission (10%)</span>
                              <span className="text-sm font-semibold text-green-600">
                                ${mockRevenueData.summary.totalCommission.toLocaleString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="shadow-md">
                          <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                            <CardDescription>Key performance indicators</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Total Orders</span>
                              <span className="text-sm">506</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Average Order Value</span>
                              <span className="text-sm">
                                ${mockRevenueData.summary.averageOrderValue}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Revenue per Click</span>
                              <span className="text-sm">$15.89</span>
                            </div>
                            <div className="flex items-center justify-between border-t pt-2">
                              <span className="text-sm font-semibold">Commission per Order</span>
                              <span className="text-sm font-semibold text-green-600">
                                ${(mockRevenueData.summary.totalCommission / 506).toFixed(2)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
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
