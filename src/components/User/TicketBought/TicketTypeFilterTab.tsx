'use client'
import { TicketStatus } from '@/collections/Tickets/constants'
import React from 'react'

interface Props {
  typeFilter: TicketStatus | 'gifted'
  setTypeFilter: (val: TicketStatus | 'gifted') => void
  t: (key: string) => string
}

export const TicketTypeFilterTab: React.FC<Props> = ({ typeFilter, setTypeFilter, t }) => {
  return (
    <div className="flex gap-6 text-sm font-medium mb-4">
      {(['booked', 'cancelled', 'pending_payment'] as const).map((filter) => (
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
}
