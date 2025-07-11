'use client'

import React, { useState, useCallback } from 'react'
import { QRScanner } from '@/components/QRScanner'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface ValidateResponse {
  status: number
  ticket?: {
    attendeeName?: string
    seat?: string
  }
  errorCode?: string
  checkedInAt?: string
}

export const ScanPageClient: React.FC = () => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  const validateAndCheckIn = useCallback(async (ticketCode: string) => {
    try {
      const validateRes = await fetch(`/api/checkin-app/validate/${ticketCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // For seat-based scans we may need event info – not implemented yet
      })
      if (validateRes.status !== 200) {
        const data = (await validateRes.json()) as { errorCode?: string; message?: string }
        setFeedback({
          type: 'error',
          message: data.message || data.errorCode || `Validation failed (${validateRes.status})`,
        })
        return
      }

      const checkinRes = await fetch(`/api/checkin-app/checkin/${ticketCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventDate: null }),
      })
      if (checkinRes.status === 200) {
        setFeedback({ type: 'success', message: 'Checked in' })
      } else {
        let msg = 'Check-in failed'
        try {
          const data = (await checkinRes.json()) as { errorCode?: string; message?: string }
          msg = data.message || data.errorCode || msg
        } catch {}
        setFeedback({ type: 'error', message: msg })
      }
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', message: 'Network error' })
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-black">
      <QRScanner onScan={validateAndCheckIn} className="absolute inset-0" />

      {/* Feedback overlay */}
      {feedback && (
        <div
          className={`absolute inset-0 flex items-center justify-center text-white text-4xl font-bold transition-opacity duration-200 ${
            feedback.type === 'success' ? 'bg-emerald-600/80' : 'bg-red-600/80'
          }`}
          onAnimationEnd={() => setFeedback(null)}
        >
          {feedback.message}
        </div>
      )}

      {/* Manual entry fallback */}
      <div className="absolute bottom-4 w-full flex justify-center">
        <Link
          href="/checkin/validates"
          className="inline-flex items-center gap-1 bg-white/80 backdrop-blur px-4 py-2 rounded text-sm font-medium"
        >
          <MapPin className="w-4 h-4" /> Manual Entry
        </Link>
      </div>
    </div>
  )
} 