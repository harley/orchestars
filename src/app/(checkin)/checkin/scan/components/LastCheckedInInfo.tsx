import React from 'react'
import { getTicketClassColor } from '@/utilities/getTicketClassColor'
import { useTranslate } from '@/providers/I18n/client'

interface LastCheckedInInfoProps {
  ticketInfo: {
    seat: string
    ticketPriceName: string | null
    attendeeName: string
    ticketCode: string
    ticketPriceInfo: any
  }
}

export const LastCheckedInInfo: React.FC<LastCheckedInInfoProps> = ({ ticketInfo }) => {
  const { t } = useTranslate()
  const ticketColors = getTicketClassColor(ticketInfo.ticketPriceInfo)

  return (
    <div className="text-center mb-6 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
      <p className="text-green-400 text-sm font-medium mb-2">{t('checkin.scan.lastCheckIn')}</p>
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 text-white font-medium">
          <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
            {ticketInfo.seat}
          </span>
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: ticketColors.color,
              color: ticketColors.textColor,
            }}
          >
            {ticketInfo.ticketPriceName || 'N/A'}
          </span>
          <span className="text-gray-300 text-sm">
            {ticketInfo.ticketCode}
          </span>
        </div>
        <span className="text-white font-semibold">
          {ticketInfo.attendeeName}
        </span>
      </div>
    </div>
  )
}
