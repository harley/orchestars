// Custom hook for ticket scanner functionality

import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from '@/components/ui/use-toast'
import { provideFeedback, initializeFeedback } from '@/utilities/scannerFeedback'
import type {
  ScannerState,
  ValidatedTicket,
  ScannerError,
  ScannerSettings,
  ScanResult,
  QRCodeData,
  TicketValidationResponse,
  CheckinResponse,
} from '@/types/TicketScanning'

const DEFAULT_SETTINGS: ScannerSettings = {
  autoRescanAfterCheckin: true,
  soundEnabled: true,
  vibrationEnabled: true,
  scanTimeout: 30000,
}

export const useTicketScanner = () => {
  // Core state
  const [state, setState] = useState<ScannerState>('idle')
  const [ticket, setTicket] = useState<ValidatedTicket | null>(null)
  const [error, setError] = useState<ScannerError | null>(null)
  const [scannerKey, setScannerKey] = useState(0)

  // Settings
  const [settings, setSettings] = useState<ScannerSettings>(DEFAULT_SETTINGS)

  // Refs for cleanup and debouncing
  const scanTimeoutRef = useRef<NodeJS.Timeout>(null)
  const lastScanRef = useRef<string>('')
  const scanCooldownRef = useRef<NodeJS.Timeout>(null)

  // Initialize feedback on mount
  useEffect(() => {
    initializeFeedback()
  }, [])

  // API functions
  const validateTicketWithAPI = async (ticketData: QRCodeData): Promise<ValidatedTicket> => {
    const res = await fetch('/api/v1/checkin/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    })

    const data: TicketValidationResponse = await res.json()

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Ticket validation failed')
    }

    if (!data.ticket) {
      throw new Error('Invalid response from server')
    }

    return data.ticket
  }

  const checkinTicketWithAPI = async (ticket: ValidatedTicket): Promise<void> => {
    const res = await fetch('/api/v1/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketCode: ticket.ticketCode,
        eventId: ticket.eventId,
        eventScheduleId: ticket.eventScheduleId,
      }),
    })

    const data: CheckinResponse = await res.json()

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Check-in failed')
    }
  }

  // Handle rescan
  const handleRescan = useCallback(() => {
    setState('idle')
    setTicket(null)
    setError(null)
    setScannerKey((prev) => prev + 1) // Force scanner remount

    // Clear any pending timeouts
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current)
    }
    if (scanCooldownRef.current) {
      clearTimeout(scanCooldownRef.current)
    }

    lastScanRef.current = ''
  }, [])

  // Handle QR code scan
  const handleScan = useCallback(
    async (results: ScanResult[]) => {
      if (!results?.[0]?.rawValue || state === 'validating' || state === 'checking-in') {
        return
      }

      const rawValue = results[0].rawValue

      // Prevent duplicate scans within cooldown period
      if (lastScanRef.current === rawValue && scanCooldownRef.current) {
        return
      }

      // Clear any existing timeout
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }

      // Set cooldown to prevent rapid duplicate scans
      lastScanRef.current = rawValue
      scanCooldownRef.current = setTimeout(() => {
        lastScanRef.current = ''
        scanCooldownRef.current = null
      }, 1000)

      setState('validating')
      setError(null)
      setTicket(null)

      // Provide immediate feedback
      if (settings.soundEnabled || settings.vibrationEnabled) {
        provideFeedback('scan', {
          sound: settings.soundEnabled,
          vibration: settings.vibrationEnabled,
        })
      }

      try {
        let ticketData: QRCodeData

        try {
          ticketData = JSON.parse(rawValue)
        } catch {
          throw new Error('QR code is not a valid ticket format')
        }

        // Validate required fields
        if (!ticketData.ticketCode) {
          throw new Error('Invalid ticket: missing ticket code')
        }

        const validatedTicket = await validateTicketWithAPI(ticketData)

        setTicket(validatedTicket)
        setState('validated')

        // Success feedback
        if (settings.soundEnabled || settings.vibrationEnabled) {
          provideFeedback('success', {
            sound: settings.soundEnabled,
            vibration: settings.vibrationEnabled,
          })
        }

        toast({
          title: 'Vé hợp lệ!',
          description: `Mã vé: ${validatedTicket.ticketCode} - ${validatedTicket.attendeeName}`,
          duration: 3000,
          variant: 'success',
        })
      } catch (err: any) {
        const scannerError: ScannerError = {
          message: err.message || 'Unknown error occurred',
          type: err.name === 'TypeError' ? 'network' : 'validation',
        }

        setError(scannerError)
        setState('error')

        // Error feedback
        if (settings.soundEnabled || settings.vibrationEnabled) {
          provideFeedback('error', {
            sound: settings.soundEnabled,
            vibration: settings.vibrationEnabled,
          })
        }

        toast({
          title: 'Không thành công',
          description: scannerError.message,
          variant: 'destructive',
        })

        // Auto-clear error after timeout
        setTimeout(() => {
          if (state === 'error') {
            setState('idle')
            setError(null)
          }
        }, 3000)
      }
    },
    [state, settings],
  )

  // Handle check-in
  const handleCheckin = useCallback(async () => {
    if (!ticket || state !== 'validated') return

    setState('checking-in')

    try {
      await checkinTicketWithAPI(ticket)

      setState('checked-in')

      // Update ticket state
      setTicket((prev) => (prev ? { ...prev, isCheckedIn: true, checkedIn: true } : null))

      // Check-in success feedback
      if (settings.soundEnabled || settings.vibrationEnabled) {
        provideFeedback('checkin', {
          sound: settings.soundEnabled,
          vibration: settings.vibrationEnabled,
        })
      }

      toast({
        title: 'Check-in thành công!',
        description: `Vé ${ticket.ticketCode} đã được xác nhận check-in.`,
        duration: 3000,
        variant: 'success',
      })

      // Auto-rescan if enabled
      if (settings.autoRescanAfterCheckin) {
        setTimeout(() => {
          handleRescan()
        }, 2000)
      }
    } catch (err: any) {
      setState('validated') // Return to validated state

      const errorMessage = err.message || 'Check-in failed'

      // Error feedback
      if (settings.soundEnabled || settings.vibrationEnabled) {
        provideFeedback('error', {
          sound: settings.soundEnabled,
          vibration: settings.vibrationEnabled,
        })
      }

      toast({
        title: 'Lỗi check-in',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }, [ticket, state, settings, handleRescan])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
    if (state === 'error') {
      setState('idle')
    }
  }, [state])

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<ScannerSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }
      if (scanCooldownRef.current) {
        clearTimeout(scanCooldownRef.current)
      }
    }
  }, [])

  return {
    // State
    state,
    ticket,
    error,
    settings,
    scannerKey,

    // Actions
    handleScan,
    handleCheckin,
    handleRescan,
    clearError,
    updateSettings,

    // Computed properties
    isScanning: state === 'scanning' || state === 'idle',
    isValidating: state === 'validating',
    isCheckingIn: state === 'checking-in',
    canCheckin:
      state === 'validated' && ticket && !ticket.isCheckedIn && ticket.status === 'booked',
    canRescan: state !== 'validating' && state !== 'checking-in',
  }
}
