'use client'

import React, { useEffect, useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AffiliateSidebar } from '@/components/Affiliate/AffiliateSidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AffiliateMetricsCard } from '@/components/Affiliate/AffiliateMetricsCard'
import { format as formatDate } from 'date-fns'
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
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Star,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ProtectedRoute } from '@/components/Affiliate/ProtectedRoute'
import { formatMoney } from '@/utilities/formatMoney'

type eventByStatusItem = {
  upcoming: number
  active: number
  total: number
}
type eventMetrics = {
  ticketNumber: number
  grossRevenue: number
  netRevenue: number
}
type performanceSummaryItem = {
  eventID: number
  eventName: string
  location: string
  eventStatus: string
  totalPoints: number
  affLink: string
  ticketNum: number
  totalRevenue: number
  clickNum: number
  minPrice: number
  maxPrice: number
  schedules: Array<Date>
}
export default function EventsPage() {
  const { toast } = useToast()
  // const [statusFilter, setStatusFilter] = useState('all')
  // const [categoryFilter, setCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventCountByStatus, setEventCountByStatus] = useState<eventByStatusItem>({
    upcoming: 0,
    active: 0,
    total: 0,
  })
  const [eventMetrics, setEventMetrics] = useState<eventMetrics>({
    ticketNumber: 0,
    grossRevenue: 0,
    netRevenue: 0,
  })
  const [performanceSummary, setPerformanceSummary] = useState<performanceSummaryItem[]>([])

  useEffect(() => {
    //UseEffect structure and syntax
    const fetchEventMetrics = async () => {
      try {
        //Event count by status
        const resEventCountByStatus = await fetch(`/api/affiliate/event-by-status`)
        const dataEventCountByStatus = await resEventCountByStatus.json()
        setEventCountByStatus(dataEventCountByStatus)
        //Event metrics
        const resEventMetrics = await fetch(`/api/affiliate/event-metrics`)
        const dataEventMetrics = await resEventMetrics.json()
        console.log('Metrics:', dataEventMetrics)
        setEventMetrics(dataEventMetrics)
        //Performance summary
        const resPerformanceSummary = await fetch(`/api/affiliate/performance-summary-by-events`)
        const dataPerformanceSummary = await resPerformanceSummary.json()
        setPerformanceSummary(dataPerformanceSummary)
      } catch (err) {
        console.error('Failed to fetch metrics:', err)
        setError('Failed to load event metrics data')
      } finally {
        setLoading(false)
      }
    }
    fetchEventMetrics()
  }, [])

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

                  {/* Filters */}
                  {/* <div className="flex gap-4 mb-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Events</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="classical">Classical</SelectItem>
                          <SelectItem value="holiday">Holiday</SelectItem>
                          <SelectItem value="gala">Gala</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="chamber">Chamber</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div> */}

                  {/* Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <AffiliateMetricsCard
                      title="Total Events"
                      value={String(eventCountByStatus.total)}
                      change={20.0}
                      period="vs last period"
                      icon={Calendar}
                      className="shadow-md"
                    />
                    {/* <AffiliateMetricsCard
                      title="Active Events"
                      value={String(eventCountByStatus.active)}
                      change={14.3}
                      period="vs last period"
                      icon={Star}
                      className="shadow-md"
                    /> */}
                    <AffiliateMetricsCard
                      title="Tickets Sold"
                      value={String(eventMetrics.ticketNumber)}
                      change={15.3}
                      period="vs last period"
                      icon={Users}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Gross Revenue"
                      value={formatMoney(eventMetrics.grossRevenue)}
                      change={18.7}
                      period="vs last period"
                      icon={DollarSign}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Net Revenue"
                      value={formatMoney(eventMetrics.netRevenue)}
                      change={5.2}
                      period="vs last period"
                      icon={TrendingUp}
                      className="shadow-md"
                    />
                    {/* <AffiliateMetricsCard
                      title="Upcoming Events"
                      value={String(eventCountByStatus.upcoming)}
                      change={33.3}
                      period="vs last period"
                      icon={Clock}
                      className="shadow-md"
                    /> */}
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
                      {performanceSummary.map((event) => (
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
                                        {event.schedules
                                          .map((date) => formatDate(date, 'dd-MM-yyyy'))
                                          .join(', ')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {event.location}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyAffiliateLink(event.affLink)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
                                <p className="text-sm font-medium">Clicks</p>
                                <p className="text-lg font-bold">{event.clickNum}</p>
                              </div>
                              {/* <div className="space-y-1">
                                <p className="text-sm font-medium">Ticket conversion</p>
                                <p
                                  className={`text-lg font-bold ${event.conversionRate >= 5 ? 'text-green-600' : event.conversionRate >= 3 ? 'text-yellow-600' : 'text-red-600'}`}
                                >
                                  {event.conversionRate}%
                                </p>
                              </div> */}
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Price Range</p>
                                <p className="text-lg font-bold">
                                  {formatMoney(event.minPrice)}-{formatMoney(event.maxPrice)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* <TabsContent value="performance" className="space-y-4">
                      <Card className="shadow-md">
                        <CardHeader>
                          <CardTitle>Event Performance Comparison</CardTitle>
                          <CardDescription>
                            Compare performance metrics across all events
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Event</TableHead>
                                  <TableHead className="text-right">Tickets Sold</TableHead>
                                  <TableHead className="text-right">Revenue</TableHead>
                                  <TableHead className="text-right">Clicks</TableHead>
                                  <TableHead className="text-right">Conversion Rate</TableHead>
                                  <TableHead className="text-right">Revenue per Click</TableHead>
                                  <TableHead className="text-right">Commission</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {mockEventsData.events.map((event) => (
                                  <TableRow key={event.id}>
                                    <TableCell>
                                      <div className="space-y-1">
                                        <p className="font-medium">{event.title}</p>
                                        <Badge
                                          className={getStatusColor(event.status)}
                                          variant="outline"
                                        >
                                          {event.status}
                                        </Badge>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {event.ticketsSold}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      ${event.revenue.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {event.clicks.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <span
                                        className={`font-medium ${event.conversionRate >= 5 ? 'text-green-600' : event.conversionRate >= 3 ? 'text-yellow-600' : 'text-red-600'}`}
                                      >
                                        {event.conversionRate.toFixed(2)}%
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      ${(event.revenue / event.clicks).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-green-600">
                                      ${event.commission}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="categories" className="space-y-4">
                      <Card className="shadow-md">
                        <CardHeader>
                          <CardTitle>Performance by Category</CardTitle>
                          <CardDescription>Revenue breakdown by event categories</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {mockEventsData.categories.map((category) => (
                            <div key={category.name} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <span className="text-sm font-medium">{category.name}</span>
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {category.events} events
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      ${category.revenue.toLocaleString()}
                                    </Badge>
                                  </div>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {category.percentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${category.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs> */}
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
