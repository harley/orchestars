import React, { useState } from 'react'
import { cn } from '@/utilities/ui'
import { SeatType, SeatProps } from './types'

const Seat: React.FC<SeatProps> = ({ seat, isSelected, onSelect }) => {
  const handleClick = () => {
    if (!seat.isReserved) {
      onSelect(seat)
    }
  }

  return (
    <div
      className={cn(
        'w-10 h-10 m-1 rounded flex items-center justify-center cursor-pointer transition-all transform hover:scale-110 relative group',
        seat.isReserved ? 'bg-gray-500' : 'bg-blue-500',
        isSelected && !seat.isReserved && 'ring-2 ring-yellow-400 scale-110',
      )}
      onClick={handleClick}
    >
      <span className="text-white text-xs font-medium">
        {seat.row}
        {seat.number}
      </span>
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        {seat.row}
        {seat.number} - {seat.isReserved ? 'Reserved' : seat.name}
      </div>
    </div>
  )
}

interface SeatMapProps {
  onSeatSelect: (seat: SeatType) => void
  selectedSeats: SeatType[]
  event: Record<string, any>
}

const generateSeats = (ticketPrices: any[]) => {
  const rows = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ]
  const seatsPerRow = 12
  const seatRows: any[][] = []
  let currentIndexRow = 0 // Tracks which row we are at

  for (const ticketPrice of ticketPrices) {
    const ticketSeats: any[][] = [] // Stores 3 rows per ticket price

    for (let i = 0; i < 3; i++) {
      if (currentIndexRow >= rows.length) break // Prevent out-of-bounds errors

      const rowName = rows[currentIndexRow] // Get the row letter
      const rowSeats: any[] = []

      for (let s = 1; s <= seatsPerRow; s++) {
        rowSeats.push({
          id: `${rowName}${s}`, // E.g., "A1", "A2", ..., "A12"
          ticketId: ticketPrice.id,
          row: rowName,
          number: s,
          price: ticketPrice.price,
          name: ticketPrice.name,
          isReserved: false,
        })
      }

      ticketSeats.push(rowSeats)
      currentIndexRow++ // Move to the next row
    }

    seatRows.push(ticketSeats) // Group 3 rows per ticket type
  }

  return seatRows.flat() as any[][]
}

const SeatMap: React.FC<SeatMapProps> = ({ onSeatSelect, selectedSeats, event }) => {
  const [seats] = useState(generateSeats(event.ticketPrices))

  const handleSeatSelect = (seat: SeatType) => {
    onSeatSelect(seat)
  }

  return (
    <div className="mb-8">
      {/* Stage representation */}
      <div className="w-full bg-gray-800 text-white py-2 mb-6 text-center rounded-lg">STAGE</div>

      {/* Seats container */}
      <div className="flex flex-col justify-center max-w-3xl mx-auto">
        {seats.map((rows, index) => (
          <div key={index} className="flex flex-wrap">
            {rows.map((seat) => (
              <Seat
                key={seat.id}
                seat={seat}
                isSelected={!!selectedSeats.find((s) => s.id === seat.id)}
                onSelect={handleSeatSelect}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SeatMap
