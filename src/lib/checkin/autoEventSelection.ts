import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

// Types for event and schedule data
export interface EventSchedule {
  id: string
  date: string
  scheduleImage?: string
  details: Array<{
    id: string
    time: string
    name: string
    description: string
  }>
}

export interface EventWithSchedules {
  id: string
  title: string
  schedules?: EventSchedule[]
  startDatetime?: string
  endDatetime?: string
  status?: string
  eventLocation?: string
}

export interface AutoSelectionResult {
  success: boolean
  eventId?: string
  scheduleId?: string
  event?: EventWithSchedules
  schedule?: EventSchedule
  reason?: 'no_events_today' | 'multiple_events_today' | 'no_schedule_today' | 'fetch_error'
}

/**
 * Get today's date in Vietnam timezone as YYYY-MM-DD string
 */
export const getTodayInVietnam = (): string => {
  const now = new Date()
  const vietnamTime = toZonedTime(now, 'Asia/Ho_Chi_Minh')
  return format(vietnamTime, 'yyyy-MM-dd')
}

/**
 * Filter events that have schedules matching today's date
 */
export const findTodaysEvents = (events: EventWithSchedules[]): EventWithSchedules[] => {
  const today = getTodayInVietnam()
  
  // Defensive check to ensure events is an array
  if (!Array.isArray(events)) {
    console.warn('findTodaysEvents: events parameter is not an array:', events)
    return []
  }
  
  return events.filter(event => {
    // Only consider events that are open for sales or upcoming
    if (event.status && !['published_open_sales', 'published_upcoming'].includes(event.status)) {
      return false
    }
    
    // Check if any schedule matches today
    // Note: schedules is an array field in the event document
    return event.schedules?.some(schedule => {
      if (!schedule.date) return false
      
      try {
        const scheduleDate = format(new Date(schedule.date), 'yyyy-MM-dd')
        return scheduleDate === today
      } catch (error) {
        console.warn('Invalid schedule date format:', schedule.date, error)
        return false
      }
    })
  })
}

/**
 * Attempt to auto-select an event for today
 * Returns success only if exactly one event has a schedule for today
 */
export const attemptAutoSelection = async (events: EventWithSchedules[]): Promise<AutoSelectionResult> => {
  try {
    const todaysEvents = findTodaysEvents(events)
    
    if (todaysEvents.length === 0) {
      return { success: false, reason: 'no_events_today' }
    }
    
    if (todaysEvents.length > 1) {
      return { success: false, reason: 'multiple_events_today' }
    }
    
    // Exactly one event found - auto-select it
    const event = todaysEvents[0]
    if (!event) {
      return { success: false, reason: 'no_events_today' }
    }
    
    const today = getTodayInVietnam()
    
    // Find today's schedule within the event
    const todaysSchedule = event.schedules?.find(schedule => {
      if (!schedule.date) return false
      
      try {
        const scheduleDate = format(new Date(schedule.date), 'yyyy-MM-dd')
        return scheduleDate === today
      } catch (error) {
        console.warn('Invalid schedule date format:', schedule.date, error)
        return false
      }
    })
    
    if (!todaysSchedule) {
      return { success: false, reason: 'no_schedule_today' }
    }
    
    return {
      success: true,
      eventId: event.id,
      scheduleId: todaysSchedule.id,
      event,
      schedule: todaysSchedule
    }
  } catch (error) {
    console.error('Auto-selection failed:', error)
    return { success: false, reason: 'fetch_error' }
  }
}

/**
 * Get a human-readable reason for auto-selection failure
 */
export const getAutoSelectionFailureMessage = (reason: string): string => {
  switch (reason) {
    case 'no_events_today':
      return 'No events scheduled for today'
    case 'multiple_events_today':
      return 'Multiple events available today - please select one'
    case 'no_schedule_today':
      return 'Event found but no schedule for today'
    case 'fetch_error':
      return 'Unable to load event data'
    default:
      return 'Auto-selection not available'
  }
}