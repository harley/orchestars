import React, { useEffect, useState } from 'react'
import '@mezh-hq/react-seat-toolkit/styles'
import SeatToolkit, { SeatStatus } from '@mezh-hq/react-seat-toolkit'
import { Armchair, Loader2 } from 'lucide-react'
import seatsJson from '@/components/EventDetail/data/seat-maps/seats.json'
import texts from '@/components/EventDetail/data/seat-maps/texts.json'
import { categories } from './data/seat-maps/categories'

type SeatItem = {
  id: string
  x: number
  y: number
  label: string
  square: boolean
  status: 'Available' | 'Unavailable' | string
  category: string
}

const SeatMapToolkit = ({
  onSelectSeat,
  unavailableSeats,
}: {
  onSelectSeat: (seat: any) => void
  unavailableSeats?: string[]
}) => {
  const [loadingMap, setLoadingMap] = useState(true)
  const [seats, setSeats] = useState<SeatItem[]>([])

  useEffect(() => {
    if (unavailableSeats?.length) {
      const seatSet = new Set(unavailableSeats)
      setSeats(
        seatsJson.map((seat) => ({
          ...seat,
          status: seatSet.has(seat.label) ? 'Unavailable' : 'Available',
        })),
      )
      setLoadingMap(false)
    } else {
      setSeats(seatsJson)
      setLoadingMap(false)
    }
  }, [unavailableSeats])

  const handleSeatClick = (seat: any) => {
    if (seat.status !== SeatStatus.Unavailable && seat.status !== SeatStatus.Locked) {
      onSelectSeat(seat)
      setSeats((prevSeats) => {
        return prevSeats.map((s) => {
          if (
            s.id === seat.id &&
            s.status !== SeatStatus.Unavailable &&
            s.status !== SeatStatus.Locked
          ) {
            return {
              ...s,
              status: s.status === SeatStatus.Reserved ? SeatStatus.Available : SeatStatus.Reserved,
            }
          }
          return s
        })
      })
    }
  }

  return (
    <div className="relative">
      {loadingMap && (
        <div className="absolute z-50 top-[30%] left-1/2 -translate-x-1/2 p-5 bg-gray-100/30 rounded-md flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-12 h-12 animate-spin" />
          <span>Đang tải...</span>
        </div>
      )}
      <SeatToolkit
        mode={'user'}
        events={{
          onSeatClick: handleSeatClick,
        }}
        data={{
          name: 'Categorized Example',
          categories: categories,
          sections: [
            {
              id: '1636dd75-ea0a-48d6-b14c-05ac9db08f5c',
              name: 'Section 1',
              color: '#000000',
              stroke: '#000000',
              freeSeating: false,
            },
            {
              id: '65dfc91f-f7aa-407a-ae55-b31f1ee3a41c',
              name: 'Section 2',
              color: '#FF0000',
              stroke: '#FF0000',
              freeSeating: false,
            },
            {
              id: '6975d973-5a37-4490-bf13-85c156cbb6b3',
              name: 'Section 3',
              color: '#0000FF',
              stroke: '#0000FF',
              freeSeating: false,
            },
          ],
          seats: seats,
          text: texts,
          shapes: [
            {
              id: '60a1c8d8-efd1-4506-a5a8-59ef16571836',
              name: 'RectangleHorizontal',
              x: 117.017578125,
              y: -69.24331676483155,
              width: 1100,
              height: 100,
              rx: 10,
              color: '#990003',
              stroke: '#000000',
            },
          ],
          polylines: [],
          images: [],
          workspace: {
            initialViewBoxScale: 0.605909115101895,
            initialViewBoxScaleForWidth: 1386,
            visibilityOffset: 0,
          },
        }}
        options={{
          shapes: {
            icons: [Armchair],
            overrideDefaultIconset: true,
          },
        }}
      />
    </div>
  )
}

export default SeatMapToolkit
