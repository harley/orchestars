'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Ticket } from 'lucide-react'
import { useEvents } from '@/app/(affiliate)/providers/Affiliate'

export function EventsList() {
  const { events } = useEvents()

  if (!events?.length) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Available Events</CardTitle>
          <CardDescription>No events available for affiliate promotion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              There are currently no events available for affiliate promotion.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Available Events</CardTitle>
            <CardDescription>
              {events.length} event{events.length !== 1 ? 's' : ''} available for affiliate promotion
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">{event.title || 'Untitled Event'}</h4>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
                <Badge variant={event.status === 'published_open_sales' ? 'default' : 'secondary'}>
                  {event.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {event.startDatetime && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.startDatetime).toLocaleDateString()}</span>
                  </div>
                )}
                {event.eventLocation && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{event.eventLocation}</span>
                  </div>
                )}
                {event.ticketPrices && event.ticketPrices.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Ticket className="h-4 w-4" />
                    <span>{event.ticketPrices.length} ticket type{event.ticketPrices.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {event.ticketPrices && event.ticketPrices.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.ticketPrices.slice(0, 3).map((price, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {price.name}: {price.currency} {price.price?.toLocaleString()}
                    </Badge>
                  ))}
                  {event.ticketPrices.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{event.ticketPrices.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
