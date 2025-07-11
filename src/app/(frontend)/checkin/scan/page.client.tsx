'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { QRScanner } from '@/components/QRScanner'
import { MapPin } from 'lucide-react'
import Link from 'next/link'

export const ScanPageClient: React.FC = () => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )
  const [isProcessing, setIsProcessing] = useState(false)

  const validateAndCheckIn = useCallback(async (ticketCode: string) => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      // 1. Validate Ticket
      const validateRes = await fetch(`/api/checkin-app/validate/${ticketCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (validateRes.status !== 200) {
        const data = (await validateRes.json()) as { errorCode?: string; message?: string }
        setFeedback({
          type: 'error',
          message: data.message || data.errorCode || `Validation failed (${validateRes.status})`,
        })
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
        return
      }

      // 2. Perform Check-in
      const checkinRes = await fetch(`/api/checkin-app/checkin/${ticketCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventDate: null }), // Assuming eventDate is not strictly needed for QR checkin
      })

      if (checkinRes.status === 200) {
        setFeedback({ type: 'success', message: 'Checked In' })
        if (window.navigator.vibrate) window.navigator.vibrate(200)
      } else {
        let msg = 'Check-in failed'
        try {
          const data = (await checkinRes.json()) as { errorCode?: string; message?: string }
          msg = data.message || data.errorCode || msg
        } catch {}
        setFeedback({ type: 'error', message: msg })
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
      }
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', message: 'Network error' })
      if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
    }
  }, [isProcessing])

  // Auto-clear feedback overlay and re-enable scanning
  useEffect(() => {
    if (feedback) {
      const id = setTimeout(() => {
        setFeedback(null)
        setIsProcessing(false)
      }, 1500) // Show feedback for 1.5s
      return () => clearTimeout(id)
    }
  }, [feedback])

  return (
    <div className="relative min-h-screen bg-black">
      <QRScanner
        onScan={validateAndCheckIn}
        paused={isProcessing || !!feedback}
        className="absolute inset-0"
      />

      {/* Feedback overlay */}
      {feedback && (
        <div
          className={`absolute inset-0 flex items-center justify-center p-4 text-center text-white text-4xl font-bold transition-opacity duration-200 ${
            feedback.type === 'success' ? 'bg-emerald-600/90' : 'bg-red-600/90'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Manual entry fallback */}
      <div className="absolute bottom-4 w-full flex justify-center">
        <Link
          href="/checkin/validates"
          className="inline-flex items-center gap-1 bg-white/80 backdrop-blur px-4 py-2 rounded text-sm font-medium text-black"
        >
          <MapPin className="w-4 h-4" /> Manual Entry
        </Link>
      </div>
    </div>
  )
} 