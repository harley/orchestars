'use client'

import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AffiliateSidebar } from '@/components/Affiliate/AffiliateSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AffiliateMetricsCard } from '@/components/Affiliate/AffiliateMetricsCard'
import { format as formatDate } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  Copy,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ProtectedRoute } from '@/components/Affiliate/ProtectedRoute'
import { formatMoney } from '@/utilities/formatMoney'
import useFetchData from '@/hooks/useFetchData'

export default function EventsPage() {
  const { toast } = useToast()
  const {
    data: dataEventCountByStatus,
    loading: loadingEventCountByStatus,
    // error: errorEventCountByStatus,
  } = useFetchData('/api/affiliate/event-by-status', { defaultLoading: true })

  const {
    data: dataEventMetrics,
    loading: loadingEventMetrics,
    // error: errorEventMetrics,
  } = useFetchData('/api/affiliate/event-metrics', { defaultLoading: true })

  const {
    data: dataPerformanceSummary,
    loading: loadingPerformanceSummary,
    // error: errorPerformanceSummary,
  } = useFetchData('/api/affiliate/performance-summary-by-events', { defaultLoading: true })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'Completed':
        return 'bg-gray-100 text-gray-800'
      case 'Unknown':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const copyAffiliateLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast({
      title: 'Link Copied',
      description: 'Affiliate link has been copied to your clipboard.',
    })
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
                    <h1 className="text-3xl font-bold tracking-tight">Events Analytics</h1>
                    <p className="text-muted-foreground">
                      Track performance across all events and affiliate links
                    </p>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <AffiliateMetricsCard
                      title="Total Events"
                      value={String(dataEventCountByStatus?.total || 0)}
                      icon={Calendar}
                      className="shadow-md"
                      loading={loadingEventCountByStatus}
                    />
                    <AffiliateMetricsCard
                      title="Tickets Sold"
                      value={String(dataEventMetrics?.ticketNumber || 0)}
                      icon={Users}
                      className="shadow-md"
                      loading={loadingEventMetrics}
                    />
                    <AffiliateMetricsCard
                      title="Gross Revenue"
                      value={formatMoney(dataEventMetrics?.grossRevenue || 0)}
                      icon={DollarSign}
                      className="shadow-md"
                      loading={loadingEventMetrics}
                    />
                    <AffiliateMetricsCard
                      title="Net Revenue"
                      value={formatMoney(dataEventMetrics?.netRevenue || 0)}
                      icon={TrendingUp}
                      className="shadow-md"
                      loading={loadingEventMetrics}
                    />
                  </div>

                  <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Performance Breakdown</h1>
                    <p className="text-muted-foreground">Track performance of each event</p>
                  </div>

                  {/* Main Content Tabs */}
                  {/* <Tabs defaultValue="events" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="events">Events List</TabsTrigger>
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                      <TabsTrigger value="categories">Categories</TabsTrigger>
                    </TabsList> */}

                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {loadingPerformanceSummary ? (
                        <div className="flex items-center justify-center h-48">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        (dataPerformanceSummary || []).map((event) => (
                          <Card key={event.eventID} className="shadow-md">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg">{event.eventName}</CardTitle>
                                    <Badge className={getStatusColor(event.eventStatus)}>
                                      {event.eventStatus}
                                    </Badge>
                                  </div>
                                  {/* <CardDescription>{event.description}</CardDescription> */}
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {event.schedules && event.schedules.length > 0 && (
                                        <span>
                                          {event.schedules.map((date) => (
                                            <span className="block w-20" key={date}>
                                              {formatDate(date, 'dd-MM-yyyy')}
                                            </span>
                                          ))}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {event.location}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-4"
                                    onClick={() => copyAffiliateLink(event.affLink)}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-4"
                                    onClick={() => {
                                      window.open(event.affLink, '_blank')
                                    }}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[repeat(6,1fr)_minmax(200px,auto)]">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Tickets Sold</p>
                                  <p className="text-lg font-bold">{event.ticketNum}</p>
                                  {/* <p className="text-xs text-muted-foreground">
                                      of {event.capacity} capacity */}
                                  {/* </p> */}
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Total Revenue</p>
                                  <p className="text-lg font-bold">
                                    {formatMoney(event.totalRevenue)}
                                  </p>
                                  {/* <p className="text-xs text-muted-foreground">
                                      Commission: {formatMoney(event.netRevenue * 0.1)}
                                    </p> */}
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Total Points</p>
                                  <p className="text-lg font-bold">{event.totalPoints}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Commission</p>
                                  <p className="text-lg font-bold">
                                    {formatMoney(event.commission)}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Tickets Reward</p>
                                  <p className="text-lg font-bold">{event.ticketsReward}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Clicks</p>
                                  <p className="text-lg font-bold">{event.clickNum}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Price Range</p>
                                  <p className="text-lg font-bold">
                                    {!event.minPrice && !event.maxPrice ? (
                                      'N/A'
                                    ) : (
                                      <>
                                        {formatMoney(event.minPrice)}-{formatMoney(event.maxPrice)}
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
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
