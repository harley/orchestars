import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import PaperPageClient from '../page.client'

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

// Mock auth provider
vi.mock('@/providers/CheckIn/useAuth', () => ({
  useAuth: vi.fn(() => ({ token: 'mock-token' }))
}))

// Mock translation provider
vi.mock('@/providers/I18n/client', () => ({
  useTranslate: vi.fn(() => ({
    t: vi.fn((key) => key)
  }))
}))

// Mock components
vi.mock('@/components/CheckinNav', () => ({
  CheckinNav: () => <div data-testid="checkin-nav">CheckinNav</div>
}))

vi.mock('@/components/ScheduleStatsInfo', () => ({
  default: ({ eventId, scheduleId }: { eventId: string | null, scheduleId: string | null }) => (
    <div data-testid="schedule-stats">Stats for {eventId}-{scheduleId}</div>
  )
}))

vi.mock('@/components/ui/TicketCard', () => ({
  TicketCard: ({ ticket, onCheckIn }: any) => (
    <div data-testid="ticket-card">
      <div>Ticket: {ticket.ticketCode}</div>
      <button onClick={onCheckIn}>Check In</button>
    </div>
  )
}))

// Mock auto-selection utilities
vi.mock('@/lib/checkin/autoEventSelection', () => ({
  attemptAutoSelection: vi.fn(),
  getAutoSelectionFailureMessage: vi.fn((reason) => `Auto-selection failed: ${reason}`)
}))

vi.mock('@/lib/checkin/eventSelectionCache', () => ({
  getCachedEventSelection: vi.fn(),
  setCachedEventSelection: vi.fn(),
  clearExpiredCache: vi.fn(),
  isCurrentSelectionAutoSelected: vi.fn()
}))

// Mock fetch
global.fetch = vi.fn()

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
}

const mockSearchParams = {
  get: vi.fn(),
}

