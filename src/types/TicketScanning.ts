// TypeScript types for ticket scanning functionality

export interface QRCodeData {
  ticketId?: string
  ticketCode: string
  eventId: number
  eventScheduleId?: string
  seat?: string
  userEmail?: string
  firstName?: string
  lastName?: string
  issueDate?: string
}

export interface TicketUser {
  id: number
  email: string | null
  phoneNumber: string | null
  firstName: string | null
  lastName: string | null
}

export interface TicketOrder {
  id: number | null
  status: string | null
}

export interface CheckinRecord {
  id?: number
  checkInTime?: string
  checkedInBy?: {
    id: number
    email: string
  }
  ticketGivenTime?: string
  ticketGivenBy?: string
}

export interface ValidatedTicket {
  id: number
  ticketCode: string
  attendeeName: string
  seat: string
  ticketPriceInfo?: any
  eventId: number
  eventScheduleId: string
  eventTitle: string | null
  eventDate: string | null
  eventStartDatetime: string | null
  eventEndDatetime: string | null
  status: 'booked' | 'pending_payment' | 'hold' | 'cancelled'
  user: TicketUser | null
  order: TicketOrder
  isCheckedIn: boolean
  checkinRecord: CheckinRecord | null
  // Additional computed properties for UI
  checkedIn?: boolean // Legacy compatibility
}

export interface TicketValidationResponse {
  success: boolean
  message: string
  ticket?: ValidatedTicket
}

export interface CheckinResponse {
  success: boolean
  message: string
  checkinRecord?: {
    id: number
    ticketCode: string
    checkInTime: string
    checkedInBy: {
      id: number
      email: string
    }
  }
}

export interface ScanResult {
  rawValue: string
  format?: string
  timestamp?: number
}

export interface ScannerError {
  message: string
  code?: string
  type: 'camera' | 'permission' | 'validation' | 'network' | 'unknown'
}

export type ScannerState =
  | 'idle' // Ready to scan
  | 'scanning' // Camera active, waiting for QR code
  | 'validating' // QR code detected, validating with API
  | 'validated' // Ticket validated successfully
  | 'checking-in' // Performing check-in
  | 'checked-in' // Check-in completed
  | 'error' // Error state

export interface ScannerSettings {
  autoRescanAfterCheckin: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  scanTimeout: number // milliseconds
}

export interface ScannerContextType {
  state: ScannerState
  ticket: ValidatedTicket | null
  error: ScannerError | null
  settings: ScannerSettings

  // Actions
  handleScan: (results: ScanResult[]) => Promise<void>
  handleCheckin: () => Promise<void>
  handleRescan: () => void
  clearError: () => void
  updateSettings: (settings: Partial<ScannerSettings>) => void
  clearHistory: () => void
}

// Camera and scanner related types
export interface CameraConstraints {
  facingMode: 'user' | 'environment'
  width?: number
  height?: number
}

export interface ScannerProps {
  onScan: (results: ScanResult[]) => void
  onError: (error: Error) => void
  constraints?: CameraConstraints
  formats?: string[]
  styles?: {
    container?: React.CSSProperties
    video?: React.CSSProperties
  }
}

// UI Component types
export interface TicketDisplayProps {
  ticket: ValidatedTicket
  onCheckin: () => void
  onRescan: () => void
  isCheckingIn: boolean
}

export interface ScannerOverlayProps {
  state: ScannerState
  message?: string
}

// Audio feedback types
export type SoundType = 'success' | 'error' | 'scan' | 'checkin'

export interface AudioManager {
  play: (sound: SoundType) => void
  setEnabled: (enabled: boolean) => void
  isEnabled: () => boolean
}

// Vibration patterns
export type VibrationPattern = number | number[]

export interface VibrationManager {
  vibrate: (pattern?: VibrationPattern) => void
  setEnabled: (enabled: boolean) => void
  isEnabled: () => boolean
}

// Error types specific to ticket scanning
export interface TicketScanError extends Error {
  code: string
  type: ScannerError['type']
  ticketCode?: string
  retryable: boolean
}

// Manual input types
export interface ManualTicketInput {
  ticketCode: string
  eventId?: number
  eventScheduleId?: string
}

// Batch scanning types
export interface BatchScanItem {
  ticketCode: string
  status: 'pending' | 'success' | 'error'
  result?: ValidatedTicket
  error?: string
  timestamp: Date
}

export interface BatchScanSession {
  id: string
  items: BatchScanItem[]
  startTime: Date
  endTime?: Date
  totalItems: number
  successCount: number
  errorCount: number
}
