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
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { CheckinRecord, User } from '@/payload-types'
import jsQR from 'jsqr'
import { useTranslate } from '@/providers/I18n/client'
import { getTicketClassColor } from '@/utilities/getTicketClassColor'

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

export const ScanPageClient: React.FC = () => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(
    null,
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastScannedTicket, setLastScannedTicket] = useState<{
    seat: string
    ticketPriceName: string | null
    attendeeName: string
    ticketCode: string
    ticketPriceInfo: any
  } | null>(null)
  const pathname = usePathname()
  const historyRef = useRef<{ fetchHistory: () => void }>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslate()

  // Client-side caching and debouncing for better performance
  const lastScanTimeRef = useRef<number>(0)
  const lastScanCodeRef = useRef<string>('')
  const scanCacheRef = useRef<Map<string, { result: any; timestamp: number }>>(new Map())
  const SCAN_DEBOUNCE_MS = 2000 // Prevent duplicate scans within 2 seconds
  const CACHE_DURATION_MS = 30000 // Cache results for 30 seconds

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
          setFeedback({ type: 'error', message: t('checkin.scan.error.canvasNotSupported') })
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
          setFeedback({ type: 'error', message: t('checkin.scan.error.noQrFound') })
          if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
        }

        URL.revokeObjectURL(imageUrl)
      }

      image.onerror = () => {
        setFeedback({ type: 'error', message: t('checkin.scan.error.failedToLoadImage') })
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
        URL.revokeObjectURL(imageUrl)
      }
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', message: t('checkin.scan.error.processingImage') })
      if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
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
        setFeedback({ type: 'error', message: scanData.message || t('checkin.scan.error.failed') })
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
      const scanRes = await fetch(`/api/checkin-app/scan/${normalizedCode}`, {
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
        historyRef.current?.fetchHistory();
      } else {
        const msg = !scanRes.ok ? scanData.message || t('checkin.scan.error.failed') : t('checkin.scan.error.failed')
        setFeedback({ type: 'error', message: msg })
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
  }, [isProcessing, t, SCAN_DEBOUNCE_MS, CACHE_DURATION_MS])

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
            {t('checkin.nav.qr')}
          </Link>
          <Link
            href="/checkin/events"
            className={`text-center py-2 px-4 rounded font-semibold ${
              pathname === '/checkin/events'
                ? 'bg-white text-gray-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {t('checkin.nav.search')}
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-2">{t('checkin.scan.title')}</h1>
        
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