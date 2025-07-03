'use client'
import React, { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AffiliateSidebar } from '@/components/Affiliate/AffiliateSidebar'

import { ProtectedRoute } from '@/components/Affiliate/ProtectedRoute'
import useFetchData from './hooks/useFetchData'
// import { RevenueTimeRangeFilter } from '@/components/Affiliate/Revenue/RevenueTimeRangeFilter'
import { RevenueSummaryCards } from '@/components/Affiliate/Revenue/RevenueSummaryCards'
import { RevenueMonthlyTable } from '@/components/Affiliate/Revenue/RevenueMonthlyTable'
// import { RevenueByEventsList } from '@/components/Affiliate/Revenue/RevenueByEventsList'
// import { RevenueBySourcesList } from '@/components/Affiliate/Revenue/RevenueBySourcesList'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { BarChart3 } from 'lucide-react'


export default function RevenuePage() {
  //Default time range is 6 month
  const [timeRange, setTimeRange] = useState('6m')

  // API endpoints with dynamic timeRange
  const {
    data: revenueCardMetrics,
    loading: loadingMetrics,
    error: errorMetrics,
    refetch: refetchMetrics,
  } = useFetchData(`/api/affiliate/revenue-card-metrics?timeRange=${timeRange}`, {
    defaultLoading: true,
  })

  const {
    data: monthlyRevenueData,
    loading: loadingMonthly,
    // error: errorMonthly,
    // refetch: refetchMonthly,
  } = useFetchData(`/api/affiliate/revenue-monthly-trends?timeRange=${timeRange}`, {
    defaultLoading: true,
  })

  // const {
  //   data: revenueByEvents,
  //   loading: loadingEventsRev,
  //   error: errorEventsRev,
  //   refetch: refetchEventsRev,
  // } = useFetchData(`/api/affiliate/revenue-by-events?timeRange=${timeRange}`)

  // const {
  //   data: totalClick,
  //   loading: loadingClicks,
  //   error: errorClicks,
  // } = useFetchData(`/api/affiliate/total-click?timeRange=${timeRange}`)

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
                  {/* <div className="flex gap-4 mb-6">
                    <RevenueTimeRangeFilter value={timeRange} onChange={setTimeRange} />
                  </div> */}

                  {/* Summary Cards */}
                  <RevenueSummaryCards
                    metrics={revenueCardMetrics}
                    loading={loadingMetrics}
                    error={!!errorMetrics}
                    onReload={refetchMetrics}
                  />

                  <div className="mt-20">
                    <h2 className="text-2xl font-bold tracking-tight">
                      Revenue By Categories
                    </h2>

                    <Accordion
                      type="single"
                      collapsible
                      className="w-full"
                      defaultValue="monthly-trends"
                    >
                      <AccordionItem value="monthly-trends">
                        <AccordionTrigger className="text-lg font-semibold tracking-wide text-primary hover:text-accent-foreground transition-colors duration-200 py-3 px-4 rounded-md bg-muted/30 hover:bg-muted/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 mr-1" />
                          Monthly Revenue Trends
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                          <RevenueMonthlyTable
                            monthlyRevenue={monthlyRevenueData?.monthlyRevenue ?? []}
                            loading={loadingMonthly}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      {/* <AccordionItem value="revenue-by-events">
                        <AccordionTrigger className="text-lg font-semibold tracking-wide text-primary hover:text-accent-foreground transition-colors duration-200 py-3 px-4 rounded-md bg-muted/30 hover:bg-muted/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2">
                          <Calendar className="w-5 h-5 mr-1" />
                          Revenue by Events
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                          {revenueByEvents && revenueCardMetrics && (
                            <RevenueByEventsList
                              events={revenueByEvents}
                              totalGrossRevenue={revenueCardMetrics.grossRevenue}
                            />
                          )}
                        </AccordionContent>
                      </AccordionItem> */}
                      {/* <AccordionItem value="revenue-by-sources">
                        <AccordionTrigger className="text-lg font-semibold tracking-wide text-primary hover:text-accent-foreground transition-colors duration-200 py-3 px-4 rounded-md bg-muted/30 hover:bg-muted/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2">
                          <MousePointer className="w-5 h-5 mr-1" />
                          Revenue by Traffic Sources
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                          <RevenueBySourcesList sources={mockRevenueData.revenueBySource} />
                        </AccordionContent>
                      </AccordionItem> */}
                    </Accordion>
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
