'use client'
import React, { useMemo, useState } from 'react'
import { useTranslate } from '@/providers/I18n/client'
import { Ticket } from '@/types/Ticket'
import { parse } from 'date-fns'

import { TicketCard } from '@/components/TicketBought/TicketCard'
import { StatusFilterTabs } from '@/components/TicketBought/StatusFilterTabs'
import { TimeFilterTabs } from '@/components/TicketBought/TimeFilterTabs'

const TicketBought: React.FC<{ userTickets: Ticket[] }> = ({ userTickets }) => {
  const { t } = useTranslate()

  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'processing' | 'cancelled'>('all')
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'finished'>('upcoming')

  const filteredTickets = useMemo(() => {
    return userTickets?.filter((ticket) => {
      if (!ticket) {
        console.log('Filtered out: ticket is null/undefined', ticket);
        return false;
      }
      if (!ticket.eventDate) {
        return false;
      }
      const parsedDate = parse(ticket.eventDate, 'dd/MM/yyyy', new Date());
      const now = new Date();
      const isFinished = parsedDate < now;
  
      if (timeFilter === 'upcoming' && isFinished) {
        return false;
      }
      if (timeFilter === 'finished' && !isFinished) {
        return false;
      }
  
      if (statusFilter === 'all') return true;
      if (statusFilter === 'success' && ticket.status !== 'booked') {
        return false;
      }
      if (
        statusFilter === 'processing' &&
        !(ticket.status === 'pending_payment' || ticket.status === 'hold')
      ) {
        return false;
      }
      if (statusFilter === 'cancelled' && ticket.status !== 'cancelled') {
        return false;
      }
  
      return true;
    });
  }, [userTickets, statusFilter, timeFilter]);

  return (
    <div className="bg-white min-h-screen text-black font-sans p-6">
      <h1 className="text-2xl font-bold my-4">{t('userprofile.title')}</h1>

      <StatusFilterTabs statusFilter={statusFilter} setStatusFilter={setStatusFilter} t={t} />
      <TimeFilterTabs timeFilter={timeFilter} setTimeFilter={setTimeFilter} t={t} />

      {filteredTickets?.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} t={t} />
      ))}
    </div>
  )
}

export default TicketBought
