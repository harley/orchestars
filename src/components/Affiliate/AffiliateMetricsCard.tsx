'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utilities/ui'
import { LucideIcon } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'

interface AffiliateMetricsCardProps {
  title: string
  value: string | number
  change?: number
  period?: string
  icon: LucideIcon
  className?: string
  loading?: boolean
  description?: string
}

export function AffiliateMetricsCard({
  title,
  value,
  // change,
  // period,
  icon: Icon,
  className,
  loading,
  description,
}: AffiliateMetricsCardProps) {
  // const isPositive = change >= 0
  // const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card className={cn('transition-all hover:shadow-lg', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-4 max-w-[200px] rounded-xl bg-black/10 mb-2" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {/* {loading ? (
          <Skeleton className="h-4 w-full rounded-xl bg-black/10" />
        ) : (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <TrendIcon className={cn('h-3 w-3', isPositive ? 'text-green-500' : 'text-red-500')} />
            <span className={cn('font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
              {isPositive ? '+' : ''}
              {change}%
            </span>
            <span>{period}</span>
          </div>
        )} */}
        {description && <p className="text-xs text-muted-foreground italic">{description}</p>}
      </CardContent>
    </Card>
  )
}
