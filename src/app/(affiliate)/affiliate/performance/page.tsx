'use client'

import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AffiliateSidebar } from '@/components/Affiliate/AffiliateSidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AffiliateMetricsCard } from '@/components/Affiliate/AffiliateMetricsCard'
import { DollarSign, Users, MousePointer, TrendingUp, Ticket } from 'lucide-react'
import { ProtectedRoute } from '@/components/Affiliate/ProtectedRoute'

export default function PerformancePage() {
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
                    <h1 className="text-3xl font-bold tracking-tight">Performance Overview</h1>
                    <p className="text-muted-foreground">
                      Monitor your affiliate performance metrics and trends
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
                    <AffiliateMetricsCard
                      title="Total Revenue"
                      value="$12,450"
                      change={12.5}
                      period="vs last month"
                      icon={DollarSign}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Total Clicks"
                      value="2,847"
                      change={8.2}
                      period="vs last month"
                      icon={MousePointer}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Total Orders"
                      value="156"
                      change={15.3}
                      period="vs last month"
                      icon={Users}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Tickets Issued"
                      value="1,560"
                      change={18.9}
                      period="vs last month"
                      icon={Ticket}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Conversion Rate"
                      value="5.48%"
                      change={-2.1}
                      period="vs last month"
                      icon={TrendingUp}
                      className="shadow-md"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="shadow-md">
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your latest affiliate activities</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                New order from Summer Concert link
                              </p>
                              <p className="text-xs text-muted-foreground">2 hours ago</p>
                            </div>
                            <span className="text-sm font-medium text-green-600">+$45</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                Click on Classical Nights campaign
                              </p>
                              <p className="text-xs text-muted-foreground">4 hours ago</p>
                            </div>
                            <span className="text-sm text-muted-foreground">Click</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">New order from Holiday Special</p>
                              <p className="text-xs text-muted-foreground">6 hours ago</p>
                            </div>
                            <span className="text-sm font-medium text-green-600">+$32</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-md">
                      <CardHeader>
                        <CardTitle>Top Performing Links</CardTitle>
                        <CardDescription>Your best converting affiliate links</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Summer Concert Series</p>
                              <p className="text-xs text-muted-foreground">7.14% conversion rate</p>
                            </div>
                            <span className="text-sm font-medium">$4,450</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Classical Nights</p>
                              <p className="text-xs text-muted-foreground">6.28% conversion rate</p>
                            </div>
                            <span className="text-sm font-medium">$2,800</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Holiday Special</p>
                              <p className="text-xs text-muted-foreground">6.47% conversion rate</p>
                            </div>
                            <span className="text-sm font-medium">$2,050</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
