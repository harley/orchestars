/**
 * Utility functions to generate calendar links for events
 * Supports Google Calendar, Outlook, and iCal formats
 */

/**
 * Format a date for calendar links
 * @param date Date object or ISO string
 * @returns Formatted date string
 */
export const formatCalendarDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  // Format: YYYYMMDDTHHMMSSZ
  return dateObj.toISOString().replace(/-|:|\.\d+/g, '')
}

/**
 * Encode a string for use in a URL
 * @param text Text to encode
 * @returns Encoded text
 */
export const encodeText = (text: string): string => {
  return encodeURIComponent(text).replace(/%20/g, '+')
}

/**
 * Generate a Google Calendar link
 * @param params Event parameters
 * @returns Google Calendar URL
 */
export const getGoogleCalendarLink = ({
  title,
  description,
  location,
  startTime,
  endTime,
  timezone,
}: {
  title: string
  description: string
  location: string
  startTime: string | Date
  endTime: string | Date
  timezone: string
}): string => {
  const startDate = formatCalendarDate(startTime)
  const endDate = formatCalendarDate(endTime)

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeText(title)}&dates=${startDate}/${endDate}&details=${encodeText(description)}&location=${encodeText(location)}&sprop=&sprop=name:&ctz=${timezone}`
}

/**
 * Generate an Outlook Calendar link
 * @param params Event parameters
 * @returns Outlook Calendar URL
 */
export const getOutlookCalendarLink = ({
  title,
  description,
  location,
  startTime,
  endTime,
}: {
  title: string
  description: string
  location: string
  startTime: string | Date
  endTime: string | Date
}): string => {
  const startDate = formatCalendarDate(startTime)
  const endDate = formatCalendarDate(endTime)

  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeText(title)}&body=${encodeText(description)}&location=${encodeText(location)}&startdt=${startDate}&enddt=${endDate}`
}

/**
 * Generate an iCal file content
 * @param params Event parameters
 * @returns iCal file content as string
 */
export const getICalContent = ({
  title,
  description,
  location,
  startTime,
  endTime,
}: {
  title: string
  description: string
  location: string
  startTime: string | Date
  endTime: string | Date
}): string => {
  const startDate = formatCalendarDate(startTime)
  const endDate = formatCalendarDate(endTime)
  const now = formatCalendarDate(new Date())

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OrcheStars//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${startDate}
DTEND:${endDate}
DTSTAMP:${now}
LOCATION:${location}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`
}

/**
 * Generate a data URI for an iCal file
 * @param params Event parameters
 * @returns Data URI for iCal file
 */
export const getICalDataUri = (params: {
  title: string
  description: string
  location: string
  startTime: string | Date
  endTime: string | Date
}): string => {
  const iCalContent = getICalContent(params)
  return `data:text/calendar;charset=utf8,${encodeText(iCalContent)}`
}

/**
 * Generate all calendar links for an event
 * @param params Event parameters
 * @returns Object with all calendar links
 */
export const getAllCalendarLinks = (params: {
  title: string
  description: string
  location: string
  startTime: string | Date
  endTime: string | Date
  timezone: string
}): {
  google: string
  // outlook: string
  // ical: string
} => {
  return {
    google: getGoogleCalendarLink(params),
    // outlook: getOutlookCalendarLink(params),
    // ical: getICalDataUri(params),
  }
}
