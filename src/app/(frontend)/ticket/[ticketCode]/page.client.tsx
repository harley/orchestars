'use client'

import { useRef } from 'react'
import type { Ticket } from '@/payload-types'
import { QRCodeComponent } from '@/components/QRCode'
import { Calendar, Download, MapPin } from 'lucide-react'
import html2canvas from 'html2canvas'
import DOMPurify from 'dompurify'
import { useTranslate } from '@/providers/I18n/client'

export function TicketDetails({ ticket, isCheckedIn }: { ticket: Ticket; isCheckedIn: boolean }) {
  const ticketRef = useRef<HTMLElement>(null)
  const { t } = useTranslate()
  const isBooked = ticket.status === 'booked'
  const event = typeof ticket.event === 'object' ? ticket.event : null

  const handleDownload = () => {
    if (ticketRef.current) {
      html2canvas(ticketRef.current, {
        scale: 2, // Improves quality/sharpness
        onclone: document => {
          // Hide buttons from the clone before capture
          const footer = document.querySelector('footer')
          if (footer) {
            footer.style.display = 'none'
          }
        },
      }).then(canvas => {
        const link = document.createElement('a')
        link.download = `ticket-${(ticket.ticketCode || '').replace(/[^a-zA-Z0-9_-]/g, '')}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      })
    }
  }

  // Format date/time & location if available
  let formattedDateTime: string | null = null
  if (event?.startDatetime) {
    try {
      formattedDateTime = new Date(event.startDatetime).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch {}
  }

  return (
    <article
      ref={ticketRef}
      className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <header className="p-6 pb-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-flex items-center bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-md px-3 py-1.5">
              {t('ticket.ticket')}
            </span>
            {event?.title && (
              <h2
                className="text-2xl font-bold mt-2"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.title) }}
              />
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p
              className={
                isCheckedIn
                  ? 'font-medium text-emerald-600'
                  : ticket.status === 'booked'
                  ? 'font-medium text-blue-600'
                  : 'font-medium text-gray-800'
              }
            >
              {isCheckedIn
                ? '✅ Checked In'
                : ticket.status === 'booked'
                ? t('ticket.readyToCheckIn')
                : ticket.status
                ? ticket.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                : t('ticket.booked')}
            </p>
          </div>
        </div>

        {formattedDateTime && (
          <p className="mt-2 flex items-start text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />{' '}
            <span>{formattedDateTime}</span>
          </p>
        )}

        {event?.eventLocation && (
          <p className="flex items-start text-sm text-gray-600 mt-1">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> <span>{event.eventLocation}</span>
          </p>
        )}
      </header>

      {/* QR Section */}
      <section className="flex justify-center p-6 border-b border-gray-100">
        {isBooked ? (
          <QRCodeComponent payload={ticket.ticketCode || ''} className="w-56 h-56" />
        ) : (
          <div className="w-56 h-56 bg-gray-100 flex items-center justify-center rounded-lg">
            <p className="text-gray-500 text-center">QR code available for booked tickets only.</p>
          </div>
        )}
      </section>

      {/* Info Section */}
      <section className="p-6 space-y-4 text-sm border-b border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Guest</p>
            <p className="font-medium text-gray-800">
              {isBooked ? ticket.attendeeName ?? '—' : '********'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Ticket</p>
            <p className="font-medium text-gray-800">
              {ticket.ticketPriceName ? `1× ${ticket.ticketPriceName}` : '1× Standard'}
            </p>
          </div>
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
          className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 transition"
        >
          <Download className="w-4 h-4" /> {t('ticket.saveQRCode')}
        </button>
      </footer>
    </article>
  )
} 