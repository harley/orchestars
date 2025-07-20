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
import { History, ChevronDown, Upload, X } from 'lucide-react'
import type { CheckinRecord, User } from '@/payload-types'
import jsQR from 'jsqr'
import { useTranslate } from '@/providers/I18n/client'
import { getTicketClassColor } from '@/utilities/getTicketClassColor'
import { CheckinNav } from '@/components/CheckinNav'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  attemptAutoSelection,
  type EventWithSchedules
} from '@/lib/checkin/autoEventSelection'
import {
  getCachedEventSelection,
  setCachedEventSelection,
  clearExpiredCache
} from '@/lib/checkin/eventSelectionCache'
import ScheduleStatsInfo from '@/components/ScheduleStatsInfo'

const ScanHistory = forwardRef((props: {}, ref) => {
  const [history, setHistory] = useState<CheckinRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const hasFetched = useRef(false)
  const { t } = useTranslate()

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
        <div className="w-full bg-white/90 p-4 rounded-t overflow-y-auto max-h-48 text-black mb-2 relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close history"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
          {isLoading && <p>{t('checkin.scan.loadingHistory')}</p>}
          {!isLoading && history.length === 0 && <p>{t('checkin.scan.noRecentScans')}</p>}
          <ul className="space-y-3 pr-8">
            {history.map(record => {
              const attendeeName = `${(record.user as User)?.firstName || ''} ${(record.user as User)?.lastName || ''}`.trim() || 'N/A'
              const ticketType = (record.ticket as any)?.ticketPriceName || (record.ticket as any)?.ticketPriceInfo?.name || 'N/A'
              const ticketPriceInfo = (record.ticket as any)?.ticketPriceInfo
              const ticketColors = getTicketClassColor(ticketPriceInfo)

              // Determine checkin method based on the manual field
              // Future: Add support for 'printed' method
              const checkinMethod = (record as any).manual ? 'Manual' : 'QR'

              // Memoize style object to prevent unnecessary re-renders
              const ticketStyle = {
                backgroundColor: ticketColors.color,
                color: ticketColors.textColor,
              }

              return (
                <li key={record.id} className="text-sm text-gray-800 border-b pb-2">
                  <div className="flex justify-between items-center font-medium mb-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {record.seat}
                      </span>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={ticketStyle}
                      >
                        {ticketType}
                      </span>
                    </div>
                    <span>{attendeeName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>{record.ticketCode} <span className="text-blue-600 font-medium">[{checkinMethod}]</span></span>
                    <span>
                      {record.checkInTime
                        ? new Date(record.checkInTime).toLocaleTimeString()
                        : 'N/A'}
                    </span>
                  </div>
                </li>
              )
            })}
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
        className="inline-flex items-center justify-center w-full gap-1 bg-white/10 backdrop-blur px-4 py-3 rounded text-sm font-medium text-white"
      >
        <History className="w-5 h-5" />
        <span>{isOpen ? t('checkin.scan.refreshHistory') : t('checkin.scan.history')}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  )
})
ScanHistory.displayName = 'ScanHistory'

interface AutoSelectionState {
  isAutoSelected: boolean
  isLoading: boolean
  attempted: boolean
  error: string | null
  eventInfo?: {
    title: string
    location?: string
    scheduleDate?: string
  }
}

