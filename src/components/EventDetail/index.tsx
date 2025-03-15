'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { isSameDay } from 'date-fns'
import Schedule from './Schedule'
import FAQ from './FAQ'
import FeaturedPerformers from './FeaturedPerformers'
import { SeatToolKitItem, SelectedSeat } from './types'
import SeatMapToolkit from './SeatToolkit'
import ConfirmOrderModal from './ConfirmOrderModal'
import { Performer } from '@/types/Performer'
import { FAQType } from '@/types/FAQ'
import TermCondition from './TermCondition'
import { Event } from '@/payload-types'
import DetailDescription from './DetailDescription'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { getCookie, setCookie } from '@/utilities/clientCookies'
import axios from 'axios'
import DateSelector from './DateSelector'
import TicketPrices from './TicketPrices'
import EventBanner from './EventBanner'

const TicketDetails = ({
  event,
  performers,
  faqs,
  unavailableSeats,
}: {
  event: Event
  performers: Performer[]
  faqs: FAQType[]
  unavailableSeats?: string[]
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])

  const handleSeatSelect = (seat: SeatToolKitItem) => {
    setSelectedSeats((prev) => {
      const existingSeat = prev.find((s) => s.id === seat.id)
      if (existingSeat) {
        return prev.filter((s) => s.id !== seat.id)
      } else {
        const ticketPrice = event.ticketPrices?.find(
          (t: any) => t.key === seat.category?.id,
        ) as SelectedSeat['ticketPrice']
        return [...prev, { ...seat, ticketPrice, eventId: event.id }]
      }
    })
  }

  const ticketSelected = useMemo(() => {
    return selectedSeats.reduce(
      (obj, item) => {
        const ticketId = item?.ticketPrice?.id
        if (!obj[ticketId]) {
          obj[ticketId] = {
            id: ticketId,
            ticketName: item.ticketPrice?.name,
            seats: [],
            total: 0,
            quantity: 0,
            currency: item.ticketPrice?.currency,
          }
        }
        obj[ticketId].seats.push(item.label)
        obj[ticketId].total += item.ticketPrice?.price || 0
        obj[ticketId].quantity += 1

        return obj
      },
      {} as Record<
        string,
        {
          id: string
          ticketName: string
          seats: string[]
          total: number
          quantity: number
          currency?: string
        }
      >,
    )
  }, [selectedSeats])

  const [loadingScheduleMap, setLoadingScheduleMap] = useState(false)

  const eventScheduleId = searchParams.get('eventScheduleId')

  const selectedSchedule = useMemo(() => {
    const schedule = event.schedules?.find((sche) => sche.id === eventScheduleId)

    setLoadingScheduleMap(false)

    return schedule
  }, [eventScheduleId, event.schedules])

  const handleDateSelect = (date: Date | undefined) => {
    setLoadingScheduleMap(true)
    setSelectedSeats([])
    console.log('pathname', pathname)

    const schedule = date
      ? event.schedules?.find((sche) => isSameDay(sche.date as string, date))
      : null
    const eventScheduleId = schedule?.id || ''
    const newPathname = `${pathname}?eventScheduleId=${eventScheduleId}`

    router.push(newPathname, { scroll: false })
  }

  const calculateTotal = () => {
    return Object.values(ticketSelected).reduce((sum, tk) => sum + tk.total, 0)
  }

  const [isLoadingSeatHolding, setLoadingSeatHolding] = useState(false)
  const handleBuyTickets = async () => {
    try {
      const total = calculateTotal()
      if (total === 0) {
        toast({
          title: 'Vui lòng chọn ghế',
          variant: 'destructive',
        })
        return
      }

      setLoadingSeatHolding(true)

      const seatHoldingCode = getCookie('seatHoldingCode')

      const seatNames = selectedSeats.map((s) => s.label).join(',')

      const result = await axios
        .post('/api/seat-holding', {
          seatName: seatNames,
          eventId: event.id,
          seatHoldingCode,
          eventScheduleId,
        })
        .then((res) => res.data)

      setCookie('seatHoldingCode', result.seatHoldingCode, new Date(result.expireTime))

      handleOpenConfirmOrderModal(true)
    } catch (error: any) {
      console.log('error', error)
      toast({
        title:
          error?.response?.data?.message || 'Có lỗi xảy ra khi tiến hành giữ chỗ và thanh toán',
        variant: 'destructive',
      })
    } finally {
      setLoadingSeatHolding(false)
    }
  }

  const [isOpenConfirmOrderModal, handleOpenConfirmOrderModal] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <ConfirmOrderModal
        isOpen={isOpenConfirmOrderModal}
        onCloseModal={(options?: { resetSeat?: boolean }) => {
          handleOpenConfirmOrderModal(false)
          if (options?.resetSeat) {
            setSelectedSeats([])
            router.refresh()
          }
        }}
        selectedSeats={selectedSeats}
        event={event}
      />

      <main className="flex-grow">
        <EventBanner event={event} />

        <DetailDescription event={event} />

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="w-full max-w-4xl mx-auto">
              <h3 className="text-xl font-bold mb-4">Đặt chỗ</h3>
              {/* Seat type legend */}
              <TicketPrices ticketPrices={event.ticketPrices} />

              <div className="relative">
                {loadingScheduleMap && (
                  <div className="absolute z-50 top-[30%] left-1/2 -translate-x-1/2 p-5 bg-gray-100/30 rounded-md flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <span>Đang tải...</span>
                  </div>
                )}
                <DateSelector
                  schedules={event.schedules || []}
                  selectedDate={
                    selectedSchedule?.date ? new Date(selectedSchedule?.date) : undefined
                  }
                  onDateSelect={handleDateSelect}
                />

                {!!selectedSchedule ? (
                  <SeatMapToolkit
                    onSelectSeat={handleSeatSelect}
                    unavailableSeats={unavailableSeats}
                  />
                ) : (
                  <div className="text-center py-8 bg-gray-100 rounded-lg">
                    <p className="text-lg text-gray-600">
                      Vui lòng chọn ngày tham dự để xem sơ đồ chọn ghế
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Vé đã chọn</h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md relative">
                {!Object.values(ticketSelected).length ? (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    Vui lòng chọn vé
                  </div>
                ) : (
                  Object.values(ticketSelected).map((option) => (
                    <div key={option.id} className="mb-6 last:mb-0">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{option.ticketName}</h3>
                          <p className="text-gray-600">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: option.currency || 'VND',
                            }).format(option.total)}
                          </p>
                        </div>
                        <div className="w-24">
                          <Input
                            value={option.quantity}
                            readOnly
                            disabled
                            className="w-full text-center"
                          />
                        </div>
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))
                )}
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Ghế đã chọn</h3>
                {selectedSeats.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    {/* <h4 className="font-medium mb-2">Ghế đã chọn:</h4> */}
                    {selectedSeats.map((seat) => (
                      <div key={seat.id} className="flex justify-between mb-2">
                        <span>Ghế {seat.label}</span>
                        <span>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: seat.ticketPrice?.currency || 'VND',
                          }).format(seat.ticketPrice?.price || 0)}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-xl">
                  <span>Tổng</span>
                  <span>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(calculateTotal() || 0)}{' '}
                  </span>
                </div>

                <Button
                  onClick={handleBuyTickets}
                  disabled={isLoadingSeatHolding}
                  className="w-full cursor-pointer mt-6 bg-gradient-to-r text-white from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  {isLoadingSeatHolding && (
                    <Loader2 className={'my-28 h-16 w-16 text-primary/60 animate-spin'} />
                  )}
                  Giữ chỗ và Thanh toán
                </Button>
              </div>
            </div>
          </div>
        </section>

        <FeaturedPerformers performers={performers} />

        {!!event.schedules?.length && <Schedule schedules={event.schedules} />}

        {event.eventTermsAndConditions && (
          <TermCondition termCondition={event.eventTermsAndConditions} />
        )}

        {faqs?.length > 0 && <FAQ faqs={faqs} />}
      </main>
    </div>
  )
}

export default TicketDetails
