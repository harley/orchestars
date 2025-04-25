'use client'

import React, { useState } from 'react'
import { Event } from '@/payload-types'
import { useTranslate } from '@/providers/I18n/client'
import { ArrowLeft, Clock, MapPin } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { format as dateFnsFormat } from 'date-fns'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/utilities/formatMoney'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import CheckoutForm from './CheckoutForm'
import { useToast } from '@/hooks/use-toast'
import { getCookie, setCookie } from '@/utilities/clientCookies'
import axios from 'axios'
import { SeatToolKitItem, SelectedSeat } from '../../types'
import SeatMapToolkit from '../../SeatReservation/SeatMapSelection/SeatToolkit'

interface SeatSelectionProps {
  event: Event
  unavailableSeats?: string[]
  onComplete?: () => void
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  event,
  unavailableSeats = [],
  onComplete,
}) => {
  const { t } = useTranslate()
  // const router = useRouter()
  const searchParams = useSearchParams()
  const eventScheduleId = searchParams?.get('eventScheduleId')
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])
  const [showCheckout, setShowCheckout] = useState(false)

  // Handle closing the seat selection dialog
  const handleClose = () => {
    setSelectedSeats([])
    if (showCheckout) {
      // If in checkout flow, go back to seat selection
      setShowCheckout(false)
    } else {
      // Otherwise close the dialog
      setIsOpen(false)
    }
  }

  // Handle seat selection
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

  // Handle proceed to payment
  const handleProceedToPayment = async () => {
    if (selectedSeats.length === 0) {
      return // Don't proceed if no seats selected
    }

    // Check if eventScheduleId exists
    if (!eventScheduleId) {
      toast({
        title: t('event.pleaseChooseAttendingDate'),
        variant: 'destructive',
        duration: 3000,
      })
      return
    }

    const total = calculateTotal()
    if (total === 0) {
      toast({
        title: t('event.pleaseSelectTicket'),
        variant: 'destructive',
      })
      return
    }

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

    // Show checkout form
    setShowCheckout(true)
  }

  // Handle completion of checkout process
  const handleCheckoutComplete = () => {
    // Close the dialog and call onComplete if provided
    if (onComplete) {
      onComplete()
    }

    setIsOpen(false)
    setShowCheckout(false)
    setSelectedSeats([])
  }

  // Calculate total price of selected seats
  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      return total + seat.ticketPrice.price
    }, 0)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-black text-white rounded-md py-2 px-6 hover:bg-gray-800 transition-colors"
      >
        {t('event.selectTicket')}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[90vw] w-full mx-auto my-4 h-[90vh] overflow-y-auto top-0 left-0 bottom-0 right-0 translate-x-0 translate-y-0 p-0 bg-black">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <button
                onClick={handleClose}
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
                      />

                      <div className="mt-4 text-center py-2">
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
                          {event.startDatetime &&
                            dateFnsFormat(new Date(event.startDatetime), 'HH:mm, dd/MM/yyyy')}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-sm mt-2">
                        <MapPin size={16} className="mt-1" />
                        <span className="whitespace-pre-line">{event.eventLocation}</span>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-bold mb-4">{t('event.ticketPrices')}</h3>

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
                        <h3 className="text-lg font-bold mb-4">{t('event.selectedSeats')}</h3>
                        <div className="max-h-40 overflow-y-auto space-y-2">
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
                          onClick={handleProceedToPayment}
                          className="w-full mt-4 bg-gray-800 text-white hover:bg-gray-700"
                        >
                          {t('seatSelection.proceedToPayment')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <CheckoutForm
                selectedSeats={selectedSeats}
                event={event}
                onCancel={() => {
                  setSelectedSeats([])
                  setShowCheckout(false)
                }}
                onComplete={handleCheckoutComplete}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SeatSelection
