'use client'

import React, { useState } from 'react'
import { Event } from '@/payload-types'
import { useTranslate } from '@/providers/I18n/client'
import { format as dateFnsFormat } from 'date-fns'

interface TicketSelectionProps {
  event: Event
  onSelectDate?: (date: string) => void
  onSelectTicket?: () => void
}

const TicketSelection: React.FC<TicketSelectionProps> = ({
  event,
  onSelectDate,
  onSelectTicket,
}) => {
  const { t } = useTranslate()
  const [selectedDate, setSelectedDate] = useState<string>('')

  // Get available dates from event schedules or use start/end dates
  const getEventDates = () => {
    if (event.schedules && event.schedules.length > 0) {
      // If we have explicit schedules, use those dates
      return event.schedules.map((schedule) => schedule.date).filter(Boolean) as string[]
    } else if (event.startDatetime) {
      // Otherwise use the event's start date
      return [event.startDatetime]
    }
    return []
  }

  const eventDates = getEventDates()

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const date = e.target.value
    setSelectedDate(date)
    onSelectDate?.(date)
  }

  const handleSelectTicket = () => {
    onSelectTicket?.()
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-4 uppercase">{t('event.ticket')}</h2>
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
                {eventDates.length > 0 ? (
                  <select
                    className="appearance-none w-full border border-gray-300 rounded-md py-2 pl-4 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    onChange={handleDateChange}
                    value={selectedDate || eventDates[0]}
                  >
                    {eventDates.map((date, index) => (
                      <option key={index} value={date}>
                        {dateFnsFormat(new Date(date), 'dd/MM/yyyy')}
                      </option>
                    ))}
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
              <button
                className="bg-black text-white rounded-md py-2 px-6 hover:bg-gray-800 transition-colors"
                onClick={handleSelectTicket}
                disabled={!selectedDate && eventDates.length > 0}
              >
                {t('event.selectTicket')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TicketSelection
