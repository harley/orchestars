import { Event } from '@/payload-types'
import React from 'react'
import { categories } from '../data/seat-maps/categories'
import { formatMoney } from '@/utilities/formatMoney'
import { TicketPrice } from '../types'

interface TicketPricesProps {
  ticketPrices: Event['ticketPrices']
  ticketPricesSelected?: Array<{
    ticketPrice: TicketPrice
    quantity: number
  }>
  handleToggleTicketPrice?: (ticketPrice: TicketPrice) => void
}

const TicketPrices = ({
  ticketPrices,
  ticketPricesSelected,
  handleToggleTicketPrice,
}: TicketPricesProps) => {
  const handlePriceSelect = (tkPrice: TicketPrice) => {
    handleToggleTicketPrice?.(tkPrice)
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-8">
      <h4 className="text-lg font-semibold mb-2 text-center">Thông tin giá vé</h4>
      <div className="text-sm italic text-center mb-4">Vui lòng nhấn vào vé bên dưới để mua</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ticketPrices?.map((tkPrice) => (
          <div
            key={tkPrice.id}
            onClick={
              handleToggleTicketPrice ? () => handlePriceSelect(tkPrice as TicketPrice) : undefined
            }
            className={`flex items-center p-3 rounded-md border ${!!handleToggleTicketPrice ? 'cursor-pointer' : ''} 
              ${
                ticketPricesSelected?.some((slted) => slted.ticketPrice?.id === tkPrice.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-100 hover:shadow-md'
              } transition-all duration-200`}
          >
            <div
              className="w-5 h-5 rounded-full mr-3 shadow-sm"
              style={{
                backgroundColor: categories.find((c) => c.id === tkPrice.key)?.color,
              }}
            ></div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">{tkPrice.name}</span>
              <span className="text-sm text-gray-600">
                {formatMoney(tkPrice?.price || 0, tkPrice?.currency || 'VND')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TicketPrices
