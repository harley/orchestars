'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Clock, Loader2, MapPin } from 'lucide-react'
import { isSameDay } from 'date-fns'
import { SeatToolKitItem, SelectedSeat, TicketPrice } from '../../types'
import SeatMapToolkit from './SeatToolkit'
import ConfirmOrderModal from './ConfirmOrderModal'
import { Event, Promotion } from '@/payload-types'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { getCookie, setCookie } from '@/utilities/clientCookies'
import axios from 'axios'
import { useTranslate } from '@/providers/I18n/client'
import { format as dateFnsFormat } from 'date-fns'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { formatMoney } from '@/utilities/formatMoney'

export interface TicketPriceSelectedFormValues {
  ticketPrices: Array<{
    ticketPrice: TicketPrice
    quantity: number
  }>
}

const SeatMapSelection = ({
  event,
  unavailableSeats,
}: {
  event: Event
  unavailableSeats?: string[]
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { t } = useTranslate()

  const [isOpen, setIsOpen] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

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

  const eventScheduleId = searchParams.get('eventScheduleId')

  const selectedSchedule = useMemo(() => {
    const schedule = event.schedules?.find((sche) => sche.id === eventScheduleId)

    return schedule
  }, [eventScheduleId, event.schedules])

  const handleDateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const date = new Date(e.target.value)

    const schedule = date
      ? event.schedules?.find((sche) => isSameDay(sche.date as string, date))
      : null
    const eventScheduleId = schedule?.id || ''
    const newPathname = `${pathname}?eventScheduleId=${eventScheduleId}`

    router.replace(newPathname, { scroll: false })
  }

  const calculateTotal = () => {
    return Object.values(ticketSelected).reduce((sum, tk) => sum + tk.total, 0)
  }

  const [isLoadingSeatHolding, setLoadingSeatHolding] = useState(false)
  const handleBuyTickets = async () => {
    try {
      if (!selectedSchedule) {
        return toast({
          title: t('event.pleaseChooseAttendingDate'),
          variant: 'destructive',
          duration: 3000,
        })
      }

      const total = calculateTotal()
      if (total === 0) {
        toast({
          title: t('event.pleaseSelectTicket'),
          variant: 'destructive',
        })
        return
      }

      setLoadingSeatHolding(true)

      const seatHoldingCode = getCookie('seatHoldingCode')

      const seatNames = selectedSeats.map((s) => s.label).join(',')

      const result = await axios
        .post('/api/seat-holding/seat', {
          seatName: seatNames,
          eventId: event.id,
          seatHoldingCode,
          eventScheduleId,
        })
        .then((res) => res.data)

      setCookie('seatHoldingCode', result.seatHoldingCode, new Date(result.expireTime))

      setShowCheckout(true)
    } catch (error: any) {
      console.log('error', error)
      toast({
        title: error?.response?.data?.message || t('message.errorHoldingSeatAndPayment'),
        variant: 'destructive',
      })
    } finally {
      setLoadingSeatHolding(false)
    }
  }

  const [promotions, setPromotions] = useState<Promotion[]>([])

  const handleCloseSeatMapSelection = () => {
    if (showCheckout) {
      // If in checkout flow, go back to seat selection
      setShowCheckout(false)
    } else {
      // Otherwise close the dialog
      setIsOpen(false)
      setSelectedSeats([])
    }
  }

  useEffect(() => {
    fetch(`/api/promotion?eventId=${event.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPromotions(data)
      })
      .catch((err) => {
        console.log('Error while fetching promotions', err)
      })
  }, [event.id])

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold mb-4 uppercase">{t('event.ticket')}</h2>
        <p className="text-lg mb-8">{t('event.selectDateToAttend')}</p>

        <div className="border rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-black text-white">
            <div className="p-4 font-medium">{t('event.dateTime')}</div>
            <div className="p-4 font-medium text-center">{t('event.event')}</div>
            <div className="p-4 font-medium text-center">{t('event.ticket')}</div>
          </div>

          {/* Table Row */}
          <div className="grid grid-cols-3 border-t">
            <div className="p-4 flex items-center">
              <div className="relative w-full">
                {event.schedules && event.schedules.length > 0 ? (
                  <select
                    className="appearance-none w-full border border-gray-300 rounded-md py-2 pl-4 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    onChange={handleDateSelect}
                    value={selectedSchedule?.date || undefined}
                    defaultValue={undefined}
                  >
                    <option value="none" selected disabled hidden>
                      Select a date
                    </option>
                    {event.schedules.map(
                      (schedule) =>
                        schedule.date && (
                          <option key={schedule.id ?? schedule.date} value={schedule.date}>
                            {dateFnsFormat(new Date(schedule.date), 'dd/MM/yyyy')}
                          </option>
                        ),
                    )}
                  </select>
                ) : (
                  <div className="py-2 pl-4">{t('event.noDateAvailable')}</div>
                )}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-4 flex flex-col justify-center items-center">
              <div className="font-bold">{event.title}</div>
            </div>
            <div className="p-4 flex items-center justify-center">
              {/* Use SeatSelection component */}
              <>
                <Button
                  onClick={() => setIsOpen(true)}
                  className="bg-black text-white rounded-md py-2 px-3 md:px-6 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedSchedule}
                >
                  {t('event.selectTicket')}
                </Button>

                <Dialog open={isOpen} onOpenChange={handleCloseSeatMapSelection}>
                  <DialogContent className="max-w-[90vw] w-full mx-auto my-4 h-[95vh] overflow-y-auto top-0 left-0 bottom-0 right-0 translate-x-0 translate-y-0 p-0 bg-black">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="bg-black text-white p-4 flex justify-between items-center">
                        <button
                          onClick={handleCloseSeatMapSelection}
                          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                        >
                          <ArrowLeft size={20} />
                          <span>{t('common.back')}</span>
                        </button>
                        <div className="text-center">
                          <h2 className="text-xl font-medium">
                            {showCheckout ? t('event.checkout') : t('event.selectTicket')}
                          </h2>
                        </div>
                        <div className="w-20"></div> {/* Spacer for centering */}
                      </div>

                      {!showCheckout ? (
                        <>
                          {/* Legend */}
                          <div className="bg-black text-white px-4 py-2 flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-white border border-white"></div>
                              <span>{t('event.notAvailable')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-red-500 border border-red-500"></div>
                              <span>{t('event.selected')}</span>
                            </div>
                          </div>

                          {/* Main content with seat map */}
                          <div className="flex flex-col md:flex-row h-full">
                            {/* Seat map */}
                            <div className="flex-grow bg-black text-white overflow-auto">
                              <div className="text-center py-4 px-2">
                                <SeatMapToolkit
                                  onSelectSeat={handleSeatSelect}
                                  unavailableSeats={unavailableSeats}
                                  selectedSeats={selectedSeats}
                                />

                                <div className="text-center py-2">
                                  <h3 className="font-medium">{t('event.balcony')}</h3>
                                </div>
                              </div>
                            </div>

                            {/* Sidebar with event details and pricing */}
                            <div className="md:w-96 bg-gray-900 text-white p-4">
                              <div className="mb-6">
                                <h3 className="text-xl font-bold mb-2">{event.title}</h3>

                                <div className="flex items-center gap-2 text-sm mt-4">
                                  <Clock size={16} />
                                  <span>
                                    {selectedSchedule?.date &&
                                      dateFnsFormat(new Date(selectedSchedule?.date), 'dd/MM/yyyy')}
                                  </span>
                                </div>

                                <div className="flex items-start gap-2 text-sm mt-2">
                                  <MapPin size={16} className="mt-1" />
                                  <span className="whitespace-pre-line">{event.eventLocation}</span>
                                </div>
                              </div>

                              <div className="mt-8">
                                <h3 className="text-lg font-bold mb-4">
                                  {t('event.ticketPrices')}
                                </h3>

                                <div className="space-y-2">
                                  {event.ticketPrices?.map((price, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <div
                                        className="w-4 h-4"
                                        style={{
                                          backgroundColor:
                                            price.key === 'zone1'
                                              ? '#D93939'
                                              : price.key === 'zone2'
                                                ? '#E39649'
                                                : price.key === 'zone3'
                                                  ? '#D9C739'
                                                  : price.key === 'zone4'
                                                    ? '#39AED9'
                                                    : price.key === 'zone5'
                                                      ? '#5EBF70'
                                                      : '#CCCCCC',
                                        }}
                                      ></div>
                                      <span className="flex-1 max-w-[100px]">{price.name}</span>
                                      &nbsp;-&nbsp;
                                      <span className="flex-1 ">
                                        {formatMoney(price.price || 0, price.currency || 'VND')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {selectedSeats.length > 0 && (
                                <div className="mt-8">
                                  <h3 className="text-lg font-bold mb-4">
                                    {t('event.selectedSeats')}
                                  </h3>
                                  <div className="space-y-2">
                                    {selectedSeats.map((seat) => (
                                      <div key={seat.id} className="flex justify-between">
                                        <span>
                                          {t('event.seat')} {seat.label}
                                        </span>
                                        <span>{formatMoney(seat.ticketPrice.price)}</span>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="mt-4 pt-4 border-t border-gray-700">
                                    <div className="flex justify-between font-bold text-xl">
                                      <span>{t('event.total')}</span>
                                      <span>{formatMoney(calculateTotal())}</span>
                                    </div>
                                  </div>

                                  <Button
                                    onClick={handleBuyTickets}
                                    className="w-full mt-4 bg-gray-800 text-white hover:bg-gray-700"
                                    disabled={isLoadingSeatHolding}
                                  >
                                    {isLoadingSeatHolding && (
                                      <Loader2
                                        className={'my-28 h-16 w-16 text-primary/60 animate-spin'}
                                      />
                                    )}
                                    {t('seatSelection.holdAndPay')}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <ConfirmOrderModal
                          onCloseModal={(options?: { resetSeat?: boolean }) => {
                            setShowCheckout(false)
                            if (options?.resetSeat) {
                              setSelectedSeats([])
                              router.refresh()
                            }
                          }}
                          selectedSeats={selectedSeats}
                          event={event}
                          promotions={promotions}
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SeatMapSelection
