'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

import { isSameDay } from 'date-fns'
import { TicketPrice } from '../../types'
import { Event } from '@/payload-types'
import { useRouter } from 'next/navigation'
import { useTranslate } from '@/providers/I18n/client'
import { format as dateFnsFormat } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
// import SelectAndPurchaseTicketModal from './SelectAndPurchaseTicketModal'

export interface TicketPriceSelectedFormValues {
  ticketPrices: Array<{
    ticketPrice: TicketPrice
    quantity: number
  }>
}

const SeatMapSelection = ({
  event,
  // unavailableSeats,
}: {
  event: Event
  unavailableSeats?: string[]
}) => {
  const router = useRouter()
  // const searchParams = useSearchParams()
  const { t } = useTranslate()

  const [selectedEventScheduleId, setSelectedEventScheduleId] = useState('')

  // const eventScheduleId = searchParams.get('eventScheduleId')

  const _selectedSchedule = useMemo(() => {
    const schedule = event.schedules?.find((sche) => sche.id === selectedEventScheduleId)

    return schedule
  }, [selectedEventScheduleId, event.schedules])

  const _handleDateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const date = new Date(e.target.value)

    const schedule = date
      ? event.schedules?.find((sche) => isSameDay(sche.date as string, date))
      : null
    const eventScheduleId = schedule?.id || ''

    setSelectedEventScheduleId(eventScheduleId)
    // const newPathname = `${pathname}?eventScheduleId=${eventScheduleId}`

    // router.replace(newPathname, { scroll: false })
  }

  // const [isOpen, setIsOpen] = useState(false)

  return (
    <section id="seat-map-date-select" className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold mb-4 uppercase">{t('event.ticket')}</h2>
        <p className="text-lg mb-8">{t('event.selectDateToAttend')}</p>

        <div className="bg-gray-900 rounded-2xl p-6">
          <h3 className="text-2xl font-bold text-white mb-4">{t('event.ticketInfo')}</h3>
          <div className="space-y-4">
            {event.schedules && event.schedules.length > 0 ? (
              event.schedules.map((schedule) => {
                const details = schedule.details || []
                const startTime = details[0]?.time || ''
                const endTime = details[details.length - 1]?.time || ''
                // TODO: Replace with real sold out logic if available
                const isSoldOut = false
                const date = schedule.date ? new Date(schedule.date) : null
                // Determine locale and format
                let formattedDate = ''
                if (date) {
                  if (t('lang') === 'vi') {
                    // 'Thứ 7, 19 tháng 7, 2025'
                    formattedDate = dateFnsFormat(date, "'Thứ' i, d 'tháng' M, yyyy", { locale: vi })
                  } else {
                    // 'Sat, July 19, 2025'
                    formattedDate = dateFnsFormat(date, 'EEE, MMMM d, yyyy', { locale: enUS })
                  }
                }
                return (
                  <div
                    key={schedule.id ?? schedule.date}
                    className="flex flex-col md:flex-row items-center justify-between bg-gray-800 rounded-xl px-6 py-5"
                  >
                    <div className="flex-1 flex flex-col items-start justify-center">
                      <span className="text-lg md:text-xl font-bold text-white">
                        {startTime} - {endTime}
                      </span>
                      <span className="text-base md:text-lg text-white mt-1">
                        {formattedDate}
                      </span>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center justify-end md:justify-center md:items-center w-full md:w-auto">
                      <Button
                        onClick={() => {
                          if (!isSoldOut) {
                            router.push(`/events/${event.slug}/${schedule.id}/select-ticket`)
                          }
                        }}
                        className={`rounded-lg px-8 py-4 text-lg font-bold ${isSoldOut ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                        disabled={isSoldOut}
                      >
                        {isSoldOut ? t('event.soldOut') : t('event.selectTicket')}
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-white">{t('event.noDateAvailable')}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SeatMapSelection
