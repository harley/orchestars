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
    const seatRowChar = seat.label[0]
    const seatNumber = parseInt(seat.id.split('-')[1])

    const selectedSeatNumbersInRow = seats
      .filter(
        (s) =>
          (selectedSeats.some((sel) => sel.id === s.id) || s.status === SeatStatus.Reserved) &&
          s.label?.[0] === seatRowChar,
      )
      .map((s) => parseInt(s.id.split('-')[1] ?? '0', 10))

    const isSelectedSeatAdjacentToAnySeatInSeatsOnRow =
      selectedSeatNumbersInRow.length === 0 ||
      selectedSeatNumbersInRow.some((num) => Math.abs(num - seatNumber) === 1)
    if (seat.status === SeatStatus.Available && !isSelectedSeatAdjacentToAnySeatInSeatsOnRow) {
      setShowModal(true)
      return
    }

    if (seat.status !== SeatStatus.Unavailable && seat.status !== SeatStatus.Locked) {
      onSelectSeat?.(seat)
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
          categories: eventSeatChartData.categories,
          sections: eventSeatChartData.sections,
          seats: eventSeatChartData.seats,
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
