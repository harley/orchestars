'use client'

import React from 'react'
import { AffiliateMetricsCard } from './AffiliateMetricsCard'
import { PerformanceAnalytics } from './PerformanceAnalytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, MousePointer, TrendingUp, Link2, Calendar, Ticket } from 'lucide-react'

// Mock data - in real implementation, this would come from API
const mockMetrics = {
  totalRevenue: {
    value: 12450,
    change: 12.5,
    period: 'vs last month',
  },
  totalClicks: {
    value: 2847,
    change: 8.2,
    period: 'vs last month',
  },
  totalOrders: {
    value: 156,
    change: 15.3,
    period: 'vs last month',
  },
  totalTicketsIssued: {
    value: 1560,
    change: 18.9,
    period: 'vs last month',
  },
  conversionRate: {
    value: 5.48,
    change: -2.1,
    period: 'vs last month',
  },
  activeLinks: {
    value: 23,
    change: 4.3,
    period: 'vs last month',
  },
  thisMonthRevenue: {
    value: 3250,
    change: 18.7,
    period: 'vs last month',
  },
}

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AffiliateMetricsCard
          title="Total Revenue"
          value={`$${mockMetrics.totalRevenue.value.toLocaleString()}`}
          change={mockMetrics.totalRevenue.change}
          period={mockMetrics.totalRevenue.period}
          icon={DollarSign}
          className="shadow-md"
        />
        <AffiliateMetricsCard
          title="Total Clicks"
          value={mockMetrics.totalClicks.value.toLocaleString()}
          change={mockMetrics.totalClicks.change}
          period={mockMetrics.totalClicks.period}
          icon={MousePointer}
          className="shadow-md"
        />
        <AffiliateMetricsCard
          title="Total Orders"
          value={mockMetrics.totalOrders.value.toLocaleString()}
          change={mockMetrics.totalOrders.change}
          period={mockMetrics.totalOrders.period}
          icon={Users}
          className="shadow-md"
        />
        <AffiliateMetricsCard
          title="Tickets Issued"
          value={mockMetrics.totalTicketsIssued.value.toLocaleString()}
          change={mockMetrics.totalTicketsIssued.change}
          period={mockMetrics.totalTicketsIssued.period}
          icon={Ticket}
          className="shadow-md"
        />
        <AffiliateMetricsCard
          title="Conversion Rate"
          value={`${mockMetrics.conversionRate.value}%`}
          change={mockMetrics.conversionRate.change}
          period={mockMetrics.conversionRate.period}
          icon={TrendingUp}
          className="shadow-md"
        />
        <AffiliateMetricsCard
          title="Active Links"
          value={mockMetrics.activeLinks.value.toLocaleString()}
          change={mockMetrics.activeLinks.change}
          period={mockMetrics.activeLinks.period}
          icon={Link2}
          className="shadow-md"
        />
        <AffiliateMetricsCard
          title="This Month"
          value={`$${mockMetrics.thisMonthRevenue.value.toLocaleString()}`}
          change={mockMetrics.thisMonthRevenue.change}
          period={mockMetrics.thisMonthRevenue.period}
          icon={Calendar}
          className="shadow-md"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Recent Performance</CardTitle>
                <CardDescription>Your affiliate performance over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Gross Revenue</span>
                    <span className="text-sm text-muted-foreground">$12,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Net Revenue</span>
                    <span className="text-sm text-muted-foreground">$11,205</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Tickets Issued</span>
                    <span className="text-sm text-muted-foreground">1,560</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Commission Rate</span>
                    <span className="text-sm text-muted-foreground">10%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Your Earnings</span>
                    <span className="text-sm font-semibold text-green-600">$1,245</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Top Performing Links</CardTitle>
                <CardDescription>Your best performing affiliate links this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Summer Concert Series</p>
                      <p className="text-xs text-muted-foreground">orchestars.com/events/summer-2024</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">$450</p>
                      <p className="text-xs text-muted-foreground">23 orders • 230 tickets</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Classical Nights</p>
                      <p className="text-xs text-muted-foreground">orchestars.com/events/classical-nights</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">$320</p>
                      <p className="text-xs text-muted-foreground">16 orders • 160 tickets</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Holiday Special</p>
                      <p className="text-xs text-muted-foreground">orchestars.com/events/holiday-2024</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">$275</p>
                      <p className="text-xs text-muted-foreground">12 orders • 120 tickets</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <PerformanceAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
