'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { QRScanner } from '@/components/QRScanner'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
interface _ValidateResponse {
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

  const [history, setHistory] = useState<{ code: string; status: 'success' | 'error'; time: Date }[]>(
    [],
  )

  // Fetch initial recent check-ins
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/checkin-app/history-checkin-record')
        if (res.ok) {
          const data = (await res.json()) as { docs: { ticketCode: string; createdAt: string }[] }
          setHistory(
            data.docs.slice(0, 20).map((d) => ({
              code: d.ticketCode,
              status: 'success' as const,
              time: new Date(d.createdAt),
            })),
          )
        }
      } catch (err) {
        console.error('Fetch history error', err)
      }
    })()
  }, [])

  const timeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const sec = Math.floor(diff / 1000)
    if (sec < 60) return `${sec}s ago`
    const min = Math.floor(sec / 60)
    if (min < 60) return `${min}m ago`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr}h ago`
    const d = Math.floor(hr / 24)
    return `${d}d ago`
  }

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
        <QRScanner onScan={validateAndCheckIn} paused={!!feedback} className="w-full h-full" />
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

      {/* History */}
      <div className="mt-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Recent Check-ins</h2>
        <ul className="space-y-1 text-sm">
          {history.length === 0 && <li className="text-gray-400">No scans yet</li>}
          {history.map((h, idx) => (
            <li key={idx} className="flex justify-between bg-white/10 px-3 py-2 rounded">
              <span>{h.code}</span>
              <span className="flex gap-2 items-center">
                <span className={h.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                  {h.status}
                </span>
                <span className="text-gray-400 text-xs">{timeAgo(h.time)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

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