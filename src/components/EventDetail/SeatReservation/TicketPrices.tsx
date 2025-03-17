import { Event } from '@/payload-types'
import React from 'react'
import { categories } from '../data/seat-maps/categories'

const TicketPrices = ({ ticketPrices }: { ticketPrices: Event['ticketPrices'] }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-8">
      <h4 className="text-lg font-semibold mb-4 text-center">Thông tin giá vé</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ticketPrices?.map((tkPrice) => (
          <div
            key={tkPrice.id}
            className="flex items-center p-3 rounded-md border border-gray-100 hover:shadow-md transition-all duration-200"
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
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: tkPrice?.currency || 'VND',
                }).format(tkPrice?.price || 0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TicketPrices
