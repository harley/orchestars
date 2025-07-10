'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Clock, Loader2, MapPin } from 'lucide-react'
import { SeatToolKitItem, SelectedSeat, TicketPrice } from '../../types'
import SeatMapToolkit from './SeatToolkit'
import ConfirmOrderModal from './ConfirmOrderModal'
import { Event, Promotion, PromotionConfig } from '@/payload-types'
import { useRouter } from 'next/navigation'
import { getCookie, setCookie } from '@/utilities/clientCookies'
import axios from 'axios'
import { useTranslate } from '@/providers/I18n/client'
import { format as dateFnsFormat } from 'date-fns'
import { formatMoney } from '@/utilities/formatMoney'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import Link from 'next/link'

export interface TicketPriceSelectedFormValues {
  ticketPrices: Array<{
    ticketPrice: TicketPrice
    quantity: number
  }>
}

const SelectTicket = ({
  event,
  unavailableSeats,
  eventScheduleId,
  promotions,
  eventPromotionConfig,
}: {
  event: Event
  unavailableSeats?: string[]
  eventScheduleId: string
  promotions?: Promotion[]
  eventPromotionConfig?: PromotionConfig
}) => {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslate()

  const [showCheckout, setShowCheckout] = useState(false)

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])
  const handleSeatSelect = useCallback((seat: SeatToolKitItem) => {
    setSelectedSeats((prev) => {
      const existingSeat = prev.find((s) => s.id === seat.id)
      if (existingSeat) {
        return [...prev].filter((s) => s.id !== seat.id)
      } else {
        const ticketPrice = event.ticketPrices?.find(
          (t: any) => t.key === seat.category?.id,
        ) as SelectedSeat['ticketPrice']
        return [...prev, { ...seat, ticketPrice, eventId: event.id }]
      }
    })
  }, [event])

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

  const selectedSchedule = useMemo(() => {
    const schedule = event.schedules?.find((sche) => sche.id === eventScheduleId)

    return schedule
  }, [eventScheduleId, event.schedules])

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

  // const [promotions, setPromotions] = useState<Promotion[]>([])
  // const [eventPromotionConfig, setEventPromotionConfig] = useState<PromotionConfig>()

  const handleCloseCheckoutModal = () => {
    if (showCheckout) {
      // If in checkout flow, go back to seat selection
      setShowCheckout(false)
    }
  }

  // useEffect(() => {
  //   fetch(`/api/promotion?eventId=${event.id}`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setPromotions(data?.promotions || [])
  //       setEventPromotionConfig(data?.eventPromotionConfig)
  //     })
  //     .catch((err) => {
  //       console.log('Error while fetching promotions', err)
  //     })
  // }, [event.id])

  return (
    <section className="py-10">
      <div className="mx-auto px-4 shadow-lg">
        <div className="flex md:flex-row flex-col">
          {/* Left Panel - Seat Selection */}
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="flex md:flex-row flex-col items-center mb-8">
              <Link
                href={`/events/${event.slug}`}
                className="flex md:w-auto w-full md:items-center text-gray-800 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="md:w-5 md:h-5 w-4 h-4 md:mr-2 mr-1" />
                <span className="md:text-base text-sm font-medium">{t('common.back')}</span>
              </Link>
              <h2 className="text-2xl md:text-4xl font-bold mb-4 uppercase mx-auto">
                {t('event.selectTicket')}
              </h2>
            </div>

            {/* Legend */}
            <div className="px-4 py-2 flex items-center justify-center space-x-8 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 border border-gray-300"></div>
                <span>{t('event.notAvailable')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500"></div>
                <span>{t('event.selected')}</span>
              </div>
            </div>
            <div className="text-[13px] italic text-center mb-4 md:hidden">{t('event.guideToPayment')}</div>

            {selectedSchedule ? (
              <SeatMapToolkit
                onSelectSeat={handleSeatSelect}
                unavailableSeats={unavailableSeats}
                selectedSeats={selectedSeats}
                event={event}
              />
            ) : (
              <div className="text-center py-10 text-gray-500 text-base">
                {t('event.pleaseChooseAttendingDateToViewMapSelectingSeat')}
              </div>
            )}
          </div>

          {/* Right Panel - Event Details */}
          <div className="w-full md:w-80 p-4 pt-5">
            <h3 className="text-lg font-bold mb-2">{event.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
              <Clock size={16} />
              <span>
                {selectedSchedule?.date &&
                  dateFnsFormat(new Date(selectedSchedule.date), 'dd/MM/yyyy')}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700 mb-6">
              <MapPin size={16} className="mt-1" />
              <span className="whitespace-pre-line">{event.eventLocation}</span>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-sm mb-2">{t('event.ticketPrices')}</h4>
              <div className="space-y-1">
                {event.ticketPrices?.map((price, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-4 h-4 rounded"
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
                    <span className="flex-1">
                      {formatMoney(price.price || 0, price.currency || 'VND')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">{t('event.selectedSeats')}</h4>
                <div className="space-y-1 text-sm">
                  {selectedSeats.map((seat) => (
                    <div key={seat.id} className="flex justify-between">
                      <span>
                        {t('event.seat')} {seat.label}
                      </span>
                      <span>{formatMoney(seat.ticketPrice.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-300 mt-4 pt-2 flex justify-between font-bold text-base">
                  <span>{t('event.total')}</span>
                  <span className='total-value'>{formatMoney(calculateTotal())}</span>
                </div>
                <Button
                  onClick={handleBuyTickets}
                  className="w-full mt-4 bg-black text-white hover:bg-gray-800"
                  disabled={isLoadingSeatHolding}
                >
                  {isLoadingSeatHolding ? (
                    <Loader2 className="animate-spin h-5 w-5 text-white mx-auto" />
                  ) : (
                    t('seatSelection.holdAndPay')
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <Dialog open={showCheckout} onOpenChange={handleCloseCheckoutModal} >
          <DialogContent aria-describedby={undefined} className="max-w-[90vw] w-full mx-auto my-4 h-[95vh] overflow-y-auto top-0 left-0 bottom-0 right-0 translate-x-0 translate-y-0 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 flex justify-between items-center">
                <button
                  onClick={handleCloseCheckoutModal}
                  className="flex items-center gap-2 hover:text-gray-300 transition-colors"
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
                promotions={promotions || []}
                eventScheduleId={eventScheduleId}
                eventPromotionConfig={eventPromotionConfig}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}

export default SelectTicket
