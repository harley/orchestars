import React, { useEffect, useState } from 'react'
// import '@mezh-hq/react-seat-toolkit/styles'
import SeatToolkit, { SeatStatus } from '@mezh-hq/react-seat-toolkit'
import { Armchair, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslate } from '@/providers/I18n/client'
import { SelectedSeat } from '../../types'
import { Event, Media, SeatingChart } from '@/payload-types'
import { EventSeatChartData, SeatItemChart } from '../../types/SeatChart'
import { splitTextAndNumber } from '@/utilities/splitTextAndNumberInSeat'

const SeatMapToolkit = ({
  onSelectSeat,
  unavailableSeats = [],
  selectedSeats = [],
  event,
}: {
  onSelectSeat?: (seat: any) => void
  unavailableSeats?: string[]
  selectedSeats?: SelectedSeat[]
  event: Event
}) => {
  const { t } = useTranslate()
  const [eventSeatChartData, setEventSeatChartData] = useState<EventSeatChartData>({
    seats: [],
    texts: [],
    categories: [],
    shapes: [],
    sections: [],
  })
  const [loadingMap, setLoadingMap] = useState(true)
  const [seats, setSeats] = useState<SeatItemChart[]>([])
  const [showModal, setShowModal] = useState(false)

  const [workspace, setWorkspace] = useState({
    initialViewBoxScale: 0.6,
    initialViewBoxScaleForWidth: 2000,
    visibilityOffset: 0,
  })

  useEffect(() => {
    const screenWidth = window.innerWidth
    if (screenWidth <= 320) {
      setWorkspace({
        initialViewBoxScale: 0.27,
        initialViewBoxScaleForWidth: 150,
        visibilityOffset: 0,
      })
    } else if (screenWidth <= 768) {
      setWorkspace({
        initialViewBoxScale: 0.5,
        initialViewBoxScaleForWidth: 1000,
        visibilityOffset: 0,
      })
    } else {
      setWorkspace({
        initialViewBoxScale: 0.8,
        initialViewBoxScaleForWidth: 2000,
        visibilityOffset: 0,
      })
    }
  }, [])

  useEffect(() => {
    const seatingChart = event?.seatingChart as SeatingChart
    const seatMap = seatingChart?.seatMap as Media
    if (seatMap?.url) {
      fetch(seatMap.url)
        .then((res) => res.json())
        .then((data: EventSeatChartData) => {
          setEventSeatChartData(data)
        })
        .catch((err) => {
          console.log('Error while loading seat chart', err)
        })
    }
  }, [event?.seatingChart])

  useEffect(() => {
    if (!eventSeatChartData.seats?.length) {
      return
    }
    const unavailableSet = new Set(unavailableSeats)
    const selectedSet = new Set(selectedSeats.map((s) => s.id))

    const processedSeats = eventSeatChartData.seats.map((seat) => ({
      ...seat,
      status: unavailableSet.has(seat.label)
        ? SeatStatus.Unavailable
        : selectedSet.has(seat.id)
          ? SeatStatus.Reserved
          : SeatStatus.Available,
    }))
    setSeats(processedSeats)
    setLoadingMap(false)
  }, [unavailableSeats, selectedSeats, eventSeatChartData])

  const handleSeatClick = (seat: any) => {
    if (seat.status === SeatStatus.Unavailable || seat.status === SeatStatus.Locked) {
      return
    }

    const seatRow = splitTextAndNumber(seat.label)?.text

    if (!seatRow) return

    const allSeatsInRow = seats
      .filter((s) => splitTextAndNumber(s.label)?.text === seatRow)
      .sort((a, b) => a.x - b.x)

    const selectedInRow = selectedSeats
      .filter((s) => splitTextAndNumber(s.label)?.text === seatRow)
      .sort((a, b) => a.x - b.x)

    const isSelected = selectedSeats.some((s) => s.id === seat.id)

    if (!isSelected) {
      // === SELECT LOGIC ===
      if (selectedInRow.length === 0) {
        onSelectSeat?.(seat)
        return
      }

      const first = selectedInRow[0]
      const last = selectedInRow[selectedInRow.length - 1]

      const seatIndex = allSeatsInRow.findIndex((s) => s.id === seat.id)
      const firstIndex = allSeatsInRow.findIndex((s) => s.id === first?.id)
      const lastIndex = allSeatsInRow.findIndex((s) => s.id === last?.id)

      const isAdjacent = seatIndex === firstIndex - 1 || seatIndex === lastIndex + 1

      if (isAdjacent) {
        onSelectSeat?.(seat)
      } else {
        setShowModal(true) // 🚨 Not adjacent, show modal
      }
    } else {
      // === UNSELECT LOGIC ===
      const selectedIndex = selectedInRow.findIndex((s) => s.id === seat.id)

      if (selectedIndex === 0 || selectedIndex === selectedInRow.length - 1) {
        const index = selectedSeats.findIndex((s) => s.id === seat.id)
        if (index > -1) {
          onSelectSeat?.(seat)
        }
      } else {
        setShowModal(true) // Not first or last — show modal
      }
    }
  }

  return (
    <div className="relative">
      {loadingMap && (
        <div className="absolute z-50 top-[30%] left-1/2 -translate-x-1/2 p-5 bg-gray-100/30 rounded-md flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-12 h-12 animate-spin" />
          <span>{t('common.loading')}</span>
        </div>
      )}
      <SeatToolkit
        mode={'user'}
        styles={{
          root: {
            className: 'bg-gray-100 min-h-[400px] md:min-h-[600px]',
          },
        }}
        events={{
          onSeatClick: handleSeatClick,
        }}
        data={{
          name: 'Categorized Example',
          seats: seats,
          categories: eventSeatChartData.categories,
          sections: eventSeatChartData.sections,
          text: eventSeatChartData.texts,
          shapes: eventSeatChartData.shapes,
          polylines: [],
          images: [],
          workspace,
        }}
        options={{
          shapes: {
            icons: [Armchair],
            overrideDefaultIconset: true,
          },
        }}
      />
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('seatSelection.cannotSelectSeat')}</DialogTitle>
          </DialogHeader>
          <div>
            <p>{t('seatSelection.noEmptySeats')}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={() => setShowModal(false)}>{t('seatSelection.close')}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SeatMapToolkit
