import React from 'react'
import { AffiliateMetricsCard } from '@/components/Affiliate/AffiliateMetricsCard'
import { DollarSign, TrendingUp, BarChart3, ShoppingBag } from 'lucide-react'
import { formatMoney } from '@/utilities/formatMoney'

interface RevenueSummaryCardsProps {
  metrics: {
    grossRevenue: number
    netRevenue: number
    avgOrderVal: number
    numOrder: number
  } | null
  loading: boolean
  error: boolean
  onReload: () => void
}

export const RevenueSummaryCards: React.FC<RevenueSummaryCardsProps> = ({
  metrics,
  loading,
  error: _error,
  onReload: _onReload,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <AffiliateMetricsCard
        title="Gross Revenue"
        value={formatMoney(metrics?.grossRevenue ?? 0)}
        // period="vs last period"
        icon={DollarSign}
        className="shadow-md"
        loading={loading}
      />
      <AffiliateMetricsCard
        title="Net Revenue"
        value={formatMoney(metrics?.netRevenue ?? 0)}
        // period="vs last period"
        icon={TrendingUp}
        className="shadow-md"
        loading={loading}
      />
      <AffiliateMetricsCard
        title="Total Orders"
        value={metrics?.numOrder ?? 0}
        icon={ShoppingBag}
        className="shadow-md"
        loading={loading}
      />
      <AffiliateMetricsCard
        title="Avg Order Value"
        value={formatMoney(metrics?.avgOrderVal ?? 0)}
        // period="vs last period"
        icon={BarChart3}
        className="shadow-md"
        loading={loading}
      />
    </div>
  )
}
