import React, { useEffect, useState } from 'react'
import './index.css'
import { Event, Ticket } from '../../types'
import { format as formatDate } from 'date-fns'
import { getBookedSeatsByEventScheduleId, swapSeats } from '../../actions'
import DEFAULT_SEATS from '@/components/EventDetail/data/seat-maps/seats.json'

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

function SeatPanel({
  loading,
  title,
  eventScheduleId,
  selectedSeat,
  seats,
  onDateChange,
  onSeatSelect,
  seatType,
  event,
}: SeatPanelProps) {
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
            <span className="seat-info-value">${selectedSeat.ticketPriceInfo?.price}</span>
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
            {seats.length === 0 ? (
              <div className="seats-empty">No seats</div>
            ) : (
              seats.map((seat) => (
                <button
                  type="button"
                  key={seat.id}
                  onClick={() => onSeatSelect(seat as Ticket)}
                  className={[
                    'seat-btn',
                    seatType === 'booked' ? 'seat-btn-booked' : 'seat-btn-free',
                    selectedSeat?.seat === seat?.seat ? 'seat-btn-selected' : '',
                  ].join(' ')}
                  aria-pressed={selectedSeat === seat}
                >
                  {seat.seat}
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

const SeatSwapScheduler = ({ event }: { event: Event }) => {
  const [leftEventScheduleId, setLeftEventScheduleId] = useState('')
  const [rightEventScheduleId, setRightEventScheduleId] = useState('')
  const [leftSeatSelected, seatLeftSeatSelected] = useState<Ticket | null>(null)
  const [rightSeatSelected, seatRightSeatSelected] = useState<Ticket | null>(null)
  const [bookedSeats, setBookedSeats] = useState<Ticket[]>([])
  const [freeSeats, setFreeSeats] = useState<Ticket[]>([])

  const [pending, setPending] = useState(false)
  const [loadingLeftSeat, setLoadingLeftSeat] = useState(false)

  useEffect(() => {
    if (leftEventScheduleId) {
      setLoadingLeftSeat(true)
      getBookedSeatsByEventScheduleId(event.id as any, leftEventScheduleId)
        .then((tickets) => setBookedSeats(tickets as unknown as Ticket[]))
        .finally(() => {
          setLoadingLeftSeat(false)
        })
    }
  }, [event.id, leftEventScheduleId])

  useEffect(() => {
    if (!rightEventScheduleId) {
      return setFreeSeats([])
    }

    const loadFreeSeats = async () => {
      const bookedSeatsByRightEventSchId = await getBookedSeatsByEventScheduleId(
        event.id as any,
        rightEventScheduleId,
      )

      const arrStrBookedSeats = bookedSeatsByRightEventSchId.map((s) =>
        String(s.seat).toUpperCase(),
      )

      const freeSeats: Partial<Ticket>[] = []

      DEFAULT_SEATS.forEach((s) => {
        if (!arrStrBookedSeats.includes(s.label.toUpperCase())) {
          const ticketPriceInfo = event.ticketPrices?.find((tPrice) => tPrice.key === s.category)
          freeSeats.push({
            id: s.label,
            ticketPriceName: ticketPriceInfo?.name || '',
            seat: s.label,
            eventScheduleId: rightEventScheduleId,
            ticketPriceInfo,
          })
        }
      })

      setFreeSeats(freeSeats as Ticket[])
    }

    loadFreeSeats()
  }, [event, rightEventScheduleId])

  const reset = () => {
    setLeftEventScheduleId('')
    setRightEventScheduleId('')
    seatLeftSeatSelected(null)
    seatRightSeatSelected(null)
    setBookedSeats([])
    setFreeSeats([])
  }

  async function handleConfirm() {
    setPending(true)

    try {
      if (!leftSeatSelected || !rightSeatSelected) return

      await swapSeats(leftSeatSelected, {
        eventId: event.id as any,
        eventScheduleId: rightEventScheduleId,
        seat: rightSeatSelected.seat as string,
        ticketPriceId: rightSeatSelected.ticketPriceInfo?.id,
      })

      reset()
      alert('Seats swapped!')
    } catch (error: any) {
      alert(error?.message || 'Opps! Something went wrong!')
    } finally {
      setPending(false)
    }
  }

  function handleCancel() {
    reset()
  }

  return (
    <div className="scheduler-root">
      <h2 className="scheduler-title">{event.title}</h2>
      <div className="scheduler-main">
        <SeatPanel
          loading={loadingLeftSeat}
          title="From (Your Booked Seat)"
          eventScheduleId={leftEventScheduleId}
          selectedSeat={leftSeatSelected}
          seats={bookedSeats}
          onDateChange={setLeftEventScheduleId}
          onSeatSelect={(seat) => seatLeftSeatSelected(seat)}
          seatType="booked"
          event={event}
        />
        <div className="scheduler-divider" />
        <SeatPanel
          title="To (Swap With Free Seat)"
          eventScheduleId={rightEventScheduleId}
          selectedSeat={rightSeatSelected}
          seats={freeSeats}
          onDateChange={setRightEventScheduleId}
          onSeatSelect={(seat) => seatRightSeatSelected(seat)}
          seatType="free"
          event={event}
        />
      </div>
      <div className="scheduler-actions">
        <button
          className="scheduler-btn scheduler-btn-confirm"
          disabled={pending}
          onClick={handleConfirm}
        >
          {pending ? 'Swapping...' : 'Confirm'}
        </button>
        <button
          className="scheduler-btn scheduler-btn-cancel"
          disabled={pending}
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default SeatSwapScheduler
