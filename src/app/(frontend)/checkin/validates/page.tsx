'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/CheckIn/useAuth'

import { Clock3, CheckCircle, XCircle, Key } from 'lucide-react'
import { format } from 'date-fns'

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
  const { isHydrated, token } = useAuth()
  const searchParams = useSearchParams()

  const eventId = searchParams?.get('eventId')
  const scheduleId = searchParams?.get('scheduleId')
  const eventLocation = searchParams?.get('eventLocation')
  const eventTitle = searchParams?.get('eventTitle')
  const scheduleDate = (searchParams?.get('eventScheduleDate') || '').split('T')[0]

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
    if (!ticketCode.trim()) {
      alert('Please enter a ticket code')
      return
    }
    if (!token) {
      alert('Please login first')
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
      if (response.status === 300 && data.tickets) {
        setMultipleTickets(data.tickets || [])
        return
      }
      if (response.status === 409) {
        alert('Ticket already checked in')
        const minimalTicket = {
          ticketCode: data.ticket.ticketCode,
          attendeeName: data.ticket.attendeeName,
          phoneNumber: data.ticket.phoneNumber,
          seat: data.ticket.seat,
          ticketPriceInfo:
          {
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
          })
        )
        
        router.push(
          `/checkin/ticket-details?ticket=${encodedTK}&checkinRecord=${encodedCheckinRecord}`
        )
        return        
      }
      if (response.status === 404) {
        alert(data.error || 'Ticket not found')
        return
      }

      const encodedTK = encodedTicket(data.ticket)

      router.push(`/checkin/ticket-details?ticket=${encodedTK}`)
    } catch (error: any) {
      alert(error.message || 'Failed to check in')
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
          Back
        </button>

        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
          placeholder="Enter ticket code/Seat"
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
          {isLoading ? 'Validating...' : 'Validate Ticket'}
        </button>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => router.push('/checkin/history')}
            className="flex items-center gap-1 text-orange-600 hover:underline"
          >
            <Clock3 size={16} /> View History
          </button>
        </div>

        {multipleTickets.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3">Multiple Tickets Found</h2>
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
                      {ticket.isCheckedIn ? 'Used' : 'Valid'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>
                      <strong>Event:</strong> {eventTitle} — {eventLocation}
                    </p>
                    <p>
                      <strong>Schedule:</strong> {scheduleDate}
                    </p>
                    <p>
                      <strong>Seat:</strong> {ticket.seat || 'N/A'}
                    </p>
                    <p>
                      <strong>Email:</strong> {ticket.email}
                    </p>
                    <p>
                      <strong>Phone Number:</strong> {ticket.phoneNumber}
                    </p>
                    <p>
                      <strong>Ticket Price Info:</strong> {ticket.ticketPriceInfo}
                    </p>
                    {ticket.isCheckedIn && ticket.checkinRecord && (
                      <p>
                        <strong>Checked in:</strong>{' '}
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
