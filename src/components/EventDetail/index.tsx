'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Calendar, MapPin } from 'lucide-react'
import { format as dateFnsFormat } from 'date-fns'
import Schedule from './Schedule'
import FAQ from './FAQ'
import FeaturedPerformers from './FeaturedPerformers'
import { SeatToolKitItem, SelectedSeat } from './types'
import SeatMapToolkit from './SeatToolkit'
import { categories } from './data/seat-maps/categories'
import ConfirmOrderModal from './ConfirmOrderModal'
import { Event } from '@/types/Event'
import { Performer } from '@/types/Performer'
import { FAQType } from '@/types/FAQ'
import TermCondition from './TermCondition'

const TicketDetails = ({
  event,
  performers,
  faqs,
}: {
  event: Event
  performers: Performer[]
  faqs: FAQType[]
}) => {
  console.log('event', event)
  const { toast } = useToast()
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])

  const handleSeatSelect = (seat: SeatToolKitItem) => {
    setSelectedSeats((prev) => {
      const existingSeat = prev.find((s) => s.id === seat.id)
      if (existingSeat) {
        return prev.filter((s) => s.id !== seat.id)
      } else {
        const ticketPrice = event.ticketPrices?.find(
          (t: any) => t.name === seat.category?.name,
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

  const calculateTotal = () => {
    return Object.values(ticketSelected).reduce((sum, tk) => sum + tk.total, 0)
  }

  const handleBuyTickets = () => {
    const total = calculateTotal()
    if (total === 0) {
      toast({
        title: 'Please select at least one ticket or seat',
      })
      return
    }

    handleOpenConfirmOrderModal(true)
  }

  const [isOpenConfirmOrderModal, handleOpenConfirmOrderModal] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <ConfirmOrderModal
        isOpen={isOpenConfirmOrderModal}
        onCloseModal={handleOpenConfirmOrderModal}
        selectedSeats={selectedSeats}
      />

      <main className="flex-grow">
        <section className="relative h-[500px] md:h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${event.eventBanner?.url})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>

          <div className="relative z-20 h-full flex items-end">
            <div className="container mx-auto px-6 md:px-10 pb-16 md:pb-20 w-full">
              <div className="max-w-3xl">
                {/* {event.sponsor && (
                  <div className="inline-block px-3 py-1 mb-3 border border-white/30 rounded-full backdrop-blur text-xs text-white/90">
                    Powered by <span className="font-semibold">MelodySale</span>
                  </div>
                )} */}

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4 animate-fade-in">
                  {event.title}
                </h1>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-white/90 mb-8">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>
                      {event.startDatetime &&
                        dateFnsFormat(new Date(event.startDatetime), 'dd/MM/yyyy HH:mm a')}{' '}
                      -{' '}
                      {event.endDatetime &&
                        dateFnsFormat(new Date(event.endDatetime), 'dd/MM/yyyy HH:mm a')}
                    </span>
                  </div>
                  {event.eventLocation && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{event.eventLocation}</span>
                    </div>
                  )}

                  {/* <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{'-/300'} attendees</span>
                  </div> */}
                </div>

                {/* <CustomButton
                  variant="interested"
                  size="lg"
                  className="shadow-lg"
                  onClick={handleBuyTickets}
                >
                  Get Tickets
                </CustomButton> */}
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="w-full max-w-4xl mx-auto">
              <h3 className="text-xl font-bold mb-4">Đặt chỗ</h3>
              {/* Seat type legend */}
              <div className="flex flex-wrap gap-4 mb-6 justify-center">
                {event.ticketPrices?.map((option: any) => (
                  <div key={option.id} className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded mr-2`}
                      style={{
                        backgroundColor: categories.find((c) => c.name === option.name)?.color,
                      }}
                    ></div>
                    <span>
                      {option.name} {' - '}
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: option.currency,
                      }).format(option.price)}
                    </span>
                  </div>
                ))}
              </div>

              <SeatMapToolkit onSelectSeat={handleSeatSelect} />
              {/* <SeatMap
                onSeatSelect={handleSeatSelect}
                selectedSeats={selectedSeats}
                event={event}
              /> */}
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
                  className="w-full cursor-pointer mt-6 bg-gradient-to-r text-white from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  Thanh toán
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
