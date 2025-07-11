'use client'
import React, { useState, useEffect } from 'react'
import { useTranslate } from '@/providers/I18n/client'
// import { TimeFilterTabs } from '@/components/User/TicketBought/TimeFilterTabs'
import UpcomingTickets from './UpcomingTickets'
import FinishedTickets from './FinishedTickets'

const TicketBought = ({className}: {className?: string}) => {
  const { t } = useTranslate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const containerClass = `max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className || ''}`

  const [timeFilter, _setTimeFilter] = useState<'upcoming' | 'finished'>('upcoming')

  return (
    <div className={containerClass}>
      <h1 className="text-2xl font-bold my-4">{t('userprofile.title')}</h1>

      {/* <TimeFilterTabs timeFilter={timeFilter} setTimeFilter={setTimeFilter} t={t} /> */}

      <UpcomingTickets className={timeFilter === 'upcoming' ? '' : 'hidden'} />

      <FinishedTickets className={timeFilter === 'finished' ? '' : 'hidden'} />
    </div>
  )
}

export default TicketBought
