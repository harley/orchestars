import { isValid } from 'date-fns'

/**
 * Format a date string into relative time (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @param locale - Locale for formatting (defaults to 'en')
 * @returns Formatted relative time string
 */
export const getRelativeTime = (dateString: string, locale: string = 'en'): string => {
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    const date = new Date(dateString)

    if (!isValid(date)) {
      return ''
    }

    const diff = Date.now() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (Math.abs(days) >= 1) return rtf.format(-days, 'day')
    if (Math.abs(hours) >= 1) return rtf.format(-hours, 'hour')
    if (Math.abs(minutes) >= 1) return rtf.format(-minutes, 'minute')
    return rtf.format(-seconds, 'second')
  } catch (error) {
    console.error('Failed to format relative time:', error)
    return ''
  }
}
