'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/CheckIn/useAuth'
import { Clock3, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslate } from '@/providers/I18n/client'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface Ticket {
  ticketCode: string
  attendeeName: string
  seat: string
  ticketPriceInfo: string | object
  email: string
  phoneNumber: string
  isCheckedIn: boolean
  checkinRecord?: {
    checkInTime: string
  }
}

export default function ValidatePage() {
  const [ticketCode, setTicketCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [multipleTickets, setMultipleTickets] = useState<any[]>([])
  const router = useRouter()
  const { isHydrated, token, setToken } = useAuth()
  const searchParams = useSearchParams()
  const { t } = useTranslate()

  const { toast } = useToast()

  const eventId = searchParams?.get('eventId')
  const scheduleId = searchParams?.get('scheduleId')
  const eventLocation = searchParams?.get('eventLocation')
  const [eventTitle, setEventTitle] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')

  useEffect(() => {
    // Set initial values from searchParams
    const titleFromParams = searchParams?.get('eventTitle') || ''
    let dateFromParams = searchParams?.get('eventScheduleDate') || ''
    dateFromParams = dateFromParams ? dateFromParams.split('T')?.[0] || '' : ''

    setEventTitle(titleFromParams)
    setScheduleDate(dateFromParams)

    // If browser environment, check localStorage as fallback
    if (typeof window !== 'undefined') {
      if (!titleFromParams) {
        const storedTitle = localStorage.getItem('eventTitle')
        if (storedTitle) setEventTitle(storedTitle)
      }

      if (!dateFromParams) {
        const storedDate = localStorage.getItem('eventScheduleDate')
        if (storedDate) setScheduleDate(storedDate)
      }
    }
  }, [searchParams])

  const formatDate = (iso: string) => format(new Date(iso), 'PPpp')

  useEffect(() => {
    if (!isHydrated) return
    if (!token) {
      router.replace('/checkin')
      return
    }
  }, [isHydrated, token, router])

  const encodedTicket = (ticket: Ticket) => {
    return encodeURIComponent(
      JSON.stringify({
        code: ticket.ticketCode,
        attendeeName: ticket.attendeeName,
        phoneNumber: ticket.phoneNumber,
        eventName: eventTitle,
        eventLocation: eventLocation,
        eventTime: scheduleDate,
        seat: ticket.seat,
        ticketPriceInfo: ticket.ticketPriceInfo,
        email: ticket.email,
        isCheckedIn: ticket.isCheckedIn,
        checkinRecord: ticket.checkinRecord,
      }),
    )
  }

  const handleCheckIn = async () => {
    if (!ticketCode?.trim()) {
      toast({
        title: 'Failed',
        description: t('checkin.pleaseEnterTicketCode'),
        variant: 'destructive',
      })
      return
    }
    if (!token) {
      toast({
        title: 'Failed',
        description: t('checkin.pleaseLoginFirst'),
        variant: 'destructive',
      })
      router.push('/checkin')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch(`/api/checkin-app/validate/${ticketCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({ eventId, eventScheduleId: scheduleId }),
      })
      const data = await response.json()
      if (response.status === 401) {
        setToken('')
        return
      }
      if (response.status === 300 && data.tickets) {
        setMultipleTickets(data.tickets || [])
        return
      }
      if (response.status === 409) {
        toast({ title: t('checkin.ticketAlreadyCheckedIn') })
        const minimalTicket = {
          ticketCode: data.ticket.ticketCode,
          attendeeName: data.ticket.attendeeName,
          phoneNumber: data.ticket.phoneNumber,
          seat: data.ticket.seat,
          ticketPriceInfo: {
            key: data.ticket.ticketPriceInfo.key,
            name: data.ticket.ticketPriceInfo.name,
          },
          email: data.ticket.email,
          isCheckedIn: true,
        }

        const encodedTK = encodedTicket(minimalTicket)

        const encodedCheckinRecord = encodeURIComponent(
          JSON.stringify({
            checkInTime: formatDate(data.ticket.checkinRecord.checkInTime),
            checkedInBy: {
              email: data.ticket.checkinRecord.checkedInBy?.email,
            },
          }),
        )

        router.push(
          `/checkin/ticket-details?ticket=${encodedTK}&checkinRecord=${encodedCheckinRecord}`,
        )
        return
      }
      if (response.status === 404) {
        toast({
          title: 'Failed',
          description: data.error || t('checkin.ticketNotFound'),
          variant: 'destructive',
        })
        return
      }

      const encodedTK = encodedTicket(data.ticket)

      router.push(`/checkin/ticket-details?ticket=${encodedTK}`)
    } catch (error: any) {
      toast({
        title: 'Failed',
        description: error.message || t('error.failedToCheckIn'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectTicket = (ticket: any) => {
    const encodedTK = encodedTicket(ticket)
    const params: any = { ticket: encodedTK }
    if (ticket.isCheckedIn && ticket.checkinRecord) {
      params.checkinRecord = encodeURIComponent(JSON.stringify(ticket.checkinRecord))
    }
    const query = new URLSearchParams(params).toString()
    router.push(`/checkin/ticket-details?${query}`)
  }

  return (
    <div className="min-h-screen pt-12 p-6 bg-gray-100">
      <div className="max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => router.replace('/checkin/events')}
          className="mb-4 px-4 py-2 rounded-lg border-2 border-gray-900 text-gray-900 hover:bg-orange-50 transition"
        >
          {t('checkin.back')}
        </button>
        <div>
          <h1 className="text-2xl font-bold mb-4">
            {t('checkin.validateTicket')} {t('checkin.event')} {eventTitle}
          </h1>
          <div className="text-sm">
            {t('checkin.date')} {scheduleDate}
          </div>
        </div>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
          placeholder={t('checkin.enterTicketCodeOrSeat')}
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
        />

        <button
          onClick={handleCheckIn}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg text-white font-semibold ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'
          }`}
        >
          {isLoading ? t('checkin.validating') : t('checkin.validateTicket')}
        </button>

        <div className="flex justify-end mt-4">
          <Link
            href="/checkin/history"
            target="_blank"
            className="flex items-center gap-1 text-orange-600 hover:underline"
          >
            <Clock3 size={16} /> {t('checkin.viewHistory')}
          </Link>
        </div>

        {multipleTickets.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3">{t('checkin.multipleTicketsFoundLabel')}</h2>
            <div className="space-y-4">
              {multipleTickets?.map((ticket, index) => (
                <div
                  key={`ticket-${ticket.ticketCode}-${index}`}
                  className={`border-l-4 rounded-lg p-4 shadow-sm cursor-pointer ${
                    ticket.isCheckedIn
                      ? 'bg-red-100 border-red-600'
                      : 'bg-green-100 border-green-600'
                  }`}
                  onClick={() => handleSelectTicket(ticket)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800">{ticket.ticketCode}</span>
                    <span
                      className={`flex items-center gap-1 text-white text-sm px-2 py-1 rounded-full ${
                        ticket.isCheckedIn ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    >
                      {ticket.isCheckedIn ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      {ticket.isCheckedIn ? t('checkin.used') : t('checkin.valid')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>
                      <strong>{t('checkin.event')}</strong> {eventTitle} — {eventLocation}
                    </p>
                    <p>
                      <strong>{t('checkin.schedule')}</strong> {scheduleDate}
                    </p>
                    <p>
                      <strong>{t('checkin.seat')}</strong> {ticket.seat || 'N/A'}
                    </p>
                    <p>
                      <strong>{t('checkin.emailLabel')}</strong> {ticket.email}
                    </p>
                    <p>
                      <strong>{t('checkin.phoneNumber')}</strong> {ticket.phoneNumber}
                    </p>
                    <p>
                      <strong>{t('checkin.ticketPriceInfoLabel')}</strong>{' '}
                      {typeof ticket.ticketPriceInfo === 'string'
                        ? ticket.ticketPriceInfo
                        : ticket.ticketPriceInfo.name}
                    </p>
                    {ticket.isCheckedIn && ticket.checkinRecord && (
                      <p>
                        <strong>{t('checkin.checkedIn')}</strong>{' '}
                        {ticket.checkinRecord.checkInTime.split('T')[0]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
