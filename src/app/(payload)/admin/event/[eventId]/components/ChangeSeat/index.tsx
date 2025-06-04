import React, { useEffect, useState } from 'react'
import './index.css'
import { Event, Ticket } from '../../types'
import {
  getBookedOrPendingPaymentOrHoldingSeats,
  getBookedSeatsByEventScheduleId,
  swapSeats,
} from '../../actions'
import { SeatPanel } from './SeatPanel'
import { Media } from '@/payload-types'
import { EventSeatChartData } from '@/components/EventDetail/types/SeatChart'

const SeatSwapScheduler = ({ event }: { event: Event }) => {
  const [leftEventScheduleId, setLeftEventScheduleId] = useState('')
  const [rightEventScheduleId, setRightEventScheduleId] = useState('')
  const [leftSeatSelected, seatLeftSeatSelected] = useState<Ticket | null>(null)
  const [rightSeatSelected, seatRightSeatSelected] = useState<Ticket | null>(null)
  const [bookedSeats, setBookedSeats] = useState<Ticket[]>([])
  const [freeSeats, setFreeSeats] = useState<Ticket[]>([])

  const [pending, setPending] = useState(false)
  const [loadingLeftSeat, setLoadingLeftSeat] = useState(false)
  const [loadingRightSeat, setLoadingRightSeat] = useState(false)
  const [allSeats, setAllSeats] = useState<EventSeatChartData['seats']>([])
  const [seatCategories, setSeatCategories] = useState<EventSeatChartData['categories']>([])

  useEffect(() => {

    if(!(event.seatingChart?.seatMap as Media)?.url) {
      return
    }

    const seatChartUrl = (event.seatingChart?.seatMap as Media)?.url as string
    
    fetch(seatChartUrl)
      .then(res => res.json())
      .then((data: EventSeatChartData) => {
        setAllSeats(data.seats)
        setSeatCategories(data.categories)
      })
      .catch(err => {
        console.error('Error fetching seat chart:', err)  
      })
  }, [event.seatingChart])

  useEffect(() => {
    if (leftEventScheduleId) {
      setLoadingLeftSeat(true)
      getBookedSeatsByEventScheduleId(event.id as any, leftEventScheduleId)
        .then((tickets) => {
          const sorted = (tickets as unknown as Ticket[]).sort((a, b) => {
            const digitA = (a.ticketPriceInfo?.key || '0').replace(/\D/g, '')
            const aNum = parseInt(digitA, 10)

            const digitB = (b.ticketPriceInfo?.key || '0').replace(/\D/g, '')
            const bNum = parseInt(digitB, 10)

            return aNum - bNum
          })
          setBookedSeats(sorted)
        })
        .finally(() => {
          setLoadingLeftSeat(false)
        })
    }
  }, [event.id, leftEventScheduleId])

  useEffect(() => {
    if (!rightEventScheduleId) {
      return setFreeSeats([])
    }

    if(!allSeats.length) {
      return
    }

    const loadFreeSeats = async () => {
      setLoadingRightSeat(true)
      const bookedSeatsByRightEventSchId = await getBookedOrPendingPaymentOrHoldingSeats({
        eventId: event.id as any,
        eventScheduleId: rightEventScheduleId,
      })

      const arrStrBookedSeats = bookedSeatsByRightEventSchId.map((seat) =>
        String(seat).toUpperCase(),
      )

      let freeSeats: Partial<Ticket>[] = []

      allSeats.forEach((s) => {
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

      freeSeats = freeSeats.sort((a, b) => {
        const digitA = (a.ticketPriceInfo?.key || '0').replace(/\D/g, '')
        const aNum = parseInt(digitA, 10)

        const digitB = (b.ticketPriceInfo?.key || '0').replace(/\D/g, '')
        const bNum = parseInt(digitB, 10)

        return aNum - bNum
      })

      setFreeSeats(freeSeats as Ticket[])
      setLoadingRightSeat(false)
    }

    loadFreeSeats()
  }, [event, rightEventScheduleId, allSeats])

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
      if (!leftSeatSelected) {
        return alert('Please select a seat to swap from')
      }
      if (!rightSeatSelected) {
        return alert('Please select a seat to swap to')
      }

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
          title={`From (Booked Seats: ${bookedSeats?.length || 0})`}
          eventScheduleId={leftEventScheduleId}
          selectedSeat={leftSeatSelected}
          seats={bookedSeats}
          onDateChange={setLeftEventScheduleId}
          onSeatSelect={(seat) => seatLeftSeatSelected(seat)}
          seatType="booked"
          event={event}
          categories={seatCategories}
        />
        <div className="scheduler-divider" />
        <SeatPanel
          loading={loadingRightSeat}
          title={`To (Swap With Free Seat: ${freeSeats?.length || 0})`}
          eventScheduleId={rightEventScheduleId}
          selectedSeat={rightSeatSelected}
          seats={freeSeats}
          onDateChange={setRightEventScheduleId}
          onSeatSelect={(seat) => seatRightSeatSelected(seat)}
          seatType="free"
          event={event}
          categories={seatCategories}
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
