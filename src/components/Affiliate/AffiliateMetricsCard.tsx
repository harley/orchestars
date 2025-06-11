'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utilities/ui'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface AffiliateMetricsCardProps {
  title: string
  value: string
  change: number
  period: string
  icon: LucideIcon
  className?: string
}

export function AffiliateMetricsCard({
  title,
  value,
  change,
  period,
  icon: Icon,
  className,
}: AffiliateMetricsCardProps) {
  const isPositive = change >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card className={cn('transition-all hover:shadow-lg', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <TrendIcon
            className={cn(
              'h-3 w-3',
              isPositive ? 'text-green-500' : 'text-red-500'
            )}
          />
          <span
            className={cn(
              'font-medium',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {isPositive ? '+' : ''}{change}%
          </span>
          <span>{period}</span>
        </div>
      </CardContent>
    </Card>
  )
}
