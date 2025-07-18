'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/CheckIn/useAuth'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import Link from 'next/link'
import { CheckinNav } from '@/components/CheckinNav'
import { useTranslate } from '@/providers/I18n/client'
import { type TicketDTO } from '@/lib/checkin/findTickets'
import ScheduleStatsInfo from '@/components/ScheduleStatsInfo'
import { TicketCard } from '@/components/ui/TicketCard'
import {
  attemptAutoSelection,
  type EventWithSchedules
} from '@/lib/checkin/autoEventSelection'
import {
  getCachedEventSelection,
  setCachedEventSelection,
  clearExpiredCache
} from '@/lib/checkin/eventSelectionCache'
import { format } from 'date-fns'


interface FeedbackState {
  type: 'success' | 'error' | 'info'
  message: string
}

interface AutoSelectionState {
  isAutoSelected: boolean
  isLoading: boolean
  attempted: boolean
  error: string | null
}

const PaperPageClient = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { token } = useAuth()
  const { t } = useTranslate()
  const seatInputRef = useRef<HTMLInputElement>(null)

  // Get event and schedule from URL params
  const [currentEventId, setCurrentEventId] = useState<string | null>(
    searchParams.get('eventId') || searchParams.get('event')
  )
  const [currentScheduleId, setCurrentScheduleId] = useState<string | null>(
    searchParams.get('scheduleId') || searchParams.get('schedule')
  )

  // Auto-selection state
  const [autoSelection, setAutoSelection] = useState<AutoSelectionState>({
    isAutoSelected: false,
    isLoading: false,
    attempted: false,
    error: null
  })

  // State for paper check-in
  const [seatNumber, setSeatNumber] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [validatedTicket, setValidatedTicket] = useState<TicketDTO | null>(null)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [lastValidationTime, setLastValidationTime] = useState(0)

  // Auto-selection logic on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const performAutoSelection = async () => {
      // Clear any expired cache first
      clearExpiredCache()

      // Get initial values from URL params
      const urlEventId = searchParams.get('eventId') || searchParams.get('event')
      const urlScheduleId = searchParams.get('scheduleId') || searchParams.get('schedule')

      // If we already have event/schedule from URL params, use them
      if (urlEventId && urlScheduleId) {
        setCurrentEventId(urlEventId)
        setCurrentScheduleId(urlScheduleId)
        setAutoSelection(prev => ({ ...prev, attempted: true, isAutoSelected: false }))
        return
      }

      // Check if we have a valid cached selection
      const cachedSelection = getCachedEventSelection()
      if (cachedSelection) {
        setCurrentEventId(cachedSelection.eventId)
        setCurrentScheduleId(cachedSelection.scheduleId)
        setAutoSelection({
          isAutoSelected: cachedSelection.isAutoSelected,
          isLoading: false,
          attempted: true,
          error: null
        })
        return
      }

      // Attempt auto-selection
      setAutoSelection(prev => ({ ...prev, isLoading: true, attempted: false }))

      try {
        // Fetch events for auto-selection
        const response = await fetch('/api/checkin-app/events')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }

        const data = await response.json()
        const events: EventWithSchedules[] = data.events?.docs || []

        const autoSelectionResult = await attemptAutoSelection(events)

        if (autoSelectionResult.success && autoSelectionResult.eventId && autoSelectionResult.scheduleId) {
          // Auto-selection successful
          setCurrentEventId(autoSelectionResult.eventId)
          setCurrentScheduleId(autoSelectionResult.scheduleId)

          // Cache the selection
          setCachedEventSelection(
            autoSelectionResult.eventId,
            autoSelectionResult.scheduleId,
            true, // isAutoSelected
            {
              title: autoSelectionResult.event?.title,
              location: autoSelectionResult.event?.eventLocation,
              scheduleDate: autoSelectionResult.schedule?.date ? format(new Date(autoSelectionResult.schedule.date), 'dd-MM-yyyy') : undefined,
              scheduleTime: autoSelectionResult.schedule?.details?.[0]?.time
            }
          )

          setAutoSelection({
            isAutoSelected: true,
            isLoading: false,
            attempted: true,
            error: null
          })
        } else {
          // Auto-selection failed - redirect to manual selection
          setAutoSelection({
            isAutoSelected: false,
            isLoading: false,
            attempted: true,
            error: autoSelectionResult.reason || 'unknown'
          })

          const reason = autoSelectionResult.reason || 'unknown'
          router.push(`/checkin/events?mode=paper&reason=${reason}`)
        }
      } catch (error) {
        console.error('Auto-selection failed:', error)
        setAutoSelection({
          isAutoSelected: false,
          isLoading: false,
          attempted: true,
          error: 'fetch_error'
        })

        // Redirect to manual selection
        router.push('/checkin/events?mode=paper&reason=fetch_error')
      }
    }

    performAutoSelection()
  }, [router, searchParams])

  // Fetch stats on mount only (no auto-polling for performance)
  useEffect(() => {
    async function fetchStats() {
      if (!currentEventId || !currentScheduleId) return
      try {
        await fetch(`/api/checkin-app/event-stats?eventId=${currentEventId}&scheduleId=${currentScheduleId}`)
      } catch (_) { }
    }
    fetchStats()
  }, [currentEventId, currentScheduleId])

  // Handle seat number input
  const handleSeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeatNumber(e.target.value)
    setError('')
    setValidatedTicket(null)
    setFeedback(null)
  }

  // Validate seat number with throttling
  const validateSeat = useCallback(async () => {
    if (!seatNumber.trim() || !currentEventId || !currentScheduleId) {
      setError(t('checkin.paper.seatValidationError'))
      return
    }
    // Remove client-side token check
    // Implement 2-second throttle
    const now = Date.now()
    if (now - lastValidationTime < 2000) {
      return
    }
    setLastValidationTime(now)
    setIsValidating(true)
    setError('')
    setFeedback(null)
    try {
      const response = await fetch('/api/checkin-app/validate-seat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `JWT ${token}` } : {}),
        },
        body: JSON.stringify({
          seatNumber: seatNumber.trim(),
          eventId: currentEventId,
          scheduleId: currentScheduleId,
        }),
      })
      if (response.status === 401) {
        setError(t('checkin.paper.authenticationRequired'))
        return
      }
      const data = await response.json()
      if (response.ok && data.tickets && data.tickets.length > 0) {
        const ticket = data.tickets[0]
        setValidatedTicket(ticket)
        // Show info if already checked in
        if (ticket.isCheckedIn) {
          setFeedback({
            type: 'info',
            message: `${t('checkin.paper.alreadyCheckedInStatus')}${ticket.checkinRecord?.checkInTime ? ` at ${new Date(ticket.checkinRecord.checkInTime).toLocaleString()}` : ''}${ticket.checkinRecord?.checkedInBy?.email ? ` by ${ticket.checkinRecord.checkedInBy.email}` : ''}`
          })
        }
      } else {
        setError(data.error || data.message || t('checkin.paper.seatNotFound'))
      }
    } catch (_) {
      setError(t('checkin.paper.connectionFailed'))
    } finally {
      setIsValidating(false)
    }
  }, [seatNumber, currentEventId, currentScheduleId, lastValidationTime, token, t])

  // Handle check-in
  const handleCheckIn = async () => {
    if (!validatedTicket) return
    // Remove client-side token check
    setIsCheckingIn(true)
    setError('')
    setFeedback(null)
    try {
      const response = await fetch(`/api/checkin-app/checkin/${validatedTicket.ticketCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `JWT ${token}` } : {}),
        },
        body: JSON.stringify({
          manual: true,
          checkinMethod: 'paper',
        }),
      })
      if (response.status === 401) {
        setError(t('checkin.paper.authenticationRequired'))
        return
      }
      const data = await response.json()
      if (response.ok) {
        if (data.alreadyCheckedIn) {
          // Handle already checked in case
          setFeedback({
            type: 'info',
            message: t('checkin.paper.alreadyCheckedInStatus')
          })
        } else {
          // Successful check-in
          setFeedback({
            type: 'success',
            message: `Checked in: ${validatedTicket.attendeeName} | Seat: ${validatedTicket.seat} | Code: ${validatedTicket.ticketCode}`
          })
        }
        // Reset form and auto-focus for next entry
        setSeatNumber('')
        setValidatedTicket(null)
        setError('')
        // Auto-focus seat input for next entry
        setTimeout(() => {
          seatInputRef.current?.focus()
        }, 100)
      } else {
        setError(data.message || t('checkin.paper.checkInFailed'))
      }
    } catch (_) {
      setError(t('checkin.paper.connectionFailed'))
    } finally {
      setIsCheckingIn(false)
    }
  }

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && seatNumber.trim() && !isValidating) {
      validateSeat()
    }
  }

  // Check if event/schedule context is missing
  const missingContext = !currentEventId || !currentScheduleId

  // Auto-focus on mount
  useEffect(() => {
    if (seatInputRef.current && !missingContext) {
      seatInputRef.current.focus()
    }
  }, [missingContext])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <CheckinNav />
        <div className="max-w-2xl mx-auto py-8 px-2 sm:px-0">
          {/* Event info and stats */}
          <ScheduleStatsInfo eventId={currentEventId} scheduleId={currentScheduleId} />

          {/* Auto-selection indicator */}
          {autoSelection.isAutoSelected && !missingContext && (
            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Auto-selected for today
                </span>
              </div>
            </div>
          )}

          {/* Loading indicator during auto-selection */}
          {autoSelection.isLoading && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-center">
                <svg className="animate-spin w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Finding today&apos;s event...
                </span>
              </div>
            </div>
          )}

          <div className="text-right mb-4">
            <Link href="/checkin/events?mode=paper" className="text-sm text-indigo-700 hover:underline">{t('checkin.paper.changeEvent') || 'Change event'}</Link>
          </div>
          {/* Paper Check-in Content (seat input, feedback, VisitorInfoCard, etc.) */}
          <Tabs value="paper" className="w-full">
            <TabsContent value="paper" className="mt-6" role="tabpanel" aria-labelledby="paper-tab">
              <div className="space-y-6">
                {/* Event/Schedule Context Required */}
                {missingContext && (
                  <div
                    className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-6 shadow-sm"
                    role="alert"
                    aria-live="polite"
                  >
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                          {t('checkin.paper.eventSelectionRequired')}
                        </h3>
                        <p className="text-amber-700 dark:text-amber-300 mb-4">
                          {t('checkin.paper.selectEventMessage')}
                        </p>
                        <Link
                          href="/checkin/events?mode=paper"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                          aria-label="Navigate to event selection page for paper check-in"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {t('checkin.paper.selectEvent')}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seat Input Form */}
                {!missingContext && (
                  <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="mb-6">
                      <label
                        htmlFor="seat-input"
                        className="block text-lg font-semibold text-gray-900 dark:text-white mb-3"
                      >
                        {t('checkin.paper.seatNumberLabel')}
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {t('checkin.paper.seatNumberInstruction')}
                      </p>
                      <div className="relative">
                        <input
                          ref={seatInputRef}
                          id="seat-input"
                          type="text"
                          value={seatNumber}
                          onChange={handleSeatChange}
                          onKeyDown={handleKeyDown}
                          placeholder={t('checkin.paper.seatNumberPlaceholder')}
                          className="w-full px-4 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isValidating || isCheckingIn}
                          aria-describedby="seat-help"
                          autoComplete="off"
                          autoCapitalize="characters"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                          </svg>
                        </div>
                      </div>
                      <p id="seat-help" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {t('checkin.paper.seatNumberHelp')}
                      </p>
                    </div>

                    <button
                      onClick={validateSeat}
                      disabled={!seatNumber.trim() || isValidating}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 text-lg font-semibold bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none hover:transform hover:-translate-y-0.5 hover:shadow-lg"
                      aria-describedby={isValidating ? "validating-status" : undefined}
                    >
                      {isValidating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span id="validating-status">{t('checkin.paper.validating')}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('checkin.paper.validateSeat')}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Feedback Display */}
                {feedback && (
                  <div
                    className={`border-2 rounded-xl p-6 shadow-lg transition-all duration-300 ${feedback.type === 'success'
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700'
                      : feedback.type === 'error'
                        ? 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700'
                      }`}
                    role="alert"
                    aria-live="polite"
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 mr-4 ${feedback.type === 'success' ? 'text-green-600 dark:text-green-400' :
                        feedback.type === 'error' ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`}>
                        {feedback.type === 'success' ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : feedback.type === 'error' ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className={`text-lg font-medium ${feedback.type === 'success' ? 'text-green-800 dark:text-green-200' :
                        feedback.type === 'error' ? 'text-red-800 dark:text-red-200' :
                          'text-blue-800 dark:text-blue-200'
                        }`}>
                        {feedback.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div
                    className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-700 rounded-xl p-6 shadow-lg"
                    role="alert"
                    aria-live="assertive"
                  >
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 mr-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-lg font-medium text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  </div>
                )}

                {/* Ticket Confirmation (reuse VisitorInfoCard) */}
                {validatedTicket && !missingContext && (
                  <div className="border-t-4 border-indigo-700 mt-8 pt-6">
                    <TicketCard
                      ticket={validatedTicket}
                      onCheckIn={handleCheckIn}
                      isCheckingIn={isCheckingIn}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default PaperPageClient