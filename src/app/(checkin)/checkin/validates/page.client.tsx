'use client'

import { useEffect, useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/providers/CheckIn/useAuth'
import { toast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, History, ChevronDown, X } from 'lucide-react'
import type { CheckinRecord, User } from '@/payload-types'
import { type TicketDTO } from '@/lib/checkin/findTickets'
import Link from 'next/link'
import { useTranslate } from '@/providers/I18n/client'

interface CheckinHistoryProps {}

const CheckinHistory = forwardRef((props: CheckinHistoryProps, ref) => {
  const [history, setHistory] = useState<CheckinRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const hasFetched = useRef(false)

  const fetchHistory = useCallback(async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/checkin-app/scan-history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data.records || [])
        hasFetched.current = true
      }
    } catch (err) {
      console.error('Failed to fetch checkin history:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  useImperativeHandle(ref, () => ({
    fetchHistory,
  }))

  useEffect(() => {
    if (isOpen && !hasFetched.current) {
      fetchHistory()
    }
  }, [isOpen, fetchHistory])

  return (
    <div className="w-full flex flex-col items-center">
      {isOpen && (
        <div className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-t overflow-y-auto max-h-48 mb-2 relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Close history"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          {isLoading && <p className="text-gray-600 dark:text-gray-300">Loading history...</p>}
          {!isLoading && history.length === 0 && <p className="text-gray-600 dark:text-gray-300">No recent check-ins.</p>}
          <ul className="space-y-2 pr-8">
            {history.map(record => (
              <li key={record.id} className="text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
                <p>
                  <strong>Ticket:</strong> {record.ticketCode}
                </p>
                <p>
                  <strong>Attendee:</strong>{' '}
                  {`${(record.user as User)?.firstName || ''} ${
                    (record.user as User)?.lastName || ''
                  }`.trim() || 'N/A'}
                </p>
                <p>
                  <strong>Time:</strong>{' '}
                  {record.checkInTime
                    ? new Date(record.checkInTime).toLocaleTimeString()
                    : 'N/A'}
                </p>
                <p>
                  <strong>Method:</strong>{' '}
                  <span className={`px-2 py-1 rounded text-xs ${
                    record.manual 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {record.manual ? 'Manual' : 'QR Scan'}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={() => {
          if (isOpen) {
            // If expanded, refetch history instead of collapsing
            fetchHistory()
          } else {
            // If collapsed, expand
            setIsOpen(true)
          }
        }}
        className="inline-flex items-center justify-center w-full gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
      >
        <History className="w-5 h-5" />
        <span>{isOpen ? 'Refresh History' : 'Checkin History'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  )
})
CheckinHistory.displayName = 'CheckinHistory'

export default function ValidatePageClient() {
  const [ticketCode, setTicketCode] = useState('')
  const [seatNumber, setSeatNumber] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [validatedTicket, setValidatedTicket] = useState<TicketDTO | null>(null)
  const [multipleTickets, setMultipleTickets] = useState<TicketDTO[]>([])
  const [activeTab, setActiveTab] = useState('ticket')
  const router = useRouter()
  const pathname = usePathname()
  const { isHydrated, token } = useAuth()
  const searchParams = useSearchParams()
  const { t } = useTranslate()
  // Translation hook and additional toast hook removed as they were unused

  const ticketInputRef = useRef<HTMLInputElement>(null)
  const seatInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<{ fetchHistory: () => void }>(null)
  // Track last action timestamps to prevent rapid duplicate submissions
  const lastValidateRef = useRef<number>(0)
  const lastCheckInRef = useRef<number>(0)

  const eventId = searchParams?.get('eventId')
  const scheduleId = searchParams?.get('scheduleId')
  const [eventTitle, setEventTitle] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [showDateWarning, setShowDateWarning] = useState(false);
  const [eventLocation, setEventLocation] = useState('');
  const [eventTime, setEventTime] = useState('TBA'); // Placeholder; adjust if time is available in data

  // Component initialization

  useEffect(() => {
    // Get data from localStorage
    if (typeof window !== 'undefined') {
      const storedTitle = localStorage.getItem('eventTitle')
      const storedDate = localStorage.getItem('eventScheduleDate')
      const storedTime = localStorage.getItem('eventScheduleTime')
      
      if (storedTitle) setEventTitle(storedTitle)
      if (storedDate) setScheduleDate(storedDate)
      if (storedTime) setEventTime(storedTime)
    }
    const storedLocation = localStorage.getItem('eventLocation');
    if (storedLocation) setEventLocation(storedLocation);
    
    // Date mismatch check
    if (scheduleDate) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Parse DD-MM-YYYY format to create a valid Date object
      let selectedDateObj;
      if (scheduleDate.includes('-')) {
        const parts = scheduleDate.split('-');
        if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
          const [day, month, year] = parts;
          // Create date with proper format (year, month-1, day) since months are 0-indexed
          selectedDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Fallback to direct parsing
          selectedDateObj = new Date(scheduleDate);
        }
      } else {
        // Fallback to direct parsing
        selectedDateObj = new Date(scheduleDate);
      }
      
      // Check if the date is valid before calling toISOString
      if (!isNaN(selectedDateObj.getTime())) {
        const selectedDate = selectedDateObj.toISOString().split('T')[0];
        setShowDateWarning(today !== selectedDate);
      } else {
        // If invalid date, don't show warning
        setShowDateWarning(false);
      }
    }
    // Auto-focus on initial load
    ticketInputRef.current?.focus()
  }, [scheduleDate])

  useEffect(() => {
    if (activeTab === 'ticket') {
      ticketInputRef.current?.focus()
    } else if (activeTab === 'seat') {
      seatInputRef.current?.focus()
    } else if (activeTab === 'email') {
      emailInputRef.current?.focus()
    } else if (activeTab === 'phone') {
      phoneInputRef.current?.focus()
    }
  }, [activeTab])

  // If not hydrated yet, show loading
  if (!isHydrated) {
    return (
      <div className="min-h-screen pt-12 p-6 bg-gray-100">
        <div className="max-w-xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  const handleValidate = async () => {
    // Throttle: ignore if last validate <2s ago
    const now = Date.now()
    if (now - lastValidateRef.current < 2000) return
    lastValidateRef.current = now

    let value
    let description
    switch (activeTab) {
      case 'ticket':
        value = ticketCode.trim()
        description = 'ticket code'
        break
      case 'seat':
        value = seatNumber.trim()
        description = 'seat number'
        break
      case 'email':
        value = email.trim()
        description = 'email address'
        break
      case 'phone':
        value = phoneNumber.trim()
        description = 'phone number'
        break
      default:
        value = ''
        description = ''
    }

    if (!value) {
      toast({
        title: 'Input Required',
        description: `Please enter a ${description} to look up.`,
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    setValidatedTicket(null)
    setMultipleTickets([])

    try {
      let response
      let body

      if (activeTab === 'seat') {
        // Seat validation logic
        response = await fetch(`/api/checkin-app/validate-seat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify({
            eventId,
            scheduleId,
            seatNumber: value,
          }),
        })
      } else if (activeTab === 'email' || activeTab === 'phone') {
        body = { eventId, scheduleId }
        if (activeTab === 'email') {
          body.email = value
        } else {
          body.phoneNumber = value
        }
        response = await fetch(`/api/checkin-app/validate-contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify(body),
        })
      } else {
        // Ticket code validation logic
        response = await fetch(`/api/checkin-app/validate/${value}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify({ eventId, scheduleId }),
        })
      }

      const data = await response.json()

      if (response.ok) {
        if (activeTab === 'seat' || activeTab === 'email' || activeTab === 'phone') {
          if (data.tickets && data.tickets.length > 1) {
            // Multiple tickets found for the seat
            setMultipleTickets(data.tickets)
            setValidatedTicket(null)
            toast({
              title: 'MULTIPLE FOUND',
              description: `Found ${data.tickets.length} tickets for this criteria.`,
              variant: 'success',
            })
          } else if (data.tickets && data.tickets.length === 1) {
            // Single ticket found for the seat
            const ticket = data.tickets[0]
            setValidatedTicket(ticket)
            setMultipleTickets([])
            if (ticket.isCheckedIn) {
              toast({
                title: 'ALREADY CHECKED IN',
                description: 'This visitor has already been checked in.',
                variant: 'destructive',
              })
            } else {
              toast({
                title: 'TICKET FOUND',
                description: 'Ready for check-in.',
                variant: 'success',
              })
            }
          } else {
            // No tickets found
            setValidatedTicket(null)
            setMultipleTickets([])
            toast({
              title: 'Not Found',
              description: 'No ticket found for that criteria.',
              variant: 'destructive',
            })
          }
        } else {
          // This handles the 'ticket' tab case
          const ticket = data.ticket
          setValidatedTicket(ticket)
          setMultipleTickets([])
          if (ticket?.isCheckedIn) {
            toast({
              title: 'ALREADY CHECKED IN',
              description: 'This visitor has already been checked in',
              variant: 'destructive',
            })
          } else {
            toast({
              title: 'TICKET FOUND',
              description: 'Ready for check-in',
              variant: 'success',
            })
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        // Simple error toast
        toast({
          title: activeTab === 'ticket' ? 'Ticket Not Found' : 'Seat Not Found',
          description:
            errorData.message ||
            (activeTab === 'ticket'
              ? 'No ticket found with that code.'
              : 'No ticket found for that seat.'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Validation error:', error)
      toast({
        title: 'ERROR',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckIn = async (ticket: TicketDTO) => {
    // Throttle duplicate check-in clicks
    const now = Date.now()
    if (now - lastCheckInRef.current < 2000) return
    lastCheckInRef.current = now

    setIsCheckingIn(true)
    try {
      const response = await fetch(`/api/checkin-app/checkin/${ticket.ticketCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({ eventDate: scheduleDate, manual: true }),
      })
      
      // Consume the response body to avoid memory leaks, even though we don't presently need the data
      await response.json()
      
      if (response.ok) {
        const attendeeName = ticket.attendeeName || 'Guest'
        // Show success toast including attendee's name
        toast({
          title: 'CHECK-IN COMPLETE',
          description: `Visitor ${attendeeName} successfully checked in`,
          variant: 'success',
        })
        // Update the ticket state to show as checked in
        if (validatedTicket) {
          setValidatedTicket({ ...ticket, isCheckedIn: true })
        }
        if (multipleTickets.length > 0) {
          setMultipleTickets(prevTickets =>
            prevTickets.map(t =>
              t.ticketCode === ticket.ticketCode ? { ...t, isCheckedIn: true } : t,
            ),
          )
        }
        // Refresh checkin history
        historyRef.current?.fetchHistory()
      } else {
        toast({
          title: 'CHECK-IN FAILED',
          description: 'Failed to check in',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Check-in error:', error)
      toast({
        title: 'ERROR',
        description: 'Check-in error',
        variant: 'destructive',
      })
    } finally {
      setIsCheckingIn(false)
    }
  }

  const resetValidation = () => {
    setValidatedTicket(null)
    setMultipleTickets([])
    setTicketCode('')
    setSeatNumber('')
    setEmail('')
    setPhoneNumber('')
  }

  const onTabChange = (value: string) => {
    setActiveTab(value)
    // Reset inputs when tab changes
    setTicketCode('')
    setSeatNumber('')
    setEmail('')
    setPhoneNumber('')

    // Set focus to the input of the newly selected tab
    setTimeout(() => {
      if (value === 'ticket') {
        ticketInputRef.current?.focus()
      } else if (value === 'seat') {
        seatInputRef.current?.focus()
      } else if (value === 'email') {
        emailInputRef.current?.focus()
      } else if (value === 'phone') {
        phoneInputRef.current?.focus()
      }
    }, 0)
  }

  return (
    <>
      <style jsx global>{`
        [data-radix-toast-viewport] {
          top: 1rem !important;
          bottom: auto !important;
        }
      `}</style>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-start justify-center p-4 pt-8">
        <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.replace('/checkin/events')}
          className="mb-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          ← Back to Events
        </button>

        {/* Navigation Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href="/checkin/scan"
            className={`text-center py-2 px-4 rounded font-semibold ${
              pathname === '/checkin/scan'
                ? 'bg-gray-900 dark:bg-gray-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          >
            {t('checkin.nav.qr')}
          </Link>
          <Link
            href="/checkin/events"
            className={`text-center py-2 px-4 rounded font-semibold ${
              pathname === '/checkin/events' || pathname.includes('/checkin/validates')
                ? 'bg-gray-900 dark:bg-gray-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          >
            {t('checkin.nav.search')}
          </Link>
        </div>

        {/* Title - More prominent */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Visitor Check-In
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center text-sm">
          Enter a ticket code or seat to look up and check-in visitors
        </p>

        {/* Event Info - Formatted, no IDs */}
        {eventTitle && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              {eventTitle}
            </h2>
            <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
              <div>Date: {scheduleDate}</div>
              <div>Time: {eventTime}</div>
              <div>Location: {eventLocation}</div>
            </div>
          </div>
        )}

        {/* Date Warning */}
        {showDateWarning && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-3 py-2 rounded mb-4 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <p className="text-sm">Warning: Selected event date is not today. Double-check before proceeding.</p>
          </div>
        )}

        {/* Tabs - Improved styling */}
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ticket">{t('byTicketCode')}</TabsTrigger>
            <TabsTrigger value="seat">{t('bySeat')}</TabsTrigger>
            <TabsTrigger value="email">{t('byEmail')}</TabsTrigger>
            <TabsTrigger value="phone">{t('byPhone')}</TabsTrigger>
          </TabsList>
          <TabsContent value="ticket">
            <div className="mt-4">
              <input
                ref={ticketInputRef}
                type="text"
                value={ticketCode}
                onChange={e => setTicketCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleValidate()}
                placeholder={t('enterTicketCode')}
                className="w-full p-4 border border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-lg shadow-sm dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </TabsContent>
          <TabsContent value="seat">
            <div className="mt-4">
              <input
                ref={seatInputRef}
                type="text"
                value={seatNumber}
                onChange={e => setSeatNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleValidate()}
                placeholder={t('enterSeatNumber')}
                className="w-full p-4 border border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-lg shadow-sm dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </TabsContent>
          <TabsContent value="email">
            <div className="mt-4">
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleValidate()}
                placeholder={t('enterEmail')}
                className="w-full p-4 border border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-lg shadow-sm dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </TabsContent>
          <TabsContent value="phone">
            <div className="mt-4">
              <input
                ref={phoneInputRef}
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleValidate()}
                placeholder={t('enterPhone')}
                className="w-full p-4 border border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-lg shadow-sm dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 w-full">
          <button
            onClick={handleValidate}
            disabled={
              isLoading ||
              (activeTab === 'ticket' && !ticketCode.trim()) ||
              (activeTab === 'seat' && !seatNumber.trim()) ||
              (activeTab === 'email' && !email.trim()) ||
              (activeTab === 'phone' && !phoneNumber.trim()) ||
              !!validatedTicket ||
              multipleTickets.length > 0
            }
            className={`w-full py-4 rounded-lg font-bold text-white uppercase tracking-wider transition-all duration-300 ${
              isLoading ||
              (activeTab === 'ticket' && !ticketCode.trim()) ||
              (activeTab === 'seat' && !seatNumber.trim()) ||
              (activeTab === 'email' && !email.trim()) ||
              (activeTab === 'phone' && !phoneNumber.trim()) ||
              !!validatedTicket ||
              multipleTickets.length > 0
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
            }`}
          >
            {isLoading ? (
              <div className="flex justify-center items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{t('lookingUp')}</span>
              </div>
            ) : (
              t('lookUp')
            )}
          </button>
        </div>

        {(validatedTicket || multipleTickets.length > 0) && (
          <div className="mt-4 w-full text-center">
            <button
              onClick={resetValidation}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('clearAndStartNew')}
            </button>
          </div>
        )}

        {/* Results - Compact layout with prominent check-in button */}
        {validatedTicket && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-md">
            {/* Status and Check-in Button Row */}
            <div className="flex justify-between items-center mb-4">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  validatedTicket.isCheckedIn
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}
              >
                {validatedTicket.isCheckedIn ? 'Checked In' : 'Ready for Check-in'}
              </span>
              
              {!validatedTicket.isCheckedIn && (
                <button
                  onClick={() => handleCheckIn(validatedTicket)}
                  disabled={isCheckingIn}
                  className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors ${
                    isCheckingIn
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                  }`}
                >
                  {isCheckingIn ? 'Checking In...' : 'Check In'}
                </button>
              )}
            </div>

            {/* Visitor Information - Compact Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                {validatedTicket.attendeeName}
              </h3>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Seat:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-gray-200">
                    {validatedTicket.seat}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Ticket:</span>
                  <span className="ml-2 font-mono text-gray-900 dark:text-gray-200">
                    {validatedTicket.ticketCode}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-gray-200">
                    {validatedTicket.ticketPriceName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Order:</span>
                  <span className="ml-2 font-mono text-gray-900 dark:text-gray-200">
                    {validatedTicket.orderCode || 'N/A'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Email:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-gray-200 break-words">
                    {validatedTicket.email || 'N/A'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-gray-200">
                    {validatedTicket.phoneNumber || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Search Another Ticket Button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  setValidatedTicket(null);
                  setMultipleTickets([]);
                  setTicketCode('');
                  setSeatNumber('');
                  setEmail('');
                  setPhoneNumber('');
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Search Another Ticket
              </button>
            </div>
          </div>
        )}

        {/* Multiple Tickets */}
        {multipleTickets.length > 0 && (
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Multiple Visitors Found - Choose One to Check In
            </h3>
            <div className="space-y-4">
              {multipleTickets.map((ticket, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 mb-4 sm:mb-0">
                      <div className="flex items-center mb-2">
                        <p className="font-bold text-lg text-gray-900 dark:text-gray-100 mr-3">
                          {ticket.attendeeName}
                        </p>
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                            ticket.isCheckedIn
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                          }`}
                        >
                          {ticket.isCheckedIn ? 'Checked In' : 'Ready'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Seat:</span> {ticket.seat}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {ticket.ticketCode}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {!ticket.isCheckedIn && (
                        <button
                          onClick={() => handleCheckIn(ticket)}
                          disabled={isCheckingIn}
                          className={`w-full sm:w-auto px-5 py-2 rounded-md font-semibold text-white transition-colors ${
                            isCheckingIn
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                          }`}
                        >
                          {isCheckingIn ? 'Checking...' : 'Check In'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button
                onClick={resetValidation}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!validatedTicket && multipleTickets.length === 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Contact support if you are having trouble finding visitor tickets.
            </p>
          </div>
        )}

        {/* Checkin History */}
        <div className="mt-6">
          <CheckinHistory ref={historyRef} />
        </div>
      </div>
    </div>
    </>
  )
} 