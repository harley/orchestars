import React from 'react'
import { getTicketClassColor } from '@/utilities/getTicketClassColor'

export function TicketCard({ ticket, onCheckIn, isCheckingIn }: {
  ticket: any,
  onCheckIn: (ticket: any) => void,
  isCheckingIn: boolean
}) {
  const ticketColors = getTicketClassColor(ticket.ticketPriceInfo)

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-shadow hover:shadow-md">
      <div className="flex flex-row items-stretch gap-4">
        {/* Left: Seat box with ticket class color and tier label */}
        <div
          className="flex flex-col items-center justify-center w-16 min-w-16 rounded-lg shadow h-full py-2"
          style={{ backgroundColor: ticketColors.color, color: ticketColors.textColor }}
        >
          <span className="text-xs font-medium opacity-80 mb-1">{ticket.ticketPriceName || 'N/A'}</span>
          <span className="text-xl font-bold leading-none tracking-tight">{ticket.seat}</span>
        </div>
        {/* Middle: Ticket info */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Row 1: Ticket code only */}
          <div className="flex flex-row items-center gap-2 mb-1">
            <span className="font-mono text-gray-700 dark:text-gray-200 truncate text-base">
              {ticket.ticketCode}
            </span>
          </div>
          {/* Row 2: Attendee name */}
          <div className="text-base font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
            {ticket.attendeeName}
          </div>
          {/* Row 3: Order code */}
          {ticket.orderCode && (
            <div className="text-xs font-normal text-gray-500 dark:text-gray-400 truncate">
              {ticket.orderCode}
            </div>
          )}
        </div>
        {/* Right: Check In button or badge, vertically centered */}
        <div className="flex flex-col justify-center items-end min-w-[120px] ml-2">
          {ticket.isCheckedIn ? (
            <>
              <span className="inline-flex items-center px-4 py-2 text-base font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 mb-1">
                Checked In
              </span>
              {ticket.checkinRecord?.checkInTime && (
                <span className="text-xs text-gray-500 dark:text-gray-300 mt-0.5 text-center block w-full">
                  {new Date(ticket.checkinRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </>
          ) : (
            <button
              onClick={() => onCheckIn(ticket)}
              disabled={isCheckingIn}
              className={`px-6 py-2 rounded-md font-semibold text-white transition-colors text-base ${
                isCheckingIn
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
              }`}
            >
              {isCheckingIn ? 'Checking...' : 'Check In'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 