describe('PaperPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue(mockRouter)
    ;(useSearchParams as any).mockReturnValue(mockSearchParams)
    mockSearchParams.get.mockReturnValue(null)
    
    // Mock successful fetch responses
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ events: [] })
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Auto-selection behavior', () => {
    test('shows loading indicator during auto-selection', async () => {
      const { getCachedEventSelection } = await import('@/lib/checkin/eventSelectionCache')
      ;(getCachedEventSelection as any).mockReturnValue(null)

      // Mock slow auto-selection
      const { attemptAutoSelection } = await import('@/lib/checkin/autoEventSelection')
      ;(attemptAutoSelection as any).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: false, reason: 'no_events_today' }), 100))
      )

      render(<PaperPageClient />)

      // Should show loading indicator initially
      expect(screen.getByText('Finding today\'s event...')).toBeInTheDocument()
    })

    test('shows auto-selected indicator when event is auto-selected', async () => {
      const { getCachedEventSelection } = await import('@/lib/checkin/eventSelectionCache')
      ;(getCachedEventSelection as any).mockReturnValue({
        eventId: '1',
        scheduleId: 'schedule1',
        isAutoSelected: true
      })

      render(<PaperPageClient />)

      await waitFor(() => {
        expect(screen.getByText('Auto-selected for today')).toBeInTheDocument()
      })
    })

    test('redirects to manual selection when auto-selection fails', async () => {
      const { getCachedEventSelection } = await import('@/lib/checkin/eventSelectionCache')
      const { attemptAutoSelection } = await import('@/lib/checkin/autoEventSelection')
      
      ;(getCachedEventSelection as any).mockReturnValue(null)
      ;(attemptAutoSelection as any).mockResolvedValue({
        success: false,
        reason: 'multiple_events_today'
      })

      render(<PaperPageClient />)

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/checkin/events?mode=paper&reason=multiple_events_today')
      })
    })

    test('uses cached selection when available', async () => {
      const { getCachedEventSelection } = await import('@/lib/checkin/eventSelectionCache')
      ;(getCachedEventSelection as any).mockReturnValue({
        eventId: '1',
        scheduleId: 'schedule1',
        isAutoSelected: true
      })

      render(<PaperPageClient />)

      await waitFor(() => {
        expect(screen.getByTestId('schedule-stats')).toHaveTextContent('Stats for 1-schedule1')
      })
    })

    test('uses URL params when provided', () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === 'eventId') return '2'
        if (key === 'scheduleId') return 'schedule2'
        return null
      })

      render(<PaperPageClient />)

      expect(screen.getByTestId('schedule-stats')).toHaveTextContent('Stats for 2-schedule2')
    })
  })

  describe('Paper check-in functionality', () => {
    beforeEach(() => {
      // Set up valid event context
      mockSearchParams.get.mockImplementation((key) => {
        if (key === 'eventId') return '1'
        if (key === 'scheduleId') return 'schedule1'
        return null
      })
    })

    test('shows seat input form when event context is available', () => {
      render(<PaperPageClient />)

      expect(screen.getByLabelText(/seat.*number/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /validate.*seat/i })).toBeInTheDocument()
    })

    test('shows event selection required message when context is missing', () => {
      mockSearchParams.get.mockReturnValue(null)

      render(<PaperPageClient />)

      expect(screen.getByText(/event.*selection.*required/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /select.*event/i })).toBeInTheDocument()
    })

    test('validates seat number on form submission', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          tickets: [{
            ticketCode: 'ABC123',
            attendeeName: 'John Doe',
            seat: 'A1',
            isCheckedIn: false
          }]
        })
      })

      render(<PaperPageClient />)

      const seatInput = screen.getByLabelText(/seat.*number/i)
      const validateButton = screen.getByRole('button', { name: /validate.*seat/i })

      fireEvent.change(seatInput, { target: { value: 'A1' } })
      fireEvent.click(validateButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/checkin-app/validate-seat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'JWT mock-token'
          },
          body: JSON.stringify({
            seatNumber: 'A1',
            eventId: '1',
            scheduleId: 'schedule1'
          })
        })
      })
    })

    test('shows ticket card after successful validation', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          tickets: [{
            ticketCode: 'ABC123',
            attendeeName: 'John Doe',
            seat: 'A1',
            isCheckedIn: false
          }]
        })
      })

      render(<PaperPageClient />)

      const seatInput = screen.getByLabelText(/seat.*number/i)
      const validateButton = screen.getByRole('button', { name: /validate.*seat/i })

      fireEvent.change(seatInput, { target: { value: 'A1' } })
      fireEvent.click(validateButton)

      await waitFor(() => {
        expect(screen.getByTestId('ticket-card')).toBeInTheDocument()
        expect(screen.getByText('Ticket: ABC123')).toBeInTheDocument()
      })
    })

    test('performs check-in with paper method', async () => {
      // Mock validation response
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            tickets: [{
              ticketCode: 'ABC123',
              attendeeName: 'John Doe',
              seat: 'A1',
              isCheckedIn: false
            }]
          })
        })
        // Mock check-in response
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })

      render(<PaperPageClient />)

      // Validate seat first
      const seatInput = screen.getByLabelText(/seat.*number/i)
      fireEvent.change(seatInput, { target: { value: 'A1' } })
      fireEvent.click(screen.getByRole('button', { name: /validate.*seat/i }))

      // Wait for ticket card and click check-in
      await waitFor(() => {
        expect(screen.getByTestId('ticket-card')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /check in/i }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/checkin-app/checkin/ABC123', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'JWT mock-token'
          },
          body: JSON.stringify({
            manual: true,
            checkinMethod: 'paper'
          })
        })
      })
    })

    test('shows success message after successful check-in', async () => {
      // Mock validation and check-in responses
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            tickets: [{
              ticketCode: 'ABC123',
              attendeeName: 'John Doe',
              seat: 'A1',
              isCheckedIn: false
            }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })

      render(<PaperPageClient />)

      // Complete check-in flow
      const seatInput = screen.getByLabelText(/seat.*number/i)
      fireEvent.change(seatInput, { target: { value: 'A1' } })
      fireEvent.click(screen.getByRole('button', { name: /validate.*seat/i }))

      await waitFor(() => {
        expect(screen.getByTestId('ticket-card')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /check in/i }))

      await waitFor(() => {
        expect(screen.getByText(/checked in.*john doe.*a1.*abc123/i)).toBeInTheDocument()
      })
    })

    test('handles validation errors gracefully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          error: 'Seat not found'
        })
      })

      render(<PaperPageClient />)

      const seatInput = screen.getByLabelText(/seat.*number/i)
      fireEvent.change(seatInput, { target: { value: 'INVALID' } })
      fireEvent.click(screen.getByRole('button', { name: /validate.*seat/i }))

      await waitFor(() => {
        expect(screen.getByText('Seat not found')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation and context', () => {
    test('shows change event link', () => {
      render(<PaperPageClient />)

      const changeEventLink = screen.getByRole('link', { name: /change event/i })
      expect(changeEventLink).toHaveAttribute('href', '/checkin/events?mode=paper')
    })

    test('auto-focuses seat input when context is available', async () => {
      mockSearchParams.get.mockImplementation((key) => {
        if (key === 'eventId') return '1'
        if (key === 'scheduleId') return 'schedule1'
        return null
      })

      render(<PaperPageClient />)

      await waitFor(() => {
        const seatInput = screen.getByLabelText(/seat.*number/i)
        expect(seatInput).toHaveFocus()
      })
    })
  })
})