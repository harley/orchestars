import React, { useEffect, useState } from 'react'

interface EventInfoProps {
  title?: string
  date?: string
  time?: string
  location?: string
  /**
   * Additional class names for the outer wrapper so callers can override spacing
   */
  className?: string
}

/**
 * Reusable block that displays the currently-selected event information
 * (title, date, time, location). If a prop is omitted it falls back to the
 * corresponding value from localStorage – this lets pages use the component
 * without manually wiring the values while still allowing explicit overrides
 * when needed.
 */
const EventInfo: React.FC<EventInfoProps> = ({
  title,
  date,
  time,
  location,
  className = 'bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4',
}) => {
  const [eventTitle, setEventTitle] = useState(title || '')
  const [eventDate, setEventDate] = useState(date || '')
  const [eventTime, setEventTime] = useState(time || '')
  const [eventLocation, setEventLocation] = useState(location || '')

  // On mount, pull missing values from localStorage (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!title) {
      const stored = localStorage.getItem('eventTitle')
      if (stored) setEventTitle(stored)
    }
    if (!date) {
      const stored = localStorage.getItem('eventScheduleDate')
      if (stored) setEventDate(stored)
    }
    if (!time) {
      const stored = localStorage.getItem('eventScheduleTime')
      if (stored) setEventTime(stored)
    }
    if (!location) {
      const stored = localStorage.getItem('eventLocation')
      if (stored) setEventLocation(stored)
    }
  }, [title, date, time, location])

  // Do not render if we still have no title (acts as simple guard)
  if (!eventTitle) return null

  return (
    <div className={className}>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
        {eventTitle}
      </h2>
      <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
        {eventDate && <div>Date: {eventDate}</div>}
        {eventTime && <div>Time: {eventTime}</div>}
        {eventLocation && <div>Location: {eventLocation}</div>}
      </div>
    </div>
  )
}

export default EventInfo 