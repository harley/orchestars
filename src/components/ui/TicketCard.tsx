'use client'

import React from 'react'
import { getTicketClassColor } from '@/utilities/getTicketClassColor'

export function TicketCard({ ticket, onCheckIn, isCheckingIn }: {
  ticket: any,
  onCheckIn: (ticket: any) => void,
  isCheckingIn: boolean
}) {
  const ticketColors = getTicketClassColor(ticket.ticketPriceInfo)

  const handleSeatClick = () => {
    if (ticket.ticketCode) {
      window.open(`/ticket/${ticket.ticketCode}`, '_blank')
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-shadow hover:shadow-md">
      {/* Responsive wrapper: stacks on mobile, row on sm+ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-wrap">
        {/* Left: Seat box with ticket class color and tier label */}
        <button
          onClick={handleSeatClick}
          className="flex flex-col items-center justify-center w-16 min-w-16 rounded-lg shadow h-full py-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{ backgroundColor: ticketColors.color, color: ticketColors.textColor }}
          aria-label={`View QR code for seat ${ticket.seat}`}
          title="Tap to view QR code"
        >
          <span className="text-xs font-medium opacity-80 mb-1">{ticket.ticketPriceName || 'N/A'}</span>
          <span className="text-xl font-bold leading-none tracking-tight">{ticket.seat}</span>
        </button>
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
          {/* Row 4: Email and Phone for verification */}
          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 space-y-0.5">
            {ticket.email && (
              <div className="truncate">
                📧 {ticket.email}
              </div>
            )}
            {ticket.phoneNumber && (
              <div className="truncate">
                📱 {ticket.phoneNumber}
              </div>
            )}
          </div>
        </div>
        {/* Right: Check In button or badge, vertically centered */}
        <div className="flex flex-col justify-center items-start sm:items-end w-full sm:w-auto ml-0 sm:ml-2 sm:ml-auto">
          {ticket.isCheckedIn ? (
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 mt-1 sm:mt-0">
              <span className="inline-flex items-center px-4 py-2 text-base font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                Checked In
              </span>
              {ticket.checkinRecord?.checkInTime && (
                <span className="text-xs text-gray-500 dark:text-gray-300 sm:w-full text-center">
                  {new Date(ticket.checkinRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={() => onCheckIn(ticket)}
              disabled={isCheckingIn}
              className={`px-6 py-2 rounded-md font-semibold text-white transition-colors text-base ${isCheckingIn
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