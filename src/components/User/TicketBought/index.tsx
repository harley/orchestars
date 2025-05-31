'use client'
import React, { useState } from 'react'
import { useTranslate } from '@/providers/I18n/client'
import { TimeFilterTabs } from '@/components/User/TicketBought/TimeFilterTabs'
import UpcomingTickets from './UpcomingTickets'
import FinishedTickets from './FinishedTickets'

const TicketBought = ({className}: {className?: string}) => {
  const { t } = useTranslate()

  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'finished'>('upcoming')

  return (
    <div className={`bg-white min-h-screen text-black font-sans p-6 ${className || ''}`}>
      <h1 className="text-2xl font-bold my-4">{t('userprofile.title')}</h1>

      <TimeFilterTabs timeFilter={timeFilter} setTimeFilter={setTimeFilter} t={t} />

      <UpcomingTickets className={timeFilter === 'upcoming' ? '' : 'hidden'} />

      <FinishedTickets className={timeFilter === 'finished' ? '' : 'hidden'} />
    </div>
  )
}

export default TicketBought
