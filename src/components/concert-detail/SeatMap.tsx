
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// Define seat types and their corresponding colors
const seatTypes = {
  firstClass: {
    label: "First Class",
    color: "bg-purple-500",
    price: 250
  },
  economy: {
    label: "Economy",
    color: "bg-blue-500",
    price: 120
  },
  reduced: {
    label: "Reduced",
    color: "bg-green-500",
    price: 80
  },
  reserved: {
    label: "Reserved",
    color: "bg-gray-500",
    price: 0
  }
};

export type SeatType = keyof typeof seatTypes;

interface SeatProps {
  id: string;
  type: SeatType;
  row: string;
  number: number;
  isSelected: boolean;
  isReserved: boolean;
  onSelect: (id: string) => void;
}

const Seat: React.FC<SeatProps> = ({ 
  id, 
  type, 
  row, 
  number, 
  isSelected, 
  isReserved, 
  onSelect 
}) => {
  const handleClick = () => {
    if (!isReserved) {
      onSelect(id);
    }
  };

  return (
    <div
      className={cn(
        "w-10 h-10 m-1 rounded flex items-center justify-center cursor-pointer transition-all transform hover:scale-110 relative group",
        isReserved ? seatTypes.reserved.color : seatTypes[type].color,
        isSelected && !isReserved && "ring-2 ring-yellow-400 scale-110"
      )}
      onClick={handleClick}
    >
      <span className="text-white text-xs font-medium">{row}{number}</span>
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        {row}{number} - {isReserved ? "Reserved" : seatTypes[type].label}
      </div>
    </div>
  );
};

interface SeatMapProps {
  onSeatSelect: (selectedSeats: {
    id: string;
    type: SeatType;
    row: string;
    number: number;
    price: number;
  }[]) => void;
}

const generateSeats = () => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 12;
  const seats = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (let j = 1; j <= seatsPerRow; j++) {
      let type: SeatType = 'economy';
      
      // First 2 rows are first class
      if (i < 2) {
        type = 'firstClass';
      }
      // Last 2 rows are reduced
      else if (i >= rows.length - 2) {
        type = 'reduced';
      }
      
      // Some seats are pre-reserved (random pattern)
      const isReserved = Math.random() < 0.2;
      
      seats.push({
        id: `${row}${j}`,
        row,
        number: j,
        type,
        isReserved,
      });
    }
  }
  
  return seats;
};

const SeatMap: React.FC<SeatMapProps> = ({ onSeatSelect }) => {
  const [seats] = useState(generateSeats());
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  const handleSeatSelect = (id: string) => {
    setSelectedSeatIds(prevSelected => {
      const newSelected = prevSelected.includes(id)
        ? prevSelected.filter(seatId => seatId !== id)
        : [...prevSelected, id];
      
      // Update the parent component with selected seats info
      const selectedSeatsInfo = seats
        .filter(seat => newSelected.includes(seat.id) && !seat.isReserved)
        .map(seat => ({
          id: seat.id,
          type: seat.type,
          row: seat.row,
          number: seat.number,
          price: seatTypes[seat.type].price
        }));
      
      onSeatSelect(selectedSeatsInfo);
      return newSelected;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Seat Selection</h3>
        
        {/* Seat type legend */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          {Object.entries(seatTypes).map(([key, { label, color, price }]) => (
            <div key={key} className="flex items-center">
              <div className={`w-4 h-4 ${color} rounded mr-2`}></div>
              <span>{label} {key !== 'reserved' && `- $${price}`}</span>
            </div>
          ))}
        </div>
        
        {/* Stage representation */}
        <div className="w-full bg-gray-800 text-white py-2 mb-6 text-center rounded-lg">
          STAGE
        </div>
        
        {/* Seats container */}
        <div className="flex flex-wrap justify-center max-w-3xl mx-auto">
          {seats.map(seat => (
            <Seat
              key={seat.id}
              id={seat.id}
              type={seat.type}
              row={seat.row}
              number={seat.number}
              isSelected={selectedSeatIds.includes(seat.id)}
              isReserved={seat.isReserved}
              onSelect={handleSeatSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
