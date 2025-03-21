'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Loader2, XCircle } from 'lucide-react'
import { isSameDay } from 'date-fns'
import { TicketPrice } from '../types'
// import SeatMapToolkit from './SeatToolkit'
// import ConfirmOrderModal from './ConfirmOrderModal'
import { Event } from '@/payload-types'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { getCookie, setCookie } from '@/utilities/clientCookies'
import axios from 'axios'
import DateSelector from './DateSelector'
import TicketPrices from './TicketPrices'
import { formatMoney } from '@/utilities/formatMoney'
import { useFieldArray, useForm } from 'react-hook-form'
import ConfirmOrderWithTicketClassModal from './ConfirmOrderWithTicketClassModal'
import Image from 'next/image'

export interface TicketPriceSelectedFormValues {
  ticketPrices: Array<{
    ticketPrice: TicketPrice
    quantity: number
  }>
}

const SeatReservationClient = ({
  event,
  // unavailableSeats,
}: {
  event: Event
  unavailableSeats?: string[]
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // hidden for inactive seat selection
  // const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])

  // const handleSeatSelect = (seat: SeatToolKitItem) => {
  //   setSelectedSeats((prev) => {
  //     const existingSeat = prev.find((s) => s.id === seat.id)
  //     if (existingSeat) {
  //       return prev.filter((s) => s.id !== seat.id)
  //     } else {
  //       const ticketPrice = event.ticketPrices?.find(
  //         (t: any) => t.key === seat.category?.id,
  //       ) as SelectedSeat['ticketPrice']
  //       return [...prev, { ...seat, ticketPrice, eventId: event.id }]
  //     }
  //   })
  // }

  // const ticketSelected = useMemo(() => {
  //   return selectedSeats.reduce(
  //     (obj, item) => {
  //       const ticketId = item?.ticketPrice?.id
  //       if (!obj[ticketId]) {
  //         obj[ticketId] = {
  //           id: ticketId,
  //           ticketName: item.ticketPrice?.name,
  //           seats: [],
  //           total: 0,
  //           quantity: 0,
  //           currency: item.ticketPrice?.currency,
  //         }
  //       }
  //       obj[ticketId].seats.push(item.label)
  //       obj[ticketId].total += item.ticketPrice?.price || 0
  //       obj[ticketId].quantity += 1

  //       return obj
  //     },
  //     {} as Record<
  //       string,
  //       {
  //         id: string
  //         ticketName: string
  //         seats: string[]
  //         total: number
  //         quantity: number
  //         currency?: string
  //       }
  //     >,
  //   )
  // }, [selectedSeats])

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

  // const calculateTotal = () => {
  //   return Object.values(ticketSelected).reduce((sum, tk) => sum + tk.total, 0)
  // }

  const {
    register: registerTicketPriceForm,
    handleSubmit: handleSubmitTicketPriceForm,
    control,
    watch: watchTicketPricesForm,
    setValue: setValueTicketPriceForm,
    formState: { errors: errorsTicketPriceForm, isSubmitting: isSubmittingTicketPriceForm },
  } = useForm<TicketPriceSelectedFormValues>()

  const watchTicketPricesSelected = watchTicketPricesForm('ticketPrices') || []

  const { fields: ticketPricesSelected, remove: removeTicketPriceSelected } = useFieldArray({
    control: control,
    name: 'ticketPrices',
  })

  const handleToggleTicketPrice = (ticketPrice: TicketPrice) => {
    const exist = watchTicketPricesSelected.find((slt) => slt.ticketPrice?.id === ticketPrice.id)
    if (!exist) {
      const newArr = watchTicketPricesSelected
      newArr.push({ ticketPrice, quantity: 1 })
      setValueTicketPriceForm('ticketPrices', newArr)
    } else {
      const newArr = watchTicketPricesSelected.filter(
        (slt) => slt.ticketPrice?.id !== ticketPrice.id,
      )
      setValueTicketPriceForm('ticketPrices', newArr)
    }
  }

  const calculateTotalTicketPrices = () => {
    return (watchTicketPricesSelected || []).reduce((total, item, idx) => {
      if (!errorsTicketPriceForm.ticketPrices?.[idx]?.message) {
        const price = item.ticketPrice?.price || 0
        total += price * (Number(item.quantity) || 0)
      }
      return total
    }, 0)
  }

  // const [isLoadingSeatHolding, setLoadingSeatHolding] = useState(false)
  // const handleBuyTickets = async () => {
  //   try {
  //     const total = calculateTotal()
  //     if (total === 0) {
  //       toast({
  //         title: 'Vui lòng chọn ghế',
  //         variant: 'destructive',
  //       })
  //       return
  //     }

  //     setLoadingSeatHolding(true)

  //     const seatHoldingCode = getCookie('seatHoldingCode')

  //     const seatNames = selectedSeats.map((s) => s.label).join(',')

  //     const result = await axios
  //       .post('/api/seat-holding/seat', {
  //         seatName: seatNames,
  //         eventId: event.id,
  //         seatHoldingCode,
  //         eventScheduleId,
  //       })
  //       .then((res) => res.data)

  //     setCookie('seatHoldingCode', result.seatHoldingCode, new Date(result.expireTime))

  //     handleOpenConfirmOrderModal(true)
  //   } catch (error: any) {
  //     console.log('error', error)
  //     toast({
  //       title:
  //         error?.response?.data?.message || 'Có lỗi xảy ra khi tiến hành giữ chỗ và thanh toán',
  //       variant: 'destructive',
  //     })
  //   } finally {
  //     setLoadingSeatHolding(false)
  //   }
  // }

  const onSubmitTicketPriceForm = async (data: TicketPriceSelectedFormValues) => {
    try {
      console.log('data', data)
      if (!data.ticketPrices?.length) {
        return toast({
          title: 'Vui lòng chọn vé',
          variant: 'destructive',
          duration: 3000,
        })
      }

      if (!selectedSchedule) {
        return toast({
          title: 'Vui lòng chọn ngày',
          variant: 'destructive',
          duration: 3000,
        })
      }

      const seatHoldingCode = getCookie('seatHoldingCode')

      const ticketClasses = data.ticketPrices.map((tk) => ({
        name: tk.ticketPrice?.name,
        quantity: Number(tk.quantity),
      }))

      const result = await axios
        .post('/api/seat-holding/ticket-class', {
          ticketClasses: ticketClasses,
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
        duration: 3000,
      })
    }
  }

  const [isOpenConfirmOrderModal, handleOpenConfirmOrderModal] = useState(false)

  return (
    <>
      <ConfirmOrderWithTicketClassModal
        isOpen={isOpenConfirmOrderModal}
        onCloseModal={(_options?: { resetSeat?: boolean }) => {
          handleOpenConfirmOrderModal(false)
        }}
        selectedTicketPrices={watchTicketPricesSelected}
        event={event}
      />
      {/* <ConfirmOrderModal
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
      /> */}

      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-4xl mx-auto">
            <form onSubmit={handleSubmitTicketPriceForm(onSubmitTicketPriceForm)}>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-700 to-gray-950 bg-clip-text text-transparent">
                  Đặt chỗ
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-gray-950 to-gray-700 mx-auto mt-4 rounded-full" />
              </div>

              <DateSelector
                schedules={event.schedules || []}
                selectedDate={selectedSchedule?.date ? new Date(selectedSchedule?.date) : undefined}
                onDateSelect={handleDateSelect}
              />

              <TicketPrices
                ticketPrices={event.ticketPrices}
                ticketPricesSelected={ticketPricesSelected}
                handleToggleTicketPrice={handleToggleTicketPrice}
              />

              <h2 className="text-xl font-bold mb-8 text-center mt-4">Vé đã chọn</h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* hidden for inactive seat selection */}
                {/* <div className="bg-white p-6 rounded-lg shadow-md relative">
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
              </div> */}

                <div className="bg-white p-6 rounded-lg shadow-md relative">
                  {!ticketPricesSelected?.length ? (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      Vui lòng chọn vé
                    </div>
                  ) : (
                    watchTicketPricesSelected.map((field, index) => (
                      <div key={field.ticketPrice?.id} className="mb-6 last:mb-0">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{field.ticketPrice?.name}</h3>
                            <p className="text-gray-600">
                              {formatMoney(
                                field.ticketPrice?.price || 0,
                                field.ticketPrice?.currency || 'VND',
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24">
                              <Input
                                {...registerTicketPriceForm(`ticketPrices.${index}.quantity`, {
                                  required: 'Vui lòng nhập số vé',
                                  validate: {
                                    isNumber: (v) => !isNaN(Number(v)) || 'Vui lòng nhập số',
                                    isPositive: (v) => Number(v) > 0 || 'Số lượng phải lớn hơn 0',
                                    isInteger: (v) =>
                                      Number.isInteger(Number(v)) || 'Số lượng phải là số nguyên',
                                  },
                                })}
                                type="text"
                                className="w-full text-center"
                              />
                            </div>
                            <XCircle
                              className="h-5 w-5 cursor-pointer text-gray-500 hover:text-red-500"
                              onClick={() => removeTicketPriceSelected(index)}
                            />
                          </div>
                        </div>
                        {errorsTicketPriceForm.ticketPrices?.[index]?.quantity && (
                          <span className="text-xs text-red-500 text-right">
                            {errorsTicketPriceForm.ticketPrices[index]?.quantity?.message}
                          </span>
                        )}
                        <Separator className="my-4" />
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  {/* hidden for inactive seat selection */}
                  {/* {selectedSeats.length > 0 && (
                    <>
                      <h3 className="text-xl font-bold mb-4">Ghế đã chọn</h3>
                      <Separator className="my-4" />
                      {selectedSeats.map((seat) => (
                        <div key={seat.id} className="flex justify-between mb-2">
                          <span>Ghế {seat.label}</span>
                          <span>
                            {formatMoney(
                              seat.ticketPrice?.price || 0,
                              seat.ticketPrice?.currency || 'VND',
                            )}
                          </span>
                        </div>
                      ))}
                    </>
                  )} */}

                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-xl">
                    <span>Tổng</span>
                    <span>{formatMoney(calculateTotalTicketPrices())}</span>
                  </div>

                  {/* hidden for inactive seat selection */}
                  {/* <Button
                    onClick={handleBuyTickets}
                    disabled={isLoadingSeatHolding}
                    className="w-full cursor-pointer mt-6 bg-gradient-to-r text-white from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  >
                    {isLoadingSeatHolding && (
                      <Loader2 className={'my-28 h-16 w-16 text-primary/60 animate-spin'} />
                    )}
                    Giữ chỗ và Thanh toán
                  </Button> */}
                  <Button
                    disabled={isSubmittingTicketPriceForm}
                    className="w-full cursor-pointer mt-6 bg-gradient-to-r text-white from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  >
                    {isSubmittingTicketPriceForm && (
                      <Loader2 className={'my-28 h-16 w-16 text-primary/60 animate-spin'} />
                    )}
                    Giữ chỗ và Thanh toán
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-700 to-gray-950 bg-clip-text text-transparent">
                Sơ đồ sân khấu
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gray-950 to-gray-700 mx-auto mt-4 rounded-full" />
            </div>
            <div className="relative">
              {loadingScheduleMap && (
                <div className="absolute z-50 top-[30%] left-1/2 -translate-x-1/2 p-5 bg-gray-100/30 rounded-md flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <span>Đang tải...</span>
                </div>
              )}

              <Image src={'/images/seat-map.png'} alt="" className="" width={1449} height={1449} />
              {/* {!!selectedSchedule ? (
                <SeatMapToolkit
                  // onSelectSeat={handleSeatSelect}
                  unavailableSeats={unavailableSeats}
                />
              ) : (
                <div className="text-center py-8 bg-gray-100 rounded-lg">
                  <p className="text-lg text-gray-600">
                    Vui lòng chọn ngày tham dự để xem sơ đồ chọn ghế
                  </p>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default SeatReservationClient
