'use client'
import React, { useState } from 'react'
import { useTranslate } from '@/providers/I18n/client'
import { Ticket } from '@/types/Ticket'
import { TicketCard } from '@/components/TicketBought/TicketCard'
import { TimeFilterTabs } from '@/components/TicketBought/TimeFilterTabs'

const TicketBought: React.FC<{ userTickets: Ticket[] }> = ({ userTickets }) => {
  const { t } = useTranslate()

  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'finished'>('upcoming')

  return (
    <div className="bg-white min-h-screen text-black font-sans p-6">
      <h1 className="text-2xl font-bold my-4">{t('userprofile.title')}</h1>

      <TimeFilterTabs timeFilter={timeFilter} setTimeFilter={setTimeFilter} t={t} />

      {userTickets?.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} t={t} />
      ))}
    </div>
  )
}

export default TicketBought