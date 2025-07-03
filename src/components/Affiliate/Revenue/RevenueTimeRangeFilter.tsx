import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface RevenueTimeRangeFilterProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export const RevenueTimeRangeFilter: React.FC<RevenueTimeRangeFilterProps> = ({ value, onChange, className }) => (
  <div className={className}>
    <label className="text-sm font-medium">Time Range</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectItem value="1m">Last Month</SelectItem>
        <SelectItem value="3m">Last 3 Months</SelectItem>
        <SelectItem value="6m">Last 6 Months</SelectItem>
        <SelectItem value="1y">Last Year</SelectItem>
      </SelectContent>
    </Select>
  </div>
) 