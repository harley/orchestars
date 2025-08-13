'use client'
import React, { useState } from 'react'
import { format, parse } from 'date-fns'
import { categories } from '@/components/EventDetail/data/seat-maps/categories'
import { Ticket } from '@/types/Ticket'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QRCodeComponent } from '@/components/QRCode'
// import { Ticket } from '@/payload-types'
import { useTranslate } from '@/providers/I18n/client'

function getZoneId(ticket: any): string {
  const ticketPriceId = ticket?.ticketPriceInfo?.ticketPriceId || ticket?.ticketPriceInfo?.id
  const matched = ticket?.event?.ticketPrices?.find((price: any) => price.id === ticketPriceId)
  return matched?.key || 'unknown'
}

export const TicketCard: React.FC<{ ticket: Ticket; onSelectTicket: (ticket: Ticket) => any }> = ({
  ticket,
  onSelectTicket,
}) => {
  const { t } = useTranslate()
  const zoneId = getZoneId(ticket)
  const zone = categories.find((c) => c.id === zoneId)
  const parsedDate = parse(ticket?.eventDate, 'dd/MM/yyyy', new Date())

  const [open, setOpen] = useState(false)
  const canShowQR =
    ticket.status !== 'cancelled' &&
    ticket.status !== 'pending_payment' &&
    Boolean(ticket.ticketCode)
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')

  const qrUrl = `${baseUrl}/ticket/${encodeURIComponent(ticket.ticketCode)}`

  return (
    <>
      <div
        key={ticket.id}
        className="flex overflow-hidden shadow-md mb-4 border-l-8 z-[50] relative"
        style={{ borderColor: zone?.color || '#333' }}
      >
        {/* Gift Button - Show only for 'booked' status tickets */}
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

        {/* QR Button (aligned to end) */}
        <div className="flex justify-end bg-gray-100">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              {canShowQR && (
                <Button
                  size="sm"
                  disabled={!canShowQR}
                  className="rounded-full mr-3 h-8 px-3 py-2 w-27 text-white bg-blue-500 hover:bg-blue-600 transition-colors flex items-center gap-2 mt-12"
                >
                  {t('ticket.viewQR') ?? 'View QR'}
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[380px]">
              <DialogHeader>
                <DialogTitle>{t('ticket.qrCode') ?? 'Ticket QR'}</DialogTitle>
              </DialogHeader>
              {/* QR only */}
              <div className="flex justify-center py-2">
                {canShowQR ? (
                  <QRCodeComponent
                    payload={qrUrl}
                    className="w-64 h-64"
                    options={{
                      // Use your zone color as the dark module color if desired
                      color: {
                        dark: zone?.color || '#000000',
                        light: '#FFFFFF',
                      },
                      // width is controlled by className; omit here or keep default
                    }}
                  />
                ) : (
                  <div className="text-sm text-gray-500">
                    {t('ticket.qrCodeNotAvailable') ?? 'QR Code not available'}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}
