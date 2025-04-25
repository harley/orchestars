import { Event, Ticket } from '../../types'
import { format as formatDate } from 'date-fns'
import { categories } from '@/components/EventDetail/data/seat-maps/categories'
import { formatMoney } from '@/utilities/formatMoney'
import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'
type SeatPanelProps = {
  loading?: boolean
  title: string
  eventScheduleId: string
  selectedSeat: Ticket | null
  seats: Partial<Ticket>[]
  onDateChange: (eventScheduleId: string) => void
  onSeatSelect: (seat: Ticket) => void
  seatType: 'booked' | 'free'
  event: Event
}

export const SeatPanel = ({
  loading,
  title,
  eventScheduleId,
  selectedSeat,
  seats,
  onDateChange,
  onSeatSelect,
  seatType,
  event,
}: SeatPanelProps) => {
  const [searchSeat, setSearchSeat] = useState('')

  const outputSeats = useMemo(() => {
    if (!searchSeat) return seats
    return seats.filter((seat) => {
      const regex = new RegExp(searchSeat, 'i')
      return regex.test(seat.seat || '')
    })
  }, [seats, searchSeat])
  return (
    <div className="seat-panel">
      <div className="seat-panel-title">{title}</div>
      <div className="seat-panel-section">
        <label className="seat-label">
          Select date
          <select
            className="seat-select"
            value={eventScheduleId || ''}
            onChange={(e) => onDateChange(e.target.value)}
          >
            <option value="" disabled>
              -- Choose schedule --
            </option>
            {event.schedules?.map((d) => (
              <option value={d.id} key={d.id}>
                {d.date && formatDate(d.date, 'dd-MM-yyyy')}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="seat-panel-section">
        <label className="seat-label">
          Search Seat
          <input
            type="text"
            className="seat-select"
            value={searchSeat}
            onChange={(e) => setSearchSeat(e.target.value)}
            placeholder="Enter seat ..."
          />
        </label>
      </div>
      {selectedSeat && (
        <div className="seat-info">
          <div>
            <span className="seat-info-label">Seat:</span>
            <span className="seat-info-value">{selectedSeat.seat}</span>
          </div>
          <div>
            <span className="seat-info-label">Class:</span>
            <span className="seat-info-value">{selectedSeat.ticketPriceName}</span>
          </div>
          <div>
            <span className="seat-info-label">Price:</span>
            <span className="seat-info-value">
              {formatMoney(selectedSeat.ticketPriceInfo?.price || 0, 'VND')} VND
            </span>
          </div>
        </div>
      )}
      {loading ? (
        <div className="seats-empty">Loading...</div>
      ) : eventScheduleId ? (
        <div className="seat-panel-section">
          <label className="seat-label">
            {seatType === 'booked' ? 'Booked Seats' : 'Available Seats'}
          </label>
          <div className="seats-grid">
            {outputSeats.length === 0 ? (
              <div className="seats-empty">No seats</div>
            ) : (
              outputSeats.map((seat) => (
                <button
                  type="button"
                  key={seat.id}
                  onClick={() => onSeatSelect(seat as Ticket)}
                  style={{
                    position: 'relative',
                    backgroundColor: categories.find((c) => c.id === seat.ticketPriceInfo?.key)
                      ?.color,
                    color: '#fff',
                  }}
                  className={[
                    'seat-btn',
                    seatType === 'booked' ? 'seat-btn-booked' : 'seat-btn-free',
                    selectedSeat?.seat === seat?.seat ? 'seat-btn-selected' : '',
                  ].join(' ')}
                  aria-pressed={selectedSeat?.seat === seat?.seat}
                >
                  {selectedSeat?.seat === seat?.seat && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        color: '#137f42',
                        background: '#fff',
                        borderRadius: '50%',
                        fontWeight: 'bold',
                      }}
                    >
                      <Check />
                    </div>
                  )}
                  {seat.seat} <br />({seat.ticketPriceName})
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="seats-empty">Please select a date to see seats</div>
      )}
    </div>
  )
}
