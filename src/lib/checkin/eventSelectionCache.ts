import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { getTodayInVietnam } from './autoEventSelection'

export interface CachedEventSelection {
  eventId: string
  scheduleId: string
  isAutoSelected: boolean
  eventTitle?: string
  eventLocation?: string
  scheduleDate?: string
  scheduleTime?: string
}

/**
 * Get the timestamp for end of day in Vietnam timezone
 */
export const getEndOfDayTimestamp = (): number => {
  const now = new Date()
  const vietnamTime = toZonedTime(now, 'Asia/Ho_Chi_Minh')
  const endOfDay = new Date(vietnamTime)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay.getTime()
}

/**
 * Check if the cached selection is still valid (same day and not expired)
 */
export const isCacheValid = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const today = getTodayInVietnam()
  const cachedDate = localStorage.getItem('autoSelectionDate')
  const cachedEventId = localStorage.getItem('selectedEventId')
  const cachedScheduleId = localStorage.getItem('selectedScheduleId')
  
  // Check if we have the required cached data and it's for today
  return !!(
    cachedDate === today &&
    cachedEventId &&
    cachedScheduleId
  )
}

/**
 * Get cached event selection if valid
 */
export const getCachedEventSelection = (): CachedEventSelection | null => {
  if (typeof window === 'undefined') return null
  
  if (!isCacheValid()) {
    return null
  }
  
  const eventId = localStorage.getItem('selectedEventId')
  const scheduleId = localStorage.getItem('selectedScheduleId')
  const isAutoSelected = localStorage.getItem('isAutoSelected') === 'true'
  const eventTitle = localStorage.getItem('eventTitle')
  const eventLocation = localStorage.getItem('eventLocation')
  const scheduleDate = localStorage.getItem('eventScheduleDate')
  const scheduleTime = localStorage.getItem('eventScheduleTime')
  
  if (!eventId || !scheduleId) {
    return null
  }
  
  return {
    eventId,
    scheduleId,
    isAutoSelected,
    eventTitle: eventTitle || undefined,
    eventLocation: eventLocation || undefined,
    scheduleDate: scheduleDate || undefined,
    scheduleTime: scheduleTime || undefined
  }
}

/**
 * Cache event selection with end-of-day expiration
 */
export const setCachedEventSelection = (
  eventId: string,
  scheduleId: string,
  isAutoSelected: boolean,
  eventData?: {
    title?: string
    location?: string
    scheduleDate?: string
    scheduleTime?: string
  }
): void => {
  if (typeof window === 'undefined') return
  
  const today = getTodayInVietnam()
  
  // Store core selection data
  localStorage.setItem('selectedEventId', eventId)
  localStorage.setItem('selectedScheduleId', scheduleId)
  localStorage.setItem('isAutoSelected', isAutoSelected.toString())
  localStorage.setItem('autoSelectionDate', today)
  
  // Store additional event data if provided
  if (eventData?.title) {
    localStorage.setItem('eventTitle', eventData.title)
  }
  if (eventData?.location) {
    localStorage.setItem('eventLocation', eventData.location)
  }
  if (eventData?.scheduleDate) {
    localStorage.setItem('eventScheduleDate', eventData.scheduleDate)
  }
  if (eventData?.scheduleTime) {
    localStorage.setItem('eventScheduleTime', eventData.scheduleTime)
  }
}

/**
 * Clear expired cache entries from previous days
 */
export const clearExpiredCache = (): void => {
  if (typeof window === 'undefined') return
  
  const today = getTodayInVietnam()
  const cachedDate = localStorage.getItem('autoSelectionDate')
  
  // If cached date is not today, clear all selection-related cache
  if (cachedDate && cachedDate !== today) {
    const keysToRemove = [
      'selectedEventId',
      'selectedScheduleId',
      'isAutoSelected',
      'autoSelectionDate',
      'eventTitle',
      'eventLocation',
      'eventScheduleDate',
      'eventScheduleTime'
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
  }
}

/**
 * Mark current selection as manually overridden (not auto-selected)
 */
export const markAsManualSelection = (): void => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('isAutoSelected', 'false')
}

/**
 * Check if current selection was auto-selected
 */
export const isCurrentSelectionAutoSelected = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return localStorage.getItem('isAutoSelected') === 'true'
}

/**
 * Clear all cached event selection data
 */
export const clearEventSelectionCache = (): void => {
  if (typeof window === 'undefined') return
  
  const keysToRemove = [
    'selectedEventId',
    'selectedScheduleId',
    'isAutoSelected',
    'autoSelectionDate',
    'eventTitle',
    'eventLocation',
    'eventScheduleDate',
    'eventScheduleTime'
  ]
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })
}