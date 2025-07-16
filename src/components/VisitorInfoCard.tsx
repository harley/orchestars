import React from 'react'
import { useTranslate } from '@/providers/I18n/client'
import { type TicketDTO } from '@/lib/checkin/findTickets'

interface VisitorInfoCardProps {
  ticket: TicketDTO
}

const VisitorInfoCard: React.FC<VisitorInfoCardProps> = ({ ticket }) => {
  const { t } = useTranslate()
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        {ticket.attendeeName}
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">{t('common.seat') || 'Seat'}:</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-gray-200">
            {ticket.seat}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">{t('checkin.ticketCode') || 'Ticket'}:</span>
          <span className="ml-2 font-mono text-gray-900 dark:text-gray-200">
            {ticket.ticketCode}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">{t('checkin.ticketType') || 'Type'}:</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-gray-200">
            {ticket.ticketPriceName || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">{t('checkin.orderCode') || 'Order'}:</span>
          <span className="ml-2 font-mono text-gray-900 dark:text-gray-200">
            {ticket.orderCode || 'N/A'}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500 dark:text-gray-400">{t('common.email') || 'Email'}:</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-gray-200 break-words">
            {ticket.email || 'N/A'}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500 dark:text-gray-400">{t('common.phoneNumber') || 'Phone'}:</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-gray-200">
            {ticket.phoneNumber || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default VisitorInfoCard 