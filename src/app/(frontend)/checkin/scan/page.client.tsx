'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { QRScanner } from '@/components/QRScanner'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ErrorBoundary from './ErrorBoundary'

interface _ValidateResponse {
  status: number
  ticket?: {
    attendeeName?: string
    seat?: string
  }
  errorCode?: string
  checkedInAt?: string
}

// Lazy load the history component
const HistorySection = dynamic(() => import('./HistorySection'), {
  ssr: false,
  loading: () => (
    <div className="mt-6 w-full max-w-md">
      <h2 className="text-lg font-semibold mb-2">Recent Check-ins</h2>
      <div className="animate-pulse space-y-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/10 px-3 py-2 rounded h-10" />
        ))}
      </div>
    </div>
  ),
})

export const ScanPageClient: React.FC = () => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  const [history, setHistory] = useState<{ code: string; status: 'success' | 'error'; time: Date }[]>(
    [],
  )

  const [cameraReady, setCameraReady] = useState(false)

  // Preload camera permissions and resources
  useEffect(() => {
    const preloadCamera = async () => {
      try {
        // Request camera permission early
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          })
          // Stop the stream immediately, we just wanted to get permission
          stream.getTracks().forEach(track => track.stop())
          setCameraReady(true)
        }
      } catch (error) {
        console.log('Camera permission not granted or not available:', error)
        // Don't block the UI, scanner will handle this gracefully
        setCameraReady(true)
      }
    }

    preloadCamera()
  }, [])

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
        setHistory((h) => [{ code: ticketCode, status: 'error' as const, time: new Date() }, ...h].slice(0, 10))
        return
      }

      const checkinRes = await fetch(`/api/checkin-app/checkin/${ticketCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventDate: null }),
      })
      if (checkinRes.status === 200) {
        setFeedback({ type: 'success', message: 'Checked in' })
        setHistory((h) => [{ code: ticketCode, status: 'success' as const, time: new Date() }, ...h].slice(0, 10))
      } else {
        let msg = 'Check-in failed'
        try {
          const data = (await checkinRes.json()) as { errorCode?: string; message?: string }
          msg = data.message || data.errorCode || msg
        } catch {}
        setFeedback({ type: 'error', message: msg })
        setHistory((h) => [{ code: ticketCode, status: 'error' as const, time: new Date() }, ...h].slice(0, 10))
      }
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', message: 'Network error' })
      setHistory((h) => [{ code: ticketCode, status: 'error' as const, time: new Date() }, ...h].slice(0, 10))
    }
  }, [])

  // Auto-clear feedback overlay after 1.5s
  useEffect(() => {
    if (feedback) {
      const id = setTimeout(() => setFeedback(null), 1500)
      return () => clearTimeout(id)
    }
  }, [feedback])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-6">
      {/* Scanner box */}
      <div className="relative w-64 h-64 rounded overflow-hidden border-2 border-white">
        {cameraReady ? (
          <QRScanner onScan={validateAndCheckIn} paused={!!feedback} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

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

      {/* Lazy-loaded History with Error Boundary */}
      <ErrorBoundary>
        <HistorySection history={history} setHistory={setHistory} />
      </ErrorBoundary>

      {/* Manual entry fallback */}
      <div className="mt-auto pt-6">
        <Link
          href="/checkin/validates"
          className="inline-flex items-center gap-1 bg-white/80 text-black px-4 py-2 rounded text-sm font-medium"
        >
          <MapPin className="w-4 h-4" /> Manual Entry
        </Link>
      </div>
    </div>
  )
} 