import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import type { Ticket, CheckinRecord } from '@/payload-types'
import { QRCodeComponent } from '@/components/QRCode'
import { Gutter } from '@payloadcms/ui'
import { Calendar, MapPin, Wallet } from 'lucide-react'

const queryTicketByCode = cache(async ({ ticketCode }: { ticketCode: string }): Promise<Ticket | null> => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'tickets',
    limit: 1,
    pagination: false,
    where: {
      ticketCode: {
        equals: ticketCode,
      },
    },
    depth: 2,
    overrideAccess: true, // ticket is public to view
  })

  return (result?.docs?.[0] as Ticket) || null
})

export async function generateMetadata({ params }: { params: Promise<{ ticketCode: string }> }): Promise<Metadata> {
  const { ticketCode } = await params
  const ticket = await queryTicketByCode({ ticketCode })
  const pageTitle: string = ticket?.ticketCode ? `Ticket ${ticket.ticketCode}` : 'Ticket'
  return {
    title: pageTitle,
  }
}

export default async function TicketPage({ params }: { params: Promise<{ ticketCode: string }> }) {
  const { ticketCode } = await params
  const ticket = await queryTicketByCode({ ticketCode })

  // Fetch checkin record to see if already checked in
  const payload = await getPayload({ config: configPromise })
  const checkinRes = await payload.find({
    collection: 'checkinRecords',
    limit: 1,
    pagination: false,
    where: {
      ticketCode: {
        equals: ticketCode.toUpperCase(),
      },
    },
  })
  const checkedInRecord = (checkinRes?.docs?.[0] as CheckinRecord | undefined) ?? null
  const isCheckedIn = Boolean(checkedInRecord)

  if (!ticket) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Ticket not found</h1>
      </div>
    )
  }

  const event = typeof ticket.event === 'object' ? ticket.event : null

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
    <Gutter className="flex justify-center py-10">
      <article className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <header className="p-6 pb-4 border-b border-gray-100">
          <span className="inline-block bg-gray-100 text-gray-500 text-[10px] font-semibold uppercase tracking-wider rounded px-2 py-0.5">
            Ticket
          </span>
          {event?.title && <h2 className="text-2xl font-bold mt-2">{event.title}</h2>}

          {formattedDateTime && (
            <p className="mt-2 flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1" /> {formattedDateTime}
            </p>
          )}

          {event?.eventLocation && (
            <p className="flex items-start text-sm text-gray-600 mt-1">
              <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" /> {event.eventLocation}
            </p>
          )}
        </header>

        {/* QR Section */}
        <section className="flex justify-center p-6 border-b border-gray-100">
          <QRCodeComponent payload={ticket.ticketCode || ''} className="w-56 h-56" />
        </section>

        {/* Info Section */}
        <section className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Guest</p>
              <p className="font-medium text-gray-800">{ticket.attendeeName ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p
                className={
                  isCheckedIn ? 'font-medium text-emerald-600' : 'font-medium text-gray-800'
                }
              >
                {isCheckedIn ? '✅ Checked In' : ticket.status || 'Booked'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-gray-500">Ticket</p>
            <p className="font-medium text-gray-800">
              {ticket.ticketPriceName ? `1× ${ticket.ticketPriceName}` : '1× Standard'}
            </p>
          </div>
        </section>

        {/* Actions */}
        <footer className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <a
            href={event?.eventLocation ? `https://maps.google.com/?q=${encodeURIComponent(event.eventLocation ?? '')}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 transition"
          >
            <MapPin className="w-4 h-4" /> Get Directions
          </a>

          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 transition"
            disabled
          >
            <Wallet className="w-4 h-4" /> Add to Wallet
          </button>
        </footer>
      </article>
    </Gutter>
  )
} 