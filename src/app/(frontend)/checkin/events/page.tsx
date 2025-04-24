'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/CheckIn/useAuth'
import { useTranslate } from '@/providers/I18n/client'
import { format } from 'date-fns'

export default function ChooseEventPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
  const router = useRouter()
  const { isHydrated, token, setToken } = useAuth()
  const { t } = useTranslate()

  const fetchEvents = useCallback(async () => {
    if (!token) {
      alert(t('error.pleaseLoginFirst'))
      router.push('/checkin')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`/api/checkin-app/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
      })
      if (response.status === 401) {
        setToken('')
      }

      const json = await response.json()
      setEvents(json.events?.docs || [])
    } catch (error: any) {
      alert(error.message || t('error.failedToLoadEvents'))
    } finally {
      setLoading(false)
    }
  }, [token, router, t])

  useEffect(() => {
    if (!isHydrated) return
    if (!token) {
      router.replace('/checkin')
      return
    }

    fetchEvents()
  }, [isHydrated, token, router, fetchEvents])

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event)
    setSelectedSchedule(null)
  }

  const handleSelectSchedule = (schedule: any) => {
    setSelectedSchedule(schedule)
  }

  const handleConfirm = () => {
    if (!selectedEvent || !selectedSchedule) {
      alert(t('checkin.pleaseSelectEventAndSchedule'))
      return
    }

    router.push(
      `/checkin/validates?eventId=${selectedEvent.id}&scheduleId=${selectedSchedule.id}&eventLocation=${selectedEvent.eventLocation}&eventTitle=${selectedEvent.title}&eventScheduleDate=${selectedSchedule.date}`,
    )
  }

  const formatDate = (iso: string) => format(new Date(iso), 'MMMM d, yyyy, h:mm a')
  const formatDateRange = (start: string, end: string) =>
    `${formatDate(start)} - ${formatDate(end)}`

  const formatDateAndTime = (isoDate: string, timeHHmm: string): string => {
    try {
      // Parse the ISO date
      const date = new Date(isoDate)
      const trimmedTimeHHmm = timeHHmm.trim()

      // Validate the date
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format')
      }

      // Validate and parse time string
      if (!trimmedTimeHHmm || !/^\d{1,2}:\d{2}$/.test(trimmedTimeHHmm)) {
        throw new Error('Time must be in format HH:MM')
      }

      // Parse time components safely
      const parts = trimmedTimeHHmm.split(':')
      const hours = Number(parts[0])
      const minutes = Number(parts[1])

      if (isNaN(hours) || hours < 0 || hours > 23) {
        throw new Error('Hours must be between 0-23')
      }

      if (isNaN(minutes) || minutes < 0 || minutes > 59) {
        throw new Error('Minutes must be between 0-59')
      }

      // Set the time components
      date.setHours(hours, minutes, 0, 0)

      // Format as "May 20, 2023, 7:30 PM"
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }

      return new Intl.DateTimeFormat('en-US', options).format(date)
    } catch (error) {
      console.error('Error formatting date and time:', error)
      return 'Invalid date or time'
    }
  }

  return (
    <div className="min-h-screen py-12 p-6 bg-gray-100">
      <div className="space-y-6">
        {loading && <p className="text-center text-gray-500">{t('checkin.loadingEvents')}</p>}
        {events?.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
            <p className="text-sm text-gray-500 mb-2">
              {formatDateRange(event.startDatetime, event.endDatetime)}
            </p>
            <button
              onClick={() => handleSelectEvent(event)}
              className={`w-full py-2 px-4 text-white rounded ${
                selectedEvent?.id === event.id ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black'
              }`}
            >
              {selectedEvent?.id === event.id ? t('checkin.selected') : t('checkin.selectEvent')}
            </button>

            {selectedEvent?.id === event.id && (
              <div className="mt-4 flex flex-wrap gap-2">
                {event.schedules && event.schedules.length > 0 ? (
                  event.schedules.map((schedule: any) => (
                    <button
                      key={schedule.id}
                      onClick={() => handleSelectSchedule(schedule)}
                      className={`px-3 py-2 rounded text-white text-sm ${
                        selectedSchedule?.id === schedule.id
                          ? 'bg-green-600'
                          : 'bg-gray-900 hover:bg-black'
                      }`}
                    >
                      {formatDateAndTime(schedule.date, schedule.details[0]?.time)}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">{t('checkin.noSchedulesAvailable')}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedSchedule && (
        <button
          onClick={handleConfirm}
          className="mt-6 w-full py-3 bg-gray-900 hover:bg-black text-white text-lg font-semibold rounded"
        >
          {t('checkin.confirm')}
        </button>
      )}
    </div>
  )
}
