import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatMoney } from '@/utilities/formatMoney'

export type RevenueBySource = {
  source: string
  grossRevenue: number
  netRevenue: number
}

interface RevenueBySourcesListProps {
  sources: RevenueBySource[]
  totalGrossRevenue: number
}

export const RevenueBySourcesList: React.FC<RevenueBySourcesListProps> = ({
  sources,
  totalGrossRevenue,
}) => (
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle>Revenue by Traffic Sources</CardTitle>
      <CardDescription>Performance breakdown by traffic source</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {sources?.map((source: RevenueBySource) => (
        <div key={source.source} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium">{source.source}</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  Gross: {formatMoney(source.grossRevenue)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Net: {formatMoney(source.netRevenue)}
                </Badge>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {totalGrossRevenue
                ? Math.round((source.grossRevenue / totalGrossRevenue) * 100)
                : undefined}
              %
            </span>
          </div>
          <Progress
            value={
              totalGrossRevenue
                ? Math.round((source.grossRevenue / totalGrossRevenue) * 100)
                : undefined
            }
            className="h-2"
          />
        </div>
      ))}
    </CardContent>
  </Card>
)
