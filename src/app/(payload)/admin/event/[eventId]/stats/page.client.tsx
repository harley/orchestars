'use client'

import React from 'react'
import { Event } from '../types'
import CheckinStats from '../components/CheckinStats'
import Link from 'next/link'

interface Props {
  event: Event
  eventId: string
}

const StatsPageClient: React.FC<Props> = ({ event, eventId }) => {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b">
        <Link
          href={`/admin/event/${eventId}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold">{event.title}</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <CheckinStats event={event} />
      </div>
    </div>
  )
}

export default StatsPageClient
