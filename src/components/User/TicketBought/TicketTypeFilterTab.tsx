'use client'
import React from 'react'

interface Props {
  typeFilter: 'booked' | 'cancelled' | 'pending_payment' | 'gifted'
  setTypeFilter: (val: 'booked' | 'cancelled' | 'pending_payment' | 'gifted') => void
  t: (key: string) => string
}

export const TicketTypeFilterTab: React.FC<Props> = ({ typeFilter, setTypeFilter, t }) => (
  <div className="flex gap-6 text-sm font-medium mb-4">
    {(['booked', 'cancelled', 'pending_payment', 'gifted'] as const).map((filter) => (
      <button
        key={filter}
        className={`pb-1 border-b-2 ${typeFilter === filter ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent'}`}
        onClick={() => setTypeFilter(filter)}
      >
        {t(`userprofile.${filter}`)}
      </button>
    ))}
  </div>
)
