'use client'

import React, { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the Scanner only on the client to avoid SSR issues
const DynamicScanner = dynamic(() => import('@yudiel/react-qr-scanner').then((m) => m.Scanner), {
  ssr: false,
})

export interface QRScannerProps {
  /**
   * Called when a QR code is successfully scanned. Provides the decoded string.
   */
  onScan: (value: string) => void
  /**
   * Called when camera or scanning errors occur.
   */
  onError?: (error: unknown) => void
  /**
   * Milliseconds to debounce scans (ignore duplicate within this time)
   */
  scanDelay?: number
  className?: string
}

const DEFAULT_DELAY = 700 // ms

export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onError,
  scanDelay = DEFAULT_DELAY,
  className,
}) => {
  const [lastValue, setLastValue] = useState<string | null>(null)
  const [lastTime, setLastTime] = useState<number>(0)

  const handleScan = useCallback(
    (detectedCodes: any[]) => {
      if (!detectedCodes || detectedCodes.length === 0) return
      const value: string = detectedCodes[0]?.rawValue || ''
      if (!value) return

      const now = Date.now()
      if (value === lastValue && now - lastTime < scanDelay) {
        // ignore duplicates within delay window
        return
      }

      setLastValue(value)
      setLastTime(now)

      onScan(value)
    },
    [lastValue, lastTime, scanDelay, onScan],
  )

  const handleError = useCallback(
    (err: unknown) => {
      console.error('QR Scanner error', err)
      onError?.(err)
    },
    [onError],
  )

  return (
    <div className={className}>
      <DynamicScanner
        onScan={handleScan}
        onError={handleError}
        scanDelay={scanDelay}
        formats={['qr_code']}
        /* Video will fill container */
        styles={{
          container: { width: '100%', height: '100%' },
          video: { width: '100%', height: '100%', objectFit: 'cover' },
        }}
      />
    </div>
  )
} 