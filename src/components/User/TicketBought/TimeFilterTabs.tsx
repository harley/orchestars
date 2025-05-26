'use client'
import React from 'react'

interface Props {
  timeFilter: 'upcoming' | 'finished'
  setTimeFilter: (val: 'upcoming' | 'finished') => void
  t: (key: string) => string
}

export const TimeFilterTabs: React.FC<Props> = ({ timeFilter, setTimeFilter, t }) => (
  <div className="flex gap-6 text-sm font-medium mb-4">
    {(['upcoming', 'finished'] as const).map((filter) => (
      <button
        key={filter}
        className={`pb-1 border-b-2 ${timeFilter === filter ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent'}`}
        onClick={() => setTimeFilter(filter)}
      >
        {t(`userprofile.${filter}`)}
      </button>
    ))}
  </div>
)