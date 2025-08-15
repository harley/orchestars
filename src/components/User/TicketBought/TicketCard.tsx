'use client'

import React, { useEffect, useState } from 'react'
import { format, parse } from 'date-fns'
import { categories } from '@/components/EventDetail/data/seat-maps/categories'
import { Ticket as AppTicket } from '@/types/Ticket'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslate } from '@/providers/I18n/client'
import { TicketDetails } from '@/app/(frontend)/ticket/[ticketCode]/page.client'
import type { Ticket as PayloadTicket } from '@/payload-types'

// Helpers
function getZoneId(ticket: any): string {
  const ticketPriceId = ticket?.ticketPriceInfo?.ticketPriceId || ticket?.ticketPriceInfo?.id
  const matched = ticket?.event?.ticketPrices?.find((price: any) => price.id === ticketPriceId)
  return matched?.key || 'unknown'
}

export const TicketCard: React.FC<{
  ticket: AppTicket
  onSelectTicket: (ticket: AppTicket) => any
}> = ({ ticket, onSelectTicket }) => {
  const { t } = useTranslate()
  const zoneId = getZoneId(ticket)
  const zone = categories.find((c) => c.id === zoneId)
  const parsedDate = parse(ticket?.eventDate, 'dd/MM/yyyy', new Date())

  const [open, setOpen] = useState(false)

  // Remote status state
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [payloadTicket, setPayloadTicket] = useState<PayloadTicket | null>(null)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null)

  const canShowQR =
    ticket.status !== 'cancelled' &&
    ticket.status !== 'pending_payment' &&
    Boolean(ticket.ticketCode)

  // Fetch from your /api/tickets/[ticketCode]/status endpoint when dialog opens
  useEffect(() => {
    if (!open || !canShowQR || !ticket.ticketCode) return

    let cancelled = false
    ;(async () => {
      try {
        setStatusLoading(true)
        setStatusError(null)

        const res = await fetch(
          `/api/user/tickets/checkin-status/${encodeURIComponent(ticket.ticketCode)}`,
          {
            cache: 'no-store',
          },
        )
        if (!res.ok) {
          if (!cancelled) setStatusError(`Failed to load status (${res.status})`)
          return
        }
        const data = await res.json()
        if (cancelled) return

        setPayloadTicket(data?.ticket ?? null) // payload-types Ticket
        setIsCheckedIn(Boolean(data?.isCheckedIn)) // boolean
        setCheckedInAt(data?.checkedInAt ?? null) // string | null
      } catch {
        if (!cancelled) setStatusError('Network error')
      } finally {
        if (!cancelled) setStatusLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, canShowQR, ticket.ticketCode])

  // Fallbacks if API hasn’t returned yet (or returns null ticket)
  const fallbackIsCheckedIn = Boolean(ticket.isCheckedIn ?? (ticket as any)?.checkinRecord)
  const fallbackCheckedInAt =
    (ticket as any)?.checkinRecord?.checkInTime ?? (ticket as any)?.checkinRecord?.createdAt ?? null

  // Prefer payload ticket from API (what TicketDetails expects)
  const ticketForDetails: PayloadTicket =
    (payloadTicket as PayloadTicket) || (ticket as unknown as PayloadTicket)

  const isCheckedInForDetails = payloadTicket ? isCheckedIn : fallbackIsCheckedIn
  const checkedInAtForDetails = payloadTicket ? checkedInAt : fallbackCheckedInAt

  return (
    <div
      key={ticket.id}
      className="flex overflow-hidden shadow-md mb-4 border-l-8 z-[50] relative"
      style={{ borderColor: zone?.color || '#333' }}
    >
      {/* Gift Button */}
      {ticket.status === 'booked' && !ticket.giftInfo?.isGifted && (
        <button
          onClick={() => onSelectTicket(ticket)}
          className="absolute top-3 right-3 bg-black hover:bg-black text-white text-sm px-3 py-1 rounded-full transition-colors z-10"
        >
          🎁 {t('userprofile.giftTicket')}
        </button>
      )}

      {/* Date Block */}
      <div
        className="flex flex-col items-center rounded-r-lg justify-center px-4 py-3 text-white w-24"
        style={{ backgroundColor: zone?.color || '#333' }}
      >
        <div className="text-3xl font-bold">{format(parsedDate, 'dd')}</div>
        <div className="uppercase text-sm">{format(parsedDate, 'LLL')}</div>
        <div className="text-sm">{format(parsedDate, 'yyyy')}</div>
      </div>

      {/* Details Block */}
      <div className="flex-1 bg-gray-100 rounded-l-lg px-4 py-3">
        <h2 className="text-lg font-semibold mb-1">{ticket?.event?.title}</h2>

        <div className="flex gap-2 items-center mb-2">
          {ticket.status === 'booked' && (
            <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded">
              {t('userprofile.statusSuccess')}
            </span>
          )}
          {ticket.status === 'pending_payment' && (
            <span className="inline-block bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              {t('userprofile.statusPendingPayment')}
            </span>
          )}
          {ticket.status === 'hold' && (
            <span className="inline-block bg-orange-500 text-white text-xs px-2 py-1 rounded">
              {t('userprofile.statusHold')}
            </span>
          )}
          {ticket.status === 'cancelled' && (
            <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded">
              {t('userprofile.statusCancelled')}
            </span>
          )}
        </div>

        <p className="text-sm">
          {t('userprofile.orderCode')}: <strong>{ticket.ticketCode}</strong>
        </p>
        <p className="text-sm">{ticket.eventDate}</p>
        <p className="text-sm">
          {t('userprofile.seat')}: {ticket.seat || '—'}
        </p>
        <p className="text-sm">
          {t('userprofile.ticketPrice')}: {ticket.ticketPriceInfo?.name || '—'}
        </p>
        <p className="text-sm">{ticket.event?.eventLocation || t('userprofile.location')}</p>
      </div>

      {/* QR / Details Modal Trigger */}
      <div className="flex justify-end bg-gray-100 px-3 pb-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              disabled={!canShowQR}
              className="mt-12 rounded-full h-8 min-h-0 !py-1 px-3 font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {t('ticket.viewQR') ?? 'View QR'}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[520px] max-h-lvh">
            <DialogHeader>
              <DialogTitle>{t('ticket.qrCode') ?? 'Ticket QR'}</DialogTitle>
            </DialogHeader>

            {statusLoading && (
              <div className="py-6 text-center text-sm text-gray-500">
                {t('common.loading') ?? 'Loading…'}
              </div>
            )}
            {statusError && (
              <div className="py-2 text-center text-sm text-red-600">{statusError}</div>
            )}

            <TicketDetails
              ticket={ticketForDetails}
              isCheckedIn={isCheckedInForDetails}
              checkedInAt={checkedInAtForDetails}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
