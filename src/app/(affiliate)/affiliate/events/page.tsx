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

// Mock events data
const mockEventsData = {
  summary: {
    totalEvents: 12,
    activeEvents: 8,
    upcomingEvents: 4,
    totalTicketsSold: 1560,
    totalRevenue: 45250,
    averageTicketPrice: 89.5,
  },
  events: [
    {
      id: '1',
      title: 'Summer Concert Series',
      date: '2024-07-15',
      time: '19:30',
      venue: 'Symphony Hall',
      status: 'active',
      ticketsSold: 634,
      revenue: 12450,
      clicks: 8920,
      conversionRate: 7.11,
      commission: 1245,
      category: 'Classical',
      capacity: 800,
      priceRange: '$45 - $120',
      description: 'An enchanting evening of classical music featuring renowned orchestral pieces.',
    },
    {
      id: '2',
      title: 'Classical Nights',
      date: '2024-08-22',
      time: '20:00',
      venue: 'Opera House',
      status: 'active',
      ticketsSold: 378,
      revenue: 8900,
      clicks: 6780,
      conversionRate: 5.58,
      commission: 890,
      category: 'Classical',
      capacity: 600,
      priceRange: '$35 - $95',
      description: 'Experience the beauty of classical music in an intimate setting.',
    },
    {
      id: '3',
      title: 'Holiday Special',
      date: '2024-12-20',
      time: '18:00',
      venue: 'Grand Theater',
      status: 'upcoming',
      ticketsSold: 267,
      revenue: 7200,
      clicks: 5240,
      conversionRate: 5.1,
      commission: 720,
      category: 'Holiday',
      capacity: 1000,
      priceRange: '$25 - $85',
      description: 'Celebrate the holidays with festive orchestral performances.',
    },
    {
      id: '4',
      title: 'Orchestra Gala',
      date: '2024-09-10',
      time: '19:00',
      venue: 'Concert Hall',
      status: 'active',
      ticketsSold: 156,
      revenue: 6100,
      clicks: 3890,
      conversionRate: 4.01,
      commission: 610,
      category: 'Gala',
      capacity: 500,
      priceRange: '$75 - $200',
      description: 'An elegant gala evening featuring world-class orchestral performances.',
    },
    {
      id: '5',
      title: 'Spring Festival',
      date: '2024-05-18',
      time: '17:30',
      venue: 'Outdoor Pavilion',
      status: 'completed',
      ticketsSold: 89,
      revenue: 4800,
      clicks: 2340,
      conversionRate: 3.8,
      commission: 480,
      category: 'Festival',
      capacity: 1200,
      priceRange: '$30 - $70',
      description: 'Outdoor spring festival celebrating music and nature.',
    },
    {
      id: '6',
      title: 'Chamber Music Series',
      date: '2024-06-25',
      time: '19:30',
      venue: 'Intimate Hall',
      status: 'completed',
      ticketsSold: 36,
      revenue: 3200,
      clicks: 1300,
      conversionRate: 2.77,
      commission: 320,
      category: 'Chamber',
      capacity: 150,
      priceRange: '$55 - $110',
      description: 'Intimate chamber music performances in a cozy setting.',
    },
  ],
  categories: [
    { name: 'Classical', events: 4, revenue: 21350, percentage: 47.2 },
    { name: 'Holiday', events: 2, revenue: 7200, percentage: 15.9 },
    { name: 'Gala', events: 2, revenue: 6100, percentage: 13.5 },
    { name: 'Festival', events: 2, revenue: 4800, percentage: 10.6 },
    { name: 'Chamber', events: 2, revenue: 3200, percentage: 7.1 },
  ],
}

export default function EventsPage() {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredEvents = mockEventsData.events.filter((event) => {
    const statusMatch = statusFilter === 'all' || event.status === statusFilter
    const categoryMatch =
      categoryFilter === 'all' || event.category.toLowerCase() === categoryFilter
    return statusMatch && categoryMatch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const generateAffiliateLink = (eventId: string, eventTitle: string) => {
    const baseUrl = `${window.location.origin}/events/${eventId}`
    const utmParams = new URLSearchParams({
      utm_source: 'affiliate',
      utm_medium: 'affiliate_link',
      utm_campaign: eventTitle.toLowerCase().replace(/\s+/g, '-'),
      utm_content: 'event_page',
    })
    return `${baseUrl}?${utmParams.toString()}`
  }

  const copyAffiliateLink = (eventId: string, eventTitle: string) => {
    const link = generateAffiliateLink(eventId, eventTitle)
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
                      Track performance across all events and generate affiliate links for specific
                      events
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-4 mb-6">
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
                  </div>

                  {/* Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-8">
                    <AffiliateMetricsCard
                      title="Total Events"
                      value={mockEventsData.summary.totalEvents.toString()}
                      change={20.0}
                      period="vs last period"
                      icon={Calendar}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Active Events"
                      value={mockEventsData.summary.activeEvents.toString()}
                      change={14.3}
                      period="vs last period"
                      icon={Star}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Tickets Sold"
                      value={mockEventsData.summary.totalTicketsSold.toLocaleString()}
                      change={15.3}
                      period="vs last period"
                      icon={Users}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Total Revenue"
                      value={`$${mockEventsData.summary.totalRevenue.toLocaleString()}`}
                      change={18.7}
                      period="vs last period"
                      icon={DollarSign}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Avg Ticket Price"
                      value={`$${mockEventsData.summary.averageTicketPrice}`}
                      change={5.2}
                      period="vs last period"
                      icon={TrendingUp}
                      className="shadow-md"
                    />
                    <AffiliateMetricsCard
                      title="Upcoming Events"
                      value={mockEventsData.summary.upcomingEvents.toString()}
                      change={33.3}
                      period="vs last period"
                      icon={Clock}
                      className="shadow-md"
                    />
                  </div>

                  {/* Main Content Tabs */}
                  <Tabs defaultValue="events" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="events">Events List</TabsTrigger>
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                      <TabsTrigger value="categories">Categories</TabsTrigger>
                    </TabsList>

                    <TabsContent value="events" className="space-y-4">
                      <div className="grid gap-4">
                        {filteredEvents.map((event) => (
                          <Card key={event.id} className="shadow-md">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg">{event.title}</CardTitle>
                                    <Badge className={getStatusColor(event.status)}>
                                      {event.status}
                                    </Badge>
                                    <Badge variant="outline">{event.category}</Badge>
                                  </div>
                                  <CardDescription>{event.description}</CardDescription>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {new Date(event.date).toLocaleDateString()} at {event.time}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {event.venue}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyAffiliateLink(event.id, event.title)}
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
                                  <p className="text-lg font-bold">{event.ticketsSold}</p>
                                  <p className="text-xs text-muted-foreground">
                                    of {event.capacity} capacity
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Revenue</p>
                                  <p className="text-lg font-bold">
                                    ${event.revenue.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Commission: ${event.commission}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Clicks</p>
                                  <p className="text-lg font-bold">
                                    {event.clicks.toLocaleString()}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Conversion</p>
                                  <p
                                    className={`text-lg font-bold ${event.conversionRate >= 5 ? 'text-green-600' : event.conversionRate >= 3 ? 'text-yellow-600' : 'text-red-600'}`}
                                  >
                                    {event.conversionRate.toFixed(2)}%
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Price Range</p>
                                  <p className="text-lg font-bold">{event.priceRange}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Capacity</p>
                                  <p className="text-lg font-bold">
                                    {((event.ticketsSold / event.capacity) * 100).toFixed(1)}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">filled</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4">
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
