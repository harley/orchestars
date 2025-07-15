'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/providers/CheckIn/useAuth'
import { toast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { useTranslate } from '@/providers/I18n/client'
import { type TicketDTO } from '@/lib/checkin/findTickets'



interface FeedbackState {
  type: 'success' | 'error' | 'info'
  message: string
}

const PaperPageClient = () => {
  const searchParams = useSearchParams()
  const { token } = useAuth()
  const { t } = useTranslate()
  const seatInputRef = useRef<HTMLInputElement>(null)
  
  // Get event and schedule from URL params
  const eventId = searchParams.get('eventId') || searchParams.get('event')
  const scheduleId = searchParams.get('scheduleId') || searchParams.get('schedule')
  
  // State for paper check-in
  const [seatNumber, setSeatNumber] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [validatedTicket, setValidatedTicket] = useState<TicketDTO | null>(null)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [lastValidationTime, setLastValidationTime] = useState(0)

  // Handle seat number input
  const handleSeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeatNumber(e.target.value)
    setError('')
    setValidatedTicket(null)
    setFeedback(null)
  }

  // Validate seat number with throttling
  const validateSeat = useCallback(async () => {
    if (!seatNumber.trim() || !eventId || !scheduleId) {
      setError('Please enter a seat number and ensure event/schedule is selected')
      return
    }
    
    if (!token) {
      setError('Authentication required. Please refresh the page.')
      return
    }
    
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
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
          seatNumber: seatNumber.trim(),
          eventId,
          scheduleId,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok && data.tickets && data.tickets.length > 0) {
        const ticket = data.tickets[0]
        setValidatedTicket(ticket)
        
        // Show info if already checked in
        if (ticket.isCheckedIn) {
          setFeedback({
            type: 'info',
            message: `This ticket was already checked in${ticket.checkinRecord?.checkInTime ? ` at ${new Date(ticket.checkinRecord.checkInTime).toLocaleString()}` : ''}${ticket.checkinRecord?.checkedInBy?.email ? ` by ${ticket.checkinRecord.checkedInBy.email}` : ''}`
          })
        }
      } else {
        setError(data.error || data.message || 'Seat not found for this event')
      }
    } catch (_) {
      setError('Connection failed. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }, [seatNumber, eventId, scheduleId, lastValidationTime, token])

  // Handle check-in
  const handleCheckIn = async () => {
    if (!validatedTicket) return
    
    if (!token) {
      setError('Authentication required. Please refresh the page.')
      return
    }
    
    setIsCheckingIn(true)
    setError('')
    setFeedback(null)
    
    try {
      const response = await fetch(`/api/checkin-app/checkin/${validatedTicket.ticketCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
          manual: true,
          checkinMethod: 'paper',
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        if (data.alreadyCheckedIn) {
          // Handle already checked in case
          setFeedback({
            type: 'info',
            message: 'This ticket was already checked in'
          })
        } else {
          // Successful check-in
          setFeedback({
            type: 'success',
            message: `${validatedTicket.attendeeName} has been checked in successfully`
          })
          
          toast({
            title: 'Check-in successful',
            description: `${validatedTicket.attendeeName} has been checked in`,
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
        setError(data.message || 'Check-in failed')
      }
    } catch (_) {
      setError('Connection failed. Please try again.')
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
  const missingContext = !eventId || !scheduleId

  // Auto-focus on mount
  useEffect(() => {
    if (seatInputRef.current && !missingContext) {
      seatInputRef.current.focus()
    }
  }, [missingContext])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">
            {t('Paper Check-in')}
          </h1>
          
          {/* Navigation Tabs */}
          <Tabs value="paper" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scan" asChild>
                <Link href="/checkin/scan">
                  {t('QR Scan')}
                </Link>
              </TabsTrigger>
              <TabsTrigger value="search" asChild>
                <Link href="/checkin/validates">
                  {t('Search')}
                </Link>
              </TabsTrigger>
              <TabsTrigger value="paper">
                {t('Paper')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="paper" className="mt-6">
              <div className="space-y-6">
                {/* Event/Schedule Context Required */}
                {missingContext && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-800 mb-3">
                      {t('Please select an event and schedule first')}
                    </p>
                    <Link 
                      href="/checkin/events?mode=paper"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {t('Select Event')}
                    </Link>
                  </div>
                )}

                {/* Seat Input Form */}
                {!missingContext && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <label htmlFor="seat" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Seat Number')}
                    </label>
                    <input
                      ref={seatInputRef}
                      id="seat"
                      type="text"
                      value={seatNumber}
                      onChange={handleSeatChange}
                      onKeyDown={handleKeyDown}
                      placeholder={t('Enter seat number')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isValidating || isCheckingIn}
                    />
                    
                    <button
                      onClick={validateSeat}
                      disabled={!seatNumber.trim() || isValidating}
                      className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isValidating ? t('Validating...') : t('Validate Seat')}
                    </button>
                  </div>
                )}
                
                {/* Feedback Display */}
                {feedback && (
                  <div className={`border rounded-md p-4 ${
                    feedback.type === 'success' ? 'bg-green-50 border-green-200' :
                    feedback.type === 'error' ? 'bg-red-50 border-red-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <p className={
                      feedback.type === 'success' ? 'text-green-800' :
                      feedback.type === 'error' ? 'text-red-800' :
                      'text-blue-800'
                    }>
                      {feedback.message}
                    </p>
                  </div>
                )}
                
                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}
                
                {/* Ticket Confirmation */}
                {validatedTicket && !missingContext && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">{t('Confirm Check-in')}</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>{t('Name')}:</strong> {validatedTicket.attendeeName}</p>
                      <p><strong>{t('Seat')}:</strong> {validatedTicket.seat}</p>
                      <p><strong>{t('Ticket Code')}:</strong> {validatedTicket.ticketCode}</p>
                      {validatedTicket.ticketPriceName && (
                        <p><strong>{t('Ticket Class')}:</strong> {validatedTicket.ticketPriceName}</p>
                      )}
                      {validatedTicket.email && (
                        <p><strong>{t('Email')}:</strong> {validatedTicket.email}</p>
                      )}
                    </div>
                    
                    {validatedTicket.isCheckedIn ? (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-800 text-sm">
                          {t('This ticket is already checked in')}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleCheckIn}
                        disabled={isCheckingIn}
                        className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCheckingIn ? t('Checking in...') : t('Check In')}
                      </button>
                    )}
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