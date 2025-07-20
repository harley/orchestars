import React, { useEffect, useState, useCallback } from 'react'
import { User, Users, RotateCcw } from 'lucide-react'
import { useTranslate } from '@/providers/I18n/client'

interface Props {
  eventId: string | null
  scheduleId: string | null
  className?: string
}

interface Stats {
  totalCheckins: number
  adminCheckins: number
  loading: boolean
}

const ScheduleStatsInfo: React.FC<Props> = ({ eventId, scheduleId, className = 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600' }) => {
  const { t } = useTranslate()
  const [stats, setStats] = useState<Stats>({ totalCheckins: 0, adminCheckins: 0, loading: true })

  // Basic event/schedule meta from localStorage for display
  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setEventTitle(localStorage.getItem('eventTitle') || '')
    setEventDate(localStorage.getItem('eventScheduleDate') || '')
    setEventTime(localStorage.getItem('eventScheduleTime') || '')
  }, [])

  const fetchStats = useCallback(async () => {
    if (!eventId || !scheduleId) return

    setStats((prev) => ({ ...prev, loading: true }))
    try {
      const res = await fetch(`/api/checkin-app/event-stats?eventId=${eventId}&scheduleId=${scheduleId}`)
      if (res.ok) {
        const data = await res.json()
        setStats({
          totalCheckins: data.stats.totalCheckins,
          adminCheckins: data.stats.adminCheckins,
          loading: false,
        })
      } else {
        setStats((prev) => ({ ...prev, loading: false }))
      }
    } catch (_) {
      console.error('Failed to fetch event stats:', _)
      setStats((prev) => ({ ...prev, loading: false }))
    }
  }, [eventId, scheduleId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (!eventId || !scheduleId) return null

  return (
    <div className={`${className} relative`}>
      {/* Refresh button in top right */}
      <button
        onClick={fetchStats}
        disabled={stats.loading}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Refresh stats"
        aria-label="Refresh check-in statistics"
      >
        <RotateCcw className={`w-4 h-4 ${stats.loading ? 'animate-spin' : ''}`} />
      </button>

      {/* Title and basic meta */}
      {eventTitle && (
        <>
          <h2 className="text-base font-semibold text-blue-600 mb-1 pr-8">{eventTitle}</h2>
          <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300 mb-3">
            {eventDate && (
              <span className="px-2 py-0.5 min-w-[80px] text-center rounded-full whitespace-nowrap bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold" aria-label={`Event date ${eventDate}`}>
                {eventDate}
              </span>
            )}
            {eventTime && (
              <span className="px-2 py-0.5 min-w-[80px] text-center rounded-full whitespace-nowrap bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100" aria-label={`Event time ${eventTime}`}>
                {eventTime}
              </span>
            )}
          </div>
        </>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center text-blue-600 dark:text-blue-400">
          <User className="w-4 h-4 mr-1" />
          <span className="font-medium truncate">{t('checkin.event.checkedInByMe')}</span>
          {stats.loading ? (
            <span className="ml-1 font-bold text-gray-400 animate-pulse">...</span>
          ) : (
            <span className="ml-1 font-bold" aria-live="polite">{stats.adminCheckins}</span>
          )}
        </div>
        <div className="flex items-center text-green-600 dark:text-green-400">
          <Users className="w-4 h-4 mr-1" />
          <span className="font-medium truncate">{t('checkin.event.totalCheckedIn')}</span>
          {stats.loading ? (
            <span className="ml-1 font-bold text-gray-400 animate-pulse">...</span>
          ) : (
            <span className="ml-1 font-bold" aria-live="polite">{stats.totalCheckins}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScheduleStatsInfo