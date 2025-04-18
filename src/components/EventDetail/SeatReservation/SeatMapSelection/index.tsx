'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { isSameDay } from 'date-fns'
import { SeatToolKitItem, SelectedSeat, TicketPrice } from '../../types'
import SeatMapToolkit from './SeatToolkit'
import ConfirmOrderModal from './ConfirmOrderModal'
import { Event, Promotion } from '@/payload-types'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { getCookie, setCookie } from '@/utilities/clientCookies'
import axios from 'axios'
import DateSelector from '../DateSelector'
import TicketPrices from '../TicketPrices'
import { formatMoney } from '@/utilities/formatMoney'
import { useTranslate } from '@/providers/I18n/client'

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
    // setSelectedSeats([])

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

      handleOpenConfirmOrderModal(true)
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

  const [isOpenConfirmOrderModal, handleOpenConfirmOrderModal] = useState(false)

  const [promotions, setPromotions] = useState<Promotion[]>([])

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
    <>
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
        promotions={promotions}
      />

      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-700 to-gray-950 bg-clip-text text-transparent">
                {t('seatSelection.booking')}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gray-950 to-gray-700 mx-auto mt-4 rounded-full" />
            </div>

            <DateSelector
              schedules={event.schedules || []}
              selectedDate={selectedSchedule?.date ? new Date(selectedSchedule?.date) : undefined}
              onDateSelect={handleDateSelect}
            />

            <TicketPrices ticketPrices={event.ticketPrices} />
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-700 to-gray-950 bg-clip-text text-transparent">
                {t('seatSelection.stageMap')}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gray-950 to-gray-700 mx-auto mt-4 rounded-full" />
            </div>
            <div className="relative">
              {loadingScheduleMap && (
                <div className="absolute z-50 top-[30%] left-1/2 -translate-x-1/2 p-5 bg-gray-100/30 rounded-md flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <span>{t('common.loading')}</span>
                </div>
              )}

              {!!selectedSchedule ? (
                <SeatMapToolkit
                  onSelectSeat={handleSeatSelect}
                  unavailableSeats={unavailableSeats}
                />
              ) : (
                <div className="text-center py-8 bg-gray-100 rounded-lg">
                  <p className="text-lg text-gray-600">{t('seatSelection.selectDatePrompt')}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-8 text-center mt-4">
              {t('seatSelection.selectedTickets')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md relative">
                {!Object.values(ticketSelected).length ? (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {t('seatSelection.selectTicketsPrompt')}
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
                {selectedSeats.length > 0 && (
                  <>
                    <h3 className="text-xl font-bold mb-4">{t('seatSelection.selectedSeats')}</h3>
                    <Separator className="my-4" />
                    {selectedSeats.map((seat) => (
                      <div key={seat.id} className="flex justify-between mb-2">
                        <span>
                          {t('event.seat')} {seat.label}
                        </span>
                        <span>
                          {formatMoney(
                            seat.ticketPrice?.price || 0,
                            seat.ticketPrice?.currency || 'VND',
                          )}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-xl">
                  <span>{t('seatSelection.total')}</span>
                  <span>{formatMoney(calculateTotal())}</span>
                </div>

                <Button
                  onClick={handleBuyTickets}
                  disabled={isLoadingSeatHolding}
                  className="w-full cursor-pointer mt-6 bg-gradient-to-r text-white from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  {isLoadingSeatHolding && (
                    <Loader2 className={'my-28 h-16 w-16 text-primary/60 animate-spin'} />
                  )}
                  {t('seatSelection.holdAndPay')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default SeatMapSelection
