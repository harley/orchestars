'use client'
import React, { useState, useEffect } from 'react'
import { useTranslate } from '@/providers/I18n/client'
// import { TimeFilterTabs } from '@/components/User/TicketBought/TimeFilterTabs'
import TicketsList from './TicketsList'
import { useTickets } from '@/components/User/hooks/useTickets'
import { TicketTypeFilterTab } from './TicketTypeFilterTab'
import { TicketStatus } from '@/collections/Tickets/constants'

const TicketBought = ({ className }: { className?: string }) => {
  const { t } = useTranslate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const containerClass = `max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className || ''}`


  const [ticketStatus, setTicketStatus] = useState<
    TicketStatus | 'gifted'
  >('booked')

  const {
    tickets,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = useTickets({ ticketStatus })

  return (
    <div className={containerClass}>
      <h1 className="text-2xl font-bold my-4">{t('userprofile.title')}</h1>

      {/* <TimeFilterTabs timeFilter={timeFilter} setTimeFilter={setTimeFilter} t={t} /> */}
      <TicketTypeFilterTab
        typeFilter={ticketStatus}
        setTypeFilter={setTicketStatus}
        t={t}
      ></TicketTypeFilterTab>

      <TicketsList
        tickets={tickets}
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        nextPage={nextPage}
        prevPage={prevPage}
      />
    </div>
  )
}

export default TicketBought