export const ScanPageClient: React.FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useTranslate()

  const [feedback, setFeedback] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(
    null,
  )
  const [persistentError, setPersistentError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastScannedTicket, setLastScannedTicket] = useState<{
    seat: string
    ticketPriceName: string | null
    attendeeName: string
    ticketCode: string
    ticketPriceInfo: any
  } | null>(null)

  // Selected event and schedule for ScheduleStatsInfo
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

  const historyRef = useRef<{ fetchHistory: () => void }>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Client-side caching and debouncing for better performance
  const lastScanTimeRef = useRef<number>(0)
  const lastScanCodeRef = useRef<string>('')
  const scanCacheRef = useRef<Map<string, { result: any; timestamp: number }>>(new Map())
  const SCAN_DEBOUNCE_MS = 2000 // Prevent duplicate scans within 2 seconds
  const CACHE_DURATION_MS = 30000 // Cache results for 30 seconds

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
        // Validate cached schedule date
        let validCachedDate: string | null = null
        if (cachedSelection.scheduleDate) {
          try {
            const testDate = new Date(cachedSelection.scheduleDate)
            if (!isNaN(testDate.getTime())) {
              validCachedDate = cachedSelection.scheduleDate
            }
          } catch (_error) {
            console.warn('Invalid cached schedule date:', cachedSelection.scheduleDate)
          }
        }

        setCurrentEventId(cachedSelection.eventId)
        setCurrentScheduleId(cachedSelection.scheduleId)
        setAutoSelection({
          isAutoSelected: cachedSelection.isAutoSelected,
          isLoading: false,
          attempted: true,
          error: null,
          eventInfo: {
            title: cachedSelection.eventTitle || 'Event',
            location: cachedSelection.eventLocation,
            scheduleDate: validCachedDate || undefined
          }
        })
        return
      }

      // No cached selection or URL params - attempt auto-selection
      setAutoSelection(prev => ({ ...prev, isLoading: true }))

      try {
        // Fetch events
        const eventsRes = await fetch('/api/checkin-app/events')
        if (!eventsRes.ok) {
          throw new Error('Failed to fetch events')
        }

        const eventsData = await eventsRes.json()
        const events: EventWithSchedules[] = eventsData.events || []

        // Attempt auto-selection
        const autoResult = await attemptAutoSelection(events)

        if (autoResult.success && autoResult.eventId && autoResult.scheduleId) {
          // Validate schedule date before using it
          let validScheduleDate: string | null = null
          if (autoResult.schedule?.date) {
            try {
              const testDate = new Date(autoResult.schedule.date)
              if (!isNaN(testDate.getTime())) {
                validScheduleDate = autoResult.schedule.date
              }
            } catch (_error) {
              console.warn('Invalid schedule date from auto-selection:', autoResult.schedule.date)
            }
          }

          // Cache the successful auto-selection
          setCachedEventSelection(
            autoResult.eventId,
            autoResult.scheduleId,
            true,
            {
              title: autoResult.event?.title || 'Event',
              location: autoResult.event?.eventLocation,
              scheduleDate: validScheduleDate || undefined
            }
          )

          setCurrentEventId(autoResult.eventId)
          setCurrentScheduleId(autoResult.scheduleId)
          setAutoSelection({
            isAutoSelected: true,
            isLoading: false,
            attempted: true,
            error: null,
            eventInfo: {
              title: autoResult.event?.title || 'Event',
              location: autoResult.event?.eventLocation,
              scheduleDate: validScheduleDate || undefined
            }
          })
        } else {
          // Auto-selection failed - redirect to manual selection
          setAutoSelection({
            isAutoSelected: false,
            isLoading: false,
            attempted: true,
            error: autoResult.reason || 'Auto-selection failed'
          })

          // Redirect to manual event selection
          const reason = autoResult.reason || 'unknown'
          router.push(`/checkin/events?mode=scan&reason=${reason}`)
        }
      } catch (error) {
        console.error('Auto-selection error:', error)
        setAutoSelection({
          isAutoSelected: false,
          isLoading: false,
          attempted: true,
          error: 'Failed to load events'
        })
      }
    }

    performAutoSelection()
  }, [searchParams, router])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const processImageWithMultipleTechniques = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, originalWidth: number, originalHeight: number) => {
    const techniques = [
      // 1. Original image
      () => ctx.getImageData(0, 0, originalWidth, originalHeight),

      // 2. Increase contrast
      () => {
        const imageData = ctx.getImageData(0, 0, originalWidth, originalHeight)
        const data = imageData.data
        const contrast = 1.5
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))

        for (let i = 0; i < data.length; i += 4) {
          data[i] = factor * ((data[i] || 0) - 128) + 128     // Red
          data[i + 1] = factor * ((data[i + 1] || 0) - 128) + 128 // Green
          data[i + 2] = factor * ((data[i + 2] || 0) - 128) + 128 // Blue
        }
        return imageData
      },

      // 3. Convert to grayscale with high contrast
      () => {
        const imageData = ctx.getImageData(0, 0, originalWidth, originalHeight)
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
          const gray = Math.round(0.299 * (data[i] || 0) + 0.587 * (data[i + 1] || 0) + 0.114 * (data[i + 2] || 0))
          const enhanced = gray > 128 ? 255 : 0 // High contrast black/white
          data[i] = enhanced
          data[i + 1] = enhanced
          data[i + 2] = enhanced
        }
        return imageData
      },

      // 4. Adaptive threshold
      () => {
        const imageData = ctx.getImageData(0, 0, originalWidth, originalHeight)
        const data = imageData.data

        // Calculate average brightness
        let totalBrightness = 0
        for (let i = 0; i < data.length; i += 4) {
          totalBrightness += Math.round(0.299 * (data[i] || 0) + 0.587 * (data[i + 1] || 0) + 0.114 * (data[i + 2] || 0))
        }
        const avgBrightness = totalBrightness / (data.length / 4)
        const threshold = avgBrightness * 0.8 // Adaptive threshold

        for (let i = 0; i < data.length; i += 4) {
          const gray = Math.round(0.299 * (data[i] || 0) + 0.587 * (data[i + 1] || 0) + 0.114 * (data[i + 2] || 0))
          const enhanced = gray > threshold ? 255 : 0
          data[i] = enhanced
          data[i + 1] = enhanced
          data[i + 2] = enhanced
        }
        return imageData
      }
    ]

    // Try each technique
    for (let i = 0; i < techniques.length; i++) {
      try {
        const technique = techniques[i]
        if (!technique) continue
        const imageData = technique()
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        })

        if (code) {
          console.log(`QR code found using technique ${i + 1}`)
          return code
        }
      } catch (error) {
        console.warn(`Technique ${i + 1} failed:`, error)
      }
    }

    return null
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || isProcessing) return

    setIsProcessing(true)
    setFeedback({ type: 'warning', message: 'Processing image...' })

    try {
      const imageUrl = URL.createObjectURL(file)
      const image = new Image()
      image.src = imageUrl

      image.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setFeedback({ type: 'error', message: t('checkin.scan.error.canvasNotSupported') })
          setIsProcessing(false)
          return
        }

        // Scale image to reasonable size for processing (max 800px)
        const maxSize = 800
        let { width, height } = image

        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }

        canvas.width = width
        canvas.height = height

        // Draw image with good quality
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(image, 0, 0, width, height)

        // Try multiple processing techniques
        const code = processImageWithMultipleTechniques(canvas, ctx, width, height)

        if (code) {
          console.log('QR code detected:', code.data)
          validateAndCheckIn(code.data)
        } else {
          console.log('QR code not found in image')
          setFeedback({ type: 'error', message: t('checkin.scan.error.noQrFound') })
          if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
          setIsProcessing(false)
        }

        URL.revokeObjectURL(imageUrl)
      }

      image.onerror = () => {
        setFeedback({ type: 'error', message: t('checkin.scan.error.failedToLoadImage') })
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
        URL.revokeObjectURL(imageUrl)
        setIsProcessing(false)
      }
    } catch (err) {
      console.error('Image processing error:', err)
      setFeedback({ type: 'error', message: t('checkin.scan.error.processingImage') })
      if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
      setIsProcessing(false)
    }

    if (event.target) {
      event.target.value = ''
    }
  }

  const validateAndCheckIn = useCallback(async (ticketCode: string) => {
    if (isProcessing) return

    const now = Date.now()
    const normalizedCode = ticketCode.toUpperCase()

    // Client-side debouncing: prevent duplicate scans
    if (normalizedCode === lastScanCodeRef.current &&
        now - lastScanTimeRef.current < SCAN_DEBOUNCE_MS) {
      console.log('Scan debounced - duplicate within 2 seconds')
      return
    }

    // Check cache first for recent scans
    const cached = scanCacheRef.current.get(normalizedCode)
    if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
      console.log('Using cached scan result')
      const scanData = cached.result

      // Display cached result
      if (scanData.success) {
        const ticketInfo = scanData.ticket

        if (scanData.alreadyCheckedIn) {
          setFeedback({ type: 'warning', message: t('checkin.scan.alreadyCheckedIn') })
          if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200])
        } else {
          setLastScannedTicket({
            seat: ticketInfo.seat,
            ticketPriceName: ticketInfo.ticketPriceName,
            attendeeName: ticketInfo.attendeeName,
            ticketCode: normalizedCode,
            ticketPriceInfo: ticketInfo.ticketPriceInfo,
          })

          setFeedback({ type: 'success', message: t('checkin.scan.success') })
          if (window.navigator.vibrate) window.navigator.vibrate(200)
        }
      } else {
        const msg = scanData.message || t('checkin.scan.error.failed')
        // For persistent errors (wrong day/expired), show as banner; otherwise use overlay
        // Check for date-related error messages in both English and Vietnamese
        const isDateError = scanData.message && (
          scanData.message.includes('already passed') ||
          scanData.message.includes('different day') ||
          scanData.message.includes('today is') ||
          scanData.message.includes('đã kết thúc') ||
          scanData.message.includes('hôm nay là') ||
          scanData.message.includes('vào ngày')
        )

        if (isDateError) {
          setPersistentError(scanData.message)
          setFeedback(null) // Clear any overlay feedback
        } else {
          setFeedback({ type: 'error', message: msg })
          setPersistentError(null) // Clear persistent error for other errors
        }
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
      }
      return
    }

    // Update tracking variables
    lastScanTimeRef.current = now
    lastScanCodeRef.current = normalizedCode
    setIsProcessing(true)

    try {
      // Single optimized API call for validation + check-in
      // Include selected event/schedule for flexible validation
      const queryParams = new URLSearchParams({ ticketCode: normalizedCode })
      if (currentEventId) queryParams.append('eventId', currentEventId)
      if (currentScheduleId) queryParams.append('scheduleId', currentScheduleId)

      const scanRes = await fetch(`/api/checkin-app/scan?${queryParams.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const scanData = await scanRes.json()

      // Cache the result
      // Only cache 'Already Checked In' (warning) and error results
      if (scanRes.status !== 200 || (scanData.success && scanData.alreadyCheckedIn)) {
        scanCacheRef.current.set(normalizedCode, {
          result: scanData,
          timestamp: now
        })
      }

      // Clean old cache entries (keep cache size manageable)
      if (scanCacheRef.current.size > 50) {
        const entries = Array.from(scanCacheRef.current.entries())
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp)
        scanCacheRef.current.clear()
        entries.slice(0, 25).forEach(([key, value]) => {
          scanCacheRef.current.set(key, value)
        })
      }

      if (scanRes.status === 200 && scanData.success) {
        const ticketInfo = scanData.ticket

        // Check if ticket was already checked in
        if (scanData.alreadyCheckedIn) {
          setFeedback({ type: 'warning', message: t('checkin.scan.alreadyCheckedIn') })
          if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200])
        } else {
          // Store the ticket information for display
          setLastScannedTicket({
            seat: ticketInfo.seat,
            ticketPriceName: ticketInfo.ticketPriceName,
            attendeeName: ticketInfo.attendeeName,
            ticketCode: normalizedCode,
            ticketPriceInfo: ticketInfo.ticketPriceInfo,
          })

          setFeedback({ type: 'success', message: t('checkin.scan.success') })
          if (window.navigator.vibrate) window.navigator.vibrate(200)
        }
        // Removed: historyRef.current?.fetchHistory();
      } else {
        const msg = !scanRes.ok ? scanData.message || t('checkin.scan.error.failed') : t('checkin.scan.error.failed')
        // For persistent errors (wrong day/expired), show as banner; otherwise use overlay
        // Check for date-related error messages in both English and Vietnamese
        const isDateError = scanData.message && (
          scanData.message.includes('already passed') ||
          scanData.message.includes('different day') ||
          scanData.message.includes('today is') ||
          scanData.message.includes('đã kết thúc') ||
          scanData.message.includes('hôm nay là') ||
          scanData.message.includes('vào ngày')
        )

        if (isDateError) {
          setPersistentError(scanData.message)
          setFeedback(null) // Clear any overlay feedback
        } else {
          setFeedback({ type: 'error', message: msg })
          setPersistentError(null) // Clear persistent error for other errors
        }
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
      }
    } catch (error) {
      console.error('Check-in error:', error)
      setFeedback({ type: 'error', message: t('checkin.scan.error.network') })
      if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])

      // Remove failed cache entry
      scanCacheRef.current.delete(normalizedCode)
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, t, SCAN_DEBOUNCE_MS, CACHE_DURATION_MS, currentEventId, currentScheduleId])

  // Auto-clear feedback overlay and re-enable scanning
  useEffect(() => {
    if (feedback) {
      // Different timeout durations based on feedback type
      const timeout = feedback.type === 'warning' ? 2500 : 1500 // Warning: 2.5s, Success/Error: 1.5s
      const id = setTimeout(() => {
        setFeedback(null)
        setIsProcessing(false)
      }, timeout)
      return () => clearTimeout(id)
    }
  }, [feedback])

  // Keep the last scanned ticket visible (no auto-clear)

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Navigation Toggle */}
        <CheckinNav dark />
        <h1 className="text-2xl font-bold mb-2">{t('checkin.scan.title')}</h1>

        {/* Event Selection Info */}
        {autoSelection.isLoading && (
          <div className="text-center mb-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <p className="text-blue-300 text-sm">{t('checkin.loadingEvents')}</p>
          </div>
        )}

        {autoSelection.attempted && !autoSelection.isLoading && autoSelection.error && (
          <div className="text-center mb-4 p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
            <p className="text-orange-300 text-sm">
              {autoSelection.error === 'multiple_events_today' ? 'Multiple events today - manual selection needed' :
               autoSelection.error === 'no_events_today' ? 'No events scheduled for today' :
               'Auto-selection failed'}
            </p>
          </div>
        )}

        {/* Schedule Stats Info - reusing the component from paper/search tabs */}
        <ScheduleStatsInfo
          eventId={currentEventId}
          scheduleId={currentScheduleId}
          className="bg-gray-800 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-600 dark:border-gray-600"
        />

        {/* Change Event Button - Show when event is selected */}
        {(autoSelection.isAutoSelected || (!autoSelection.isLoading && currentEventId && currentScheduleId)) && (
          <div className="text-center mb-4">
            <button
              onClick={() => router.push('/checkin/events?mode=scan')}
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              Change event
            </button>
          </div>
        )}

        {/* Missing Event Selection Message */}
        {autoSelection.attempted && !autoSelection.isLoading && !currentEventId && !currentScheduleId && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-orange-300 mb-2">
              Event Selection Required
            </h3>
            <p className="text-orange-200 mb-4 text-sm">
              Please select an event and schedule to start scanning QR codes.
            </p>
            <button
              onClick={() => router.push('/checkin/events?mode=scan')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
            >
              Select Event
            </button>
          </div>
        )}

        {/* Dynamic instruction/last scan info area */}
        {lastScannedTicket ? (
          (() => {
            const ticketColors = getTicketClassColor(lastScannedTicket.ticketPriceInfo)
            return (
              <div className="text-center mb-6 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                <p className="text-green-400 text-sm font-medium mb-2">{t('checkin.scan.lastCheckIn')}</p>
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {lastScannedTicket.seat}
                    </span>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: ticketColors.color,
                        color: ticketColors.textColor,
                      }}
                    >
                      {lastScannedTicket.ticketPriceName || 'N/A'}
                    </span>
                    <span className="text-gray-300 text-sm">
                      {lastScannedTicket.ticketCode}
                    </span>
                  </div>
                  <span className="text-white font-semibold">
                    {lastScannedTicket.attendeeName}
                  </span>
                </div>
              </div>
            )
          })()
        ) : (
          <p className="text-gray-400 mb-6">{t('checkin.scan.instruction')}</p>
        )}

        <div className="w-full relative aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-700">
          <QRScanner
            onScan={validateAndCheckIn}
            paused={isProcessing || !!feedback}
            scanDelay={1500} // Increase scan delay to reduce duplicate detections
            className="absolute inset-0"
          />
          {/* Feedback overlay */}
          {feedback && (
            <div
              className={`absolute inset-0 flex items-center justify-center p-4 text-center text-white text-4xl font-bold transition-opacity duration-200 ${
                feedback.type === 'success'
                  ? 'bg-emerald-600/90'
                  : feedback.type === 'warning'
                  ? 'bg-orange-500/90'
                  : 'bg-red-600/90'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>

        {/* Persistent Error Banner */}
        {persistentError && (
          <div className="w-full mt-4 p-4 bg-red-600/90 border border-red-500 rounded-lg">
            <div className="flex justify-between items-start gap-3">
              <div className="text-white text-sm leading-relaxed">
                {persistentError}
              </div>
              <button
                onClick={() => setPersistentError(null)}
                className="flex-shrink-0 text-white hover:text-red-200 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

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
              <span>{t('checkin.scan.upload')}</span>
            </button>
          </div>
          <ScanHistory ref={historyRef} />
        </div>
      </div>
    </div>
  )
}