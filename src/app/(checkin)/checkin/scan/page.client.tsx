'use client'

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { QRScanner } from '@/components/QRScanner'
import { History, ChevronDown, Upload } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { CheckinRecord, User } from '@/payload-types'
import jsQR from 'jsqr'

const ScanHistory = forwardRef((props: {}, ref) => {
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
      console.error('Failed to fetch scan history:', err)
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
        <div className="w-full bg-white/90 p-4 rounded-t overflow-y-auto max-h-48 text-black mb-2">
          {isLoading && <p>Loading history...</p>}
          {!isLoading && history.length === 0 && <p>No recent scans.</p>}
          <ul className="space-y-2">
            {history.map(record => (
              <li key={record.id} className="text-sm text-gray-800 border-b pb-1">
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
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        className="inline-flex items-center justify-center w-full gap-1 bg-white/10 backdrop-blur px-4 py-3 rounded text-sm font-medium text-white"
      >
        <History className="w-5 h-5" />
        <span>Scan History</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  )
})
ScanHistory.displayName = 'ScanHistory'

export const ScanPageClient: React.FC = () => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const pathname = usePathname()
  const historyRef = useRef<{ fetchHistory: () => void }>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || isProcessing) return

    setIsProcessing(true)

    try {
      const imageUrl = URL.createObjectURL(file)
      const image = new Image()
      image.src = imageUrl

      image.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setFeedback({ type: 'error', message: 'Canvas not supported' })
          return
        }

        canvas.width = image.width
        canvas.height = image.height
        ctx.drawImage(image, 0, 0, image.width, image.height)

        const imageData = ctx.getImageData(0, 0, image.width, image.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          validateAndCheckIn(code.data)
        } else {
          setFeedback({ type: 'error', message: 'No QR code found.' })
          if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
        }

        URL.revokeObjectURL(imageUrl)
      }

      image.onerror = () => {
        setFeedback({ type: 'error', message: 'Failed to load image.' })
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
        URL.revokeObjectURL(imageUrl)
      }
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', message: 'Error processing image.' })
      if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
    }

    if (event.target) {
      event.target.value = ''
    }
  }

  const validateAndCheckIn = useCallback(async (ticketCode: string) => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      // 1. Validate Ticket
      const validateRes = await fetch(`/api/checkin-app/validate/${ticketCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
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
        historyRef.current?.fetchHistory();
      } else {
        let msg = 'Check-in failed'
        try {
          const data = (await checkinRes.json()) as { errorCode?: string; message?: string }
          msg = data.message || data.errorCode || msg
        } catch (e) {
          console.error('Failed to parse check-in error response:', e)
        }
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Navigation Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6 w-full">
          <Link
            href="/checkin/scan"
            className={`text-center py-2 px-4 rounded font-semibold ${
              pathname === '/checkin/scan'
                ? 'bg-white text-gray-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Checkin via QR
          </Link>
          <Link
            href="/checkin/events"
            className={`text-center py-2 px-4 rounded font-semibold ${
              pathname === '/checkin/events'
                ? 'bg-white text-gray-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Checkin via Search
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">Scan QR Code</h1>
        <p className="text-gray-400 mb-6">Position the code within the frame</p>
        <div className="w-full relative aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-700">
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
        </div>

        {/* Removed flashlight toggle as it's not needed */}

        <div className="w-full mt-6 space-y-3">
          {/* Extra actions */}
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isProcessing}
              className="inline-flex items-center justify-center w-full gap-2 bg-gray-700 px-4 py-3 rounded text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              <span>Upload QR</span>
            </button>
          </div>
          <ScanHistory ref={historyRef} />
        </div>
      </div>
    </div>
  )
} 