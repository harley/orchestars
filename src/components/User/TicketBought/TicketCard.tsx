'use client'
import React from 'react'
import { format, parse } from 'date-fns'
import { categories } from '@/components/EventDetail/data/seat-maps/categories'
import { Ticket } from '@/types/Ticket'
import { useTranslate } from '@/providers/I18n/client'

function getZoneId(ticket: any): string {
  const ticketPriceId = ticket?.ticketPriceInfo?.ticketPriceId || ticket?.ticketPriceInfo?.id
  const matched = ticket?.event?.ticketPrices?.find((price: any) => price.id === ticketPriceId)
  return matched?.key || 'unknown'
}

export const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const { t } = useTranslate()
  const zoneId = getZoneId(ticket)
  const zone = categories.find((c) => c.id === zoneId)
  const parsedDate = parse(ticket?.eventDate, 'dd/MM/yyyy', new Date())

  return (
    <div
      key={ticket.id}
      className="flex overflow-hidden shadow-md mb-4 border-l-8"
      style={{ borderColor: zone?.color || '#333' }}
    >
      {/* Date Block */}
      <div
        className="flex flex-col items-center rounded-r-lg justify-center px-4 py-3 text-white w-24"
        style={{ backgroundColor: zone?.color || '#333' }}
      >
        <div className="text-3xl font-bold">{format(parsedDate, 'dd')}</div>
        <div className="uppercase text-sm">{format(parsedDate, 'LLL')}</div>
        <div className="text-sm">{format(parsedDate, 'yyyy')}</div>
      </div>

      {/* Details Block */}
      <div className="flex-1 bg-gray-100 rounded-l-lg px-4 py-3">
        <h2 className="text-lg font-semibold mb-1">{ticket?.event?.title}</h2>

        <div className="flex gap-2 items-center mb-2">
          {ticket.status === 'booked' && (
            <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded">
              {t('userprofile.statusSuccess')}
            </span>
          )}
          {ticket.status === 'pending_payment' && (
            <span className="inline-block bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              {t('userprofile.statusPendingPayment')}
            </span>
          )}
          {ticket.status === 'hold' && (
            <span className="inline-block bg-orange-500 text-white text-xs px-2 py-1 rounded">
              {t('userprofile.statusHold')}
            </span>
          )}
          {ticket.status === 'cancelled' && (
            <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded">
              {t('userprofile.statusCancelled')}
            </span>
          )}
        </div>

        <p className="text-sm">
          {t('userprofile.orderCode')}: <strong>{ticket.ticketCode}</strong>
        </p>
        <p className="text-sm">{ticket.eventDate}</p>
        <p className="text-sm">
          {t('userprofile.seat')}: {ticket.seat || '—'}
        </p>
        <p className="text-sm">
          {t('userprofile.ticketPrice')}: {ticket.ticketPriceInfo?.name || '—'}
        </p>
        <p className="text-sm">{ticket.event?.eventLocation || t('userprofile.location')}</p>
      </div>
    </div>
  )
}
