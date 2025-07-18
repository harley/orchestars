import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatMoney } from '@/utilities/formatMoney'

export type RevenueByEvent = {
  eventID: number
  eventTitle: string
  grossRevenue: number
  netRevenue: number
}

interface RevenueByEventsListProps {
  events: RevenueByEvent[]
  totalGrossRevenue: number
}

export const RevenueByEventsList: React.FC<RevenueByEventsListProps> = ({
  events,
  totalGrossRevenue,
}) => (
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle>Revenue by Events</CardTitle>
      <CardDescription>Performance breakdown by event campaigns</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {events && events.length > 0 ? (
        events.map((event: RevenueByEvent) => {
          const percentage =
            totalGrossRevenue > 0 ? Math.round((event.grossRevenue / totalGrossRevenue) * 100) : 0
          return (
            <div key={event.eventID} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-medium">{event.eventTitle}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      Gross Revenue: {formatMoney(event.grossRevenue)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Net: {formatMoney(event.netRevenue)}
                    </Badge>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          )
        })
      ) : (
        <div>An error occurred. Please reload</div>
      )}
    </CardContent>
  </Card>
)
