import React from 'react'
import { AffiliateMetricsCard } from '@/components/Affiliate/AffiliateMetricsCard'
import { DollarSign, TrendingUp, BarChart3, ShoppingBag, RefreshCw, AlertCircle } from 'lucide-react'
import { formatMoney } from '@/utilities/formatMoney'
import { Button } from '@/components/ui/button'

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
  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-1 mb-8">
        <div className="flex items-center justify-center p-8 border border-red-200 rounded-lg bg-red-50">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load revenue data</h3>
            <p className="text-red-600 mb-4">There was an error loading your revenue metrics. Please try again.</p>
            <Button 
              onClick={onReload} 
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

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
