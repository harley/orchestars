'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslate } from '@/providers/I18n/client'
import { format } from 'date-fns'
import { Event } from '@/types/Event'
import { useToast } from '@/hooks/use-toast'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
import { Check } from 'lucide-react'

interface ChooseEventClientPageProps {
  publicEvents: Event[]
}

export default function ChooseEventClientPage({ publicEvents }: ChooseEventClientPageProps) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
  const router = useRouter()
  const { t } = useTranslate()
  const { toast } = useToast()

  useEffect(() => {
    const storedEventId = localStorage.getItem('selectedEventId')
    const storedScheduleId = localStorage.getItem('selectedScheduleId')

    if (storedEventId && storedScheduleId) {
      const foundEvent = publicEvents.find((event) => event.id === parseInt(storedEventId))
      const foundSchedule = foundEvent?.schedules?.find(
        (s: any) => s.id === parseInt(storedScheduleId),
      )

      if (foundEvent && foundSchedule) {
        setSelectedEvent(foundEvent)
        setSelectedSchedule(foundSchedule)
      }
    }
  }, [router, publicEvents])

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event)
    setSelectedSchedule(null)
  }

  const handleSelectSchedule = (schedule: any) => {
    setSelectedSchedule(schedule)
  }

  const handleConfirm = () => {
    if (!selectedEvent || !selectedSchedule) {
      toast({ title: t('checkin.pleaseSelectEventAndSchedule'), variant: 'destructive' })
      return
    }
    localStorage.setItem('selectedEventId', selectedEvent.id)
    localStorage.setItem('selectedScheduleId', selectedSchedule.id)
    localStorage.setItem('eventTitle', String(selectedEvent.title))
    if (selectedSchedule.date) {
      localStorage.setItem('eventScheduleDate', format(selectedSchedule.date, 'dd-MM-yyyy'))
    }

    const params = new URLSearchParams({
      eventId: selectedEvent.id,
      scheduleId: selectedSchedule.id,
      eventLocation: selectedEvent.eventLocation,
      eventTitle: selectedEvent.title,
      eventScheduleDate: selectedSchedule.date,
    })

    router.push(`/checkin/validates?${params.toString()}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="space-y-6">
          {publicEvents?.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
              <p className="text-sm text-gray-500 mb-2">
                {!!event.startDatetime && !!event.endDatetime && (
                  <>
                    <span className="font-semibold text-gray-600">
                      {tzFormat(
                        toZonedTime(new Date(event.startDatetime), 'Asia/Ho_Chi_Minh'),
                        'HH:mm',
                      )}{' '}
                      –&nbsp;
                      {event.endDatetime
                        ? tzFormat(
                            toZonedTime(new Date(event.endDatetime), 'Asia/Ho_Chi_Minh'),
                            'HH:mm',
                          )
                        : ''}
                    </span>
                    <br />
                    <span className="text-gray-600">
                      {tzFormat(
                        toZonedTime(new Date(event.startDatetime), 'Asia/Ho_Chi_Minh'),
                        'dd/MM/yyyy',
                      )}
                    </span>
                    <span className="text-gray-600">
                      {' '}
                      -{' '}
                      {tzFormat(
                        toZonedTime(new Date(event.endDatetime), 'Asia/Ho_Chi_Minh'),
                        'dd/MM/yyyy',
                      )}
                    </span>
                  </>
                )}
              </p>
              <button
                id={`select-event-${event.id}`}
                onClick={() => handleSelectEvent(event)}
                className={`w-full py-2 px-4 text-white rounded ${
                  selectedEvent?.id === event.id ? 'bg-orange-700' : 'bg-gray-900 hover:bg-black'
                }`}
              >
                {selectedEvent?.id === event.id ? t('checkin.selected') : t('checkin.selectEvent')}
              </button>

              {selectedEvent?.id === event.id && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {!!event.schedules?.length ? (
                    event.schedules.map((schedule: any) => (
                      <button
                        id={`select-schedule-${schedule.id}`}
                        key={schedule.id}
                        onClick={() => handleSelectSchedule(schedule)}
                        className={`px-3 py-2 rounded text-white text-sm ${
                          selectedSchedule?.id === schedule.id
                            ? 'bg-orange-700'
                            : 'bg-gray-900 hover:bg-black'
                        }`}
                      >
                        {selectedSchedule?.id === schedule.id && (
                          <Check className="inline-block w-4 h-4 mr-2" aria-label="Selected" />
                        )}
                        {schedule.date
                          ? tzFormat(
                              toZonedTime(new Date(schedule.date), 'Asia/Ho_Chi_Minh'),
                              'dd/MM/yyyy',
                            )
                          : 'Ngày diễn ra: TBA'}
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

        {selectedEvent && selectedSchedule && (
          <button
            onClick={handleConfirm}
            className="mt-6 w-full py-3 bg-gray-900 hover:bg-black text-white text-lg font-semibold rounded"
          >
            {t('checkin.confirm')}
          </button>
        )}
      </div>
    </div>
  )
}
