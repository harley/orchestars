'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useTranslate } from '@/providers/I18n/client'
import { format } from 'date-fns'
import { Event } from '@/types/Event'
import { useToast } from '@/hooks/use-toast'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
import { Check, Users, User, RefreshCw, Calendar } from 'lucide-react'
import { CheckinNav } from '@/components/CheckinNav'
import { getTodayInVietnam, getAutoSelectionFailureMessage } from '@/lib/checkin/autoEventSelection'
import { markAsManualSelection } from '@/lib/checkin/eventSelectionCache'

interface ChooseEventClientPageProps {
  publicEvents: Event[]
}

interface EventStats {
  scheduleId: string
  totalCheckins: number
  adminCheckins: number
  loading: boolean
}

type Schedule = {
  id: string
  date: string
  scheduleImage: string
  details: Array<{
    id: string
    time: string
    name: string
    description: string
  }>
}

export default function ChooseEventClientPage({ publicEvents }: ChooseEventClientPageProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [eventStats, setEventStats] = useState<Record<string, EventStats>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const { t } = useTranslate()
  const { toast } = useToast()

  const searchParams = useSearchParams()

  // Helper function to check if an event has today's schedule
  const hasScheduleToday = (event: Event): boolean => {
    const today = getTodayInVietnam()
    return event.schedules?.some(schedule => {
      if (!schedule.date) return false
      try {
        const scheduleDate = format(new Date(schedule.date), 'yyyy-MM-dd')
        return scheduleDate === today
      } catch {
        return false
      }
    }) || false
  }



  // Get auto-selection failure reason from URL
  const autoSelectionReason = searchParams.get('reason')

  useEffect(() => {
    const storedEventId = localStorage.getItem('selectedEventId')
    const storedScheduleId = localStorage.getItem('selectedScheduleId')

    if (storedEventId && storedScheduleId) {
      const foundEvent = publicEvents.find((event) => event.id === parseInt(storedEventId))
      const foundSchedule = foundEvent?.schedules?.find(
        (s) => String(s.id) === storedScheduleId,
      )

      if (foundEvent && foundSchedule) {
        setSelectedEvent(foundEvent)
        setSelectedSchedule(foundSchedule)
        // Fetch stats for this event
        fetchEventStats(foundEvent)
      }
    }
  }, [router, publicEvents])

  // Auto-refresh stats when page comes into focus (user returns from checkin)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedEvent) {
        fetchEventStats(selectedEvent)
      }
    }

    const handleFocus = () => {
      if (selectedEvent) {
        fetchEventStats(selectedEvent)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [selectedEvent])

  const fetchEventStats = async (event: Event, showRefreshing = false) => {
    if (!event?.schedules?.length) return

    if (showRefreshing) {
      setIsRefreshing(true)
    }

    // Initialize loading states for all schedules
    const initialStats: Record<string, EventStats> = {}
    event.schedules.forEach((schedule) => {
      initialStats[schedule.id] = {
        scheduleId: schedule.id,
        totalCheckins: 0,
        adminCheckins: 0,
        loading: true,
      }
    })
    setEventStats(initialStats)

    // Fetch stats for all schedules concurrently
    const fetchPromises = event.schedules.map(async (schedule): Promise<{
      scheduleId: string;
      success: true;
      data: EventStats;
    } | {
      scheduleId: string;
      success: false;
      error: string;
    }> => {
      try {
        const res = await fetch(`/api/checkin-app/event-stats?eventId=${event.id}&scheduleId=${schedule.id}`)
        if (res.ok) {
          const data = await res.json()
          return {
            scheduleId: schedule.id,
            success: true,
            data: {
              scheduleId: schedule.id,
              totalCheckins: data.stats.totalCheckins as number,
              adminCheckins: data.stats.adminCheckins as number,
              loading: false,
            }
          }
        } else {
          return {
            scheduleId: schedule.id,
            success: false,
            error: `HTTP ${res.status}`
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats for schedule:', schedule.id, error)
        return {
          scheduleId: schedule.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    // Wait for all requests to complete
    const results = await Promise.all(fetchPromises)

    // Update state based on results
    setEventStats(prev => {
      const updatedStats = { ...prev }
      results.forEach(result => {
        if (result.success) {
          updatedStats[result.scheduleId] = result.data
        } else {
          // Handle error - set loading to false but keep zeros
          const existingStats = prev[result.scheduleId]
          updatedStats[result.scheduleId] = {
            scheduleId: existingStats?.scheduleId || result.scheduleId,
            totalCheckins: existingStats?.totalCheckins || 0,
            adminCheckins: existingStats?.adminCheckins || 0,
            loading: false,
          }
        }
      })
      return updatedStats
    })

    if (showRefreshing) {
      setIsRefreshing(false)
    }
  }

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event)
    setSelectedSchedule(null)
    setEventStats({}) // Clear previous stats

    // Fetch stats for the newly selected event
    fetchEventStats(event)
  }

  const handleSelectSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
  }

  const handleRefreshStats = () => {
    if (selectedEvent) {
      fetchEventStats(selectedEvent, true)
    }
  }

  const handleConfirm = () => {
    if (!selectedEvent || !selectedSchedule) {
      toast({ title: t('checkin.pleaseSelectEventAndSchedule'), variant: 'destructive' })
      return
    }
    localStorage.setItem('selectedEventId', selectedEvent.id.toString())
    localStorage.setItem('selectedScheduleId', selectedSchedule.id.toString())
    localStorage.setItem('eventTitle', String(selectedEvent.title))
    localStorage.setItem('eventLocation', String(selectedEvent.eventLocation))
    if (selectedSchedule.date) {
      localStorage.setItem('eventScheduleDate', format(selectedSchedule.date, 'dd-MM-yyyy'))
    }

    // Store schedule time details
    if (selectedSchedule.details && selectedSchedule.details.length > 0) {
              const timeDetails = selectedSchedule.details.map((detail) => detail.time).filter(Boolean)
      if (timeDetails.length > 0) {
        localStorage.setItem('eventScheduleTime', timeDetails.join(' - '))
      }
    }

    // Mark this selection as manual (not auto-selected)
    markAsManualSelection()

    const params = new URLSearchParams({
      eventId: selectedEvent.id.toString(),
      scheduleId: selectedSchedule.id.toString(),
    })

    // Route based on mode parameter
    const mode = searchParams.get('mode')
    if (mode === 'paper') {
      router.push(`/checkin/paper?${params.toString()}`)
    } else if (mode === 'search') {
      router.push(`/checkin/validates?${params.toString()}`)
    } else if (mode === 'scan') {
      router.push(`/checkin/scan?${params.toString()}`)
    } else {
      // Default to search mode for backward compatibility
      router.push(`/checkin/validates?${params.toString()}`)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md mx-auto">
        <CheckinNav />

        {/* Auto-selection failure message */}
        {autoSelectionReason && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Auto-selection not available
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {getAutoSelectionFailureMessage(autoSelectionReason)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button - only show when event is selected and has stats */}
        {selectedEvent && Object.keys(eventStats).length > 0 && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleRefreshStats}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('checkin.refreshStats')}
            </button>
          </div>
        )}

        <div className="space-y-6">
          {publicEvents?.map((event) => {
            const eventHasToday = hasScheduleToday(event)
            return (
              <div key={event.id} className={`rounded-lg shadow p-4 ${
                eventHasToday
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
                  : 'bg-white'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
                  {eventHasToday && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Today
                    </span>
                  )}
                </div>
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
                <div className="mt-4 space-y-3">
                  {event.schedules?.length ? (
                    event.schedules.map((schedule) => {
                      const stats = eventStats[schedule.id]
                      return (
                        <div
                          key={schedule.id}
                          onClick={() => handleSelectSchedule(schedule)}
                          className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                            selectedSchedule?.id === schedule.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {schedule.date
                                  ? tzFormat(
                                      toZonedTime(new Date(schedule.date), 'Asia/Ho_Chi_Minh'),
                                      'dd/MM/yyyy',
                                    )
                                  : t('checkin.event.dateTBA')}
                              </h3>
                              {selectedSchedule?.id === schedule.id && (
                                <Check className="ml-2 w-5 h-5 text-orange-600" />
                              )}
                            </div>
                          </div>

                          {stats ? (
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center text-blue-600">
                                <User className="w-4 h-4 mr-1" />
                                <span className="font-medium">{t('checkin.event.checkedInByMe')}</span>
                                <span className="ml-1 font-bold">
                                  {stats.loading ? '...' : stats.adminCheckins}
                                </span>
                              </div>
                              <div className="flex items-center text-green-600">
                                <Users className="w-4 h-4 mr-1" />
                                <span className="font-medium">{t('checkin.event.totalCheckedIn')}</span>
                                <span className="ml-1 font-bold">
                                  {stats.loading ? '...' : stats.totalCheckins}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {t('checkin.event.loadingStats')}
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-gray-600">{t('checkin.noSchedulesAvailable')}</p>
                  )}
                </div>
              )}
            </div>
          )})}
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
