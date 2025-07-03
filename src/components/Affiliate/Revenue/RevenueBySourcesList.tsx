import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export type RevenueBySource = {
  source: string
  gross: number
  net: number
  commission: number
  percentage: number
}

interface RevenueBySourcesListProps {
  sources: RevenueBySource[]
}

export const RevenueBySourcesList: React.FC<RevenueBySourcesListProps> = ({ sources }) => (
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle>Revenue by Traffic Sources</CardTitle>
      <CardDescription>Performance breakdown by traffic source</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {sources.map((source) => (
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
            <span className="text-sm text-muted-foreground">{source.percentage}%</span>
          </div>
          <Progress value={source.percentage} className="h-2" />
        </div>
      ))}
    </CardContent>
  </Card>
) 