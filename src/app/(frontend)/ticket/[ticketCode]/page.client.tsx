'use client'

import { useRef, useEffect } from 'react'
import type { Event, Ticket } from '@/payload-types'
import { QRCodeComponent } from '@/components/QRCode'
import { Calendar, Download, MapPin } from 'lucide-react'
import html2canvas from 'html2canvas'
import { useTranslate } from '@/providers/I18n/client'
import { TermsAndConditionsModal } from '@/components/Tickets/TermsAndConditionsModal'
import { categories } from '@/components/EventDetail/data/seat-maps/categories'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
import { isValid, parse as parseDate } from 'date-fns'
import LanguageSwitcher from '@/components/LanguageSwitcher'

// Utility function to get ticket class color
const getTicketClassColor = (ticketPriceInfo: any) => {
  if (!ticketPriceInfo || typeof ticketPriceInfo !== 'object') {
    return { color: '#6B7280', textColor: '#fff' } // Default gray color
  }

  const ticketKey = ticketPriceInfo.key
  const category = categories.find((cat) => cat.id === ticketKey)

  return category
    ? { color: category.color, textColor: category.textColor }
    : { color: '#6B7280', textColor: '#fff' } // Default gray color
}

// Utility functions for date/time formatting
const formatEventTime = (startDatetime?: string, endDatetime?: string): string => {
  if (!startDatetime) return 'N/A'

  try {
    const startTime = tzFormat(toZonedTime(new Date(startDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')
    const endTime = endDatetime
      ? tzFormat(toZonedTime(new Date(endDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')
      : 'N/A'

    return `${startTime} – ${endTime}`
  } catch (error) {
    console.error('Failed to format event time:', error)
    return 'N/A'
  }
}

const getEventDate = (event: Event, ticket: Ticket, locale: string): string => {
  // First try to get date from schedule
  const eventDateByScheduleId = event.schedules?.find?.(
    (schedule: any) => schedule.id === ticket.eventScheduleId,
  )?.date

  if (eventDateByScheduleId) {
    return new Date(eventDateByScheduleId).toLocaleString(locale, {
      dateStyle: 'medium',
    })
  }

  // Fallback to ticket event date
  if (ticket.eventDate) {
    const ticketDate = new Date(ticket.eventDate)

    if (isValid(ticketDate)) {
      return ticketDate.toLocaleString(locale, {
        dateStyle: 'medium',
      })
    }

    // Try parsing with dd/MM/yyyy format
    try {
      const parsedDate = parseDate(ticket.eventDate, 'dd/MM/yyyy', new Date())

      if (isValid(parsedDate)) {
        return parsedDate.toLocaleString(locale, {
          dateStyle: 'medium',
        })
      }
    } catch (error) {
      console.error('Failed to parse ticket event date:', error)
    }
  }

  return 'N/A'
}

const formatEventDateTime = (event: Event, ticket: Ticket, locale: string): string | null => {
  if (!event?.startDatetime) return null

  try {
    const timeString = formatEventTime(event.startDatetime as string, event.endDatetime as string)
    const dateString = getEventDate(event, ticket, locale)

    return `${timeString}, ${dateString}`
  } catch (error) {
    console.error('Failed to format event date/time:', error)
    return null
  }
}

export function TicketDetails({
  ticket,
  isCheckedIn,
  checkedInAt,
}: {
  ticket: Ticket
  isCheckedIn: boolean
  checkedInAt?: string | null
}) {
  const ticketRef = useRef<HTMLElement>(null)
  const { t, locale } = useTranslate()

  // Hide global navbar for this page
  useEffect(() => {
    const nav = document.querySelector('nav') as HTMLElement | null
    if (nav) nav.style.display = 'none'
    return () => {
      if (nav) nav.style.display = ''
    }
  }, [])
  const isBooked = ticket.status === 'booked'
  const event = typeof ticket.event === 'object' ? ticket.event : null

  // Helper to format relative time (e.g., "2 hours ago")
  const getRelativeTime = (dateString: string): string => {
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

  // Get ticket class color
  const ticketClassColor = getTicketClassColor(ticket.ticketPriceInfo)

  const handleDownload = () => {
    if (!ticketRef.current) return

    html2canvas(ticketRef.current, {
      scale: 2,
      onclone: (document) => {
        const footer = document.querySelector('footer')
        if (footer) footer.style.display = 'none'
      },
    })
      .then((canvas) => {
        canvas.toBlob(async (blob) => {
          if (!blob) return

          const fileName = `ticket-${(ticket.ticketCode || '').replace(/[^a-zA-Z0-9_-]/g, '')}.png`
          const file = new File([blob], fileName, { type: 'image/png' })

          // Prefer Web Share API with files (iOS/Android) so user can save directly to photos
          // iOS Safari will show the "Save Image" option which saves to gallery
          if (
            typeof navigator !== 'undefined' &&
            (navigator as any).canShare &&
            (navigator as any).canShare({ files: [file] })
          ) {
            try {
              await (navigator as any).share({
                files: [file],
                title: 'Ticket QR',
                text: 'Your event ticket',
              })
              return
            } catch (e) {
              // fall through to fallback download
              console.error('Share failed, falling back to download', e)
            }
          }

          // Fallback: trigger standard download
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = fileName
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        }, 'image/png')
      })
      .catch((error) => {
        console.error('Error generating ticket image:', error)
      })
  }

  // Format date/time & location if available
  let formattedDateTime: string | null = null

  if (event?.startDatetime) {
    try {
      formattedDateTime = formatEventDateTime(event, ticket, locale)
    } catch (e) {
      console.error('Failed to format event date/time:', e)
    }
  }

  return (
    <div>
      <article
        ref={ticketRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
      >
        {/* Header */}
        <header className="p-6 pb-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <img src="/images/ticket.svg" alt="Ticket" className="h-20 -mt-4" />
            {ticket.ticketPriceName && (
              <span
                className="px-4 py-2 rounded-lg text-lg font-bold shadow-sm"
                style={{
                  backgroundColor: ticketClassColor.color,
                  color: ticketClassColor.textColor,
                }}
              >
                {ticket.ticketPriceName}
              </span>
            )}
          </div>

          {event?.title && (
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{event.title}</h2>
              {/* removed small price badge */}
            </div>
          )}

          {formattedDateTime && (
            <p className="mt-2 flex items-start text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />{' '}
              <span className="font-semibold">{formattedDateTime}</span>
            </p>
          )}

          {event?.eventLocation && (
            <p className="flex items-start text-sm text-gray-600 mt-1">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />{' '}
              <span>{event.eventLocation}</span>
            </p>
          )}
        </header>

        {/* QR Section */}
        <section className="flex justify-center">
          {isBooked ? (
            <div className="relative">
              <QRCodeComponent
                payload={ticket.ticketCode || ''}
                className="w-56 h-56"
                options={{
                  color: {
                    dark: ticketClassColor.color,
                    light: '#FFFFFF',
                  },
                }}
              />
              {isCheckedIn && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                  <span className="text-2xl font-bold text-gray-800 transform -rotate-12 border-4 border-gray-800 px-4 py-2 rounded-lg">
                    CHECKED IN
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-56 h-56 bg-gray-100 flex items-center justify-center rounded-lg">
              <p className="text-gray-500 text-center">{t('ticket.qrCodeNotAvailable')}</p>
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="border-b border-gray-100">
          {ticket.seat && (
            <div className="flex justify-center items-baseline gap-2">
              <span className="text-gray-500">{t('checkin.seat')}</span>
              <span className="font-bold text-2xl text-gray-800">{ticket.seat}</span>
            </div>
          )}
        </section>

        {/* Instructions Link */}
        <div className="pt-4 px-6 text-center">
          <a
            href="https://orchestars.vn/check-in-process-rules-at-event-disney-25"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-xs text-gray-500 hover:text-gray-800"
          >
            {t('ticket.instructions')}
          </a>
        </div>

        <section className="p-6 space-y-4 text-sm border-b border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Guest</p>
              <p className="font-medium text-gray-800">
                {isBooked ? (ticket.attendeeName ?? '—') : '********'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Order Code</p>
              <p className="font-medium text-gray-800">{ticket.orderCode ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Ticket Code</p>
              <p className="font-medium text-gray-800">{ticket.ticketCode ?? '—'}</p>
            </div>
            {isCheckedIn && checkedInAt && (
              <div>
                <p className="text-gray-500">Checked&nbsp;In&nbsp;Time</p>
                <p className="font-medium text-gray-800">
                  {new Date(checkedInAt).toLocaleString(locale, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Actions */}
        <footer className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <a
            href={
              event?.eventLocation
                ? `https://maps.google.com/?q=${encodeURIComponent(event.eventLocation ?? '')}`
                : '#'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 transition"
          >
            <MapPin className="w-4 h-4" /> {t('ticket.getDirections')}
          </a>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isCheckedIn}
            className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> {t('ticket.saveQRCode')}
          </button>
        </footer>
        {/* Checked-in relative time message */}
        {isCheckedIn && checkedInAt && (
          <div className="px-6 pb-4 pt-2 text-center text-sm text-gray-600">
            {t('ticket.checkedIn')} {getRelativeTime(checkedInAt)}
          </div>
        )}
      </article>
      {/* Terms (left) and Language Switcher (right) */}
      <div className="pt-4 px-6 flex items-center">
        {event?.eventTermsAndConditions && (
          <TermsAndConditionsModal terms={event.eventTermsAndConditions} />
        )}
        {/* push switcher to right */}
        <div className="ml-auto">
          <LanguageSwitcher className="bg-white/90 hover:bg-white text-gray-800 hover:text-gray-900 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 rounded-md px-2 py-1 shadow flex items-center gap-1" />
        </div>
      </div>
    </div>
  )
}
