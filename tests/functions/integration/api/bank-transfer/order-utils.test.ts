import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkBookedOrPendingPaymentSeats } from '../../../../../src/app/(payload)/api/bank-transfer/order/utils'
import { ORDER_STATUS } from '../../../../../src/collections/Orders/constants'

// Mock the payload module
vi.mock('payload', () => ({
  default: {
    db: {
      drizzle: {
        execute: vi.fn(),
      },
    },
  },
}))

// Import the mocked modules
import payload from 'payload'

describe('Order Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkBookedOrPendingPaymentSeats', () => {
    it('should return booked or pending payment seats for given event and schedule', async () => {
      // Arrange
      const mockRows = [
        {
          seatName: 'A1',
          total: 1,
        },
        {
          seatName: 'B2',
          total: 1,
        },
      ]

      vi.mocked(payload.db.drizzle.execute).mockResolvedValue({
        rows: mockRows,
      } as any)

      // Act
      const result = await checkBookedOrPendingPaymentSeats({
        eventId: 123,
        eventScheduleId: 'schedule-1',
        payload: payload as any,
      })

      // Assert
      expect(result).toEqual(mockRows)
      expect(payload.db.drizzle.execute).toHaveBeenCalled()

      // Verify that the SQL query includes the correct conditions
      const mockExecute = vi.mocked(payload.db.drizzle.execute)
      expect(mockExecute).toHaveBeenCalled()

      // Get the first call argument safely
      const firstCall = mockExecute.mock.calls[0]
      expect(firstCall).toBeDefined()

      if (firstCall) {
        const sqlQuery = firstCall[0]
        expect(sqlQuery).toContain(`ord.status = '${ORDER_STATUS.completed.value}'`)
        expect(sqlQuery).toContain(`ord.status = '${ORDER_STATUS.processing.value}'`)
        expect(sqlQuery).toContain('ticket.event_id = 123')
        expect(sqlQuery).toContain("ticket.event_schedule_id = 'schedule-1'")
      }
    })

    it('should filter by specific seats when seats parameter is provided', async () => {
      // Arrange
      const mockRows = [
        {
          seatName: 'A1',
          total: 1,
        },
      ]

      vi.mocked(payload.db.drizzle.execute).mockResolvedValue({
        rows: mockRows,
      } as any)

      // Act
      const result = await checkBookedOrPendingPaymentSeats({
        eventId: 123,
        eventScheduleId: 'schedule-1',
        seats: ['A1', 'B2'],
        payload: payload as any,
      })

      // Assert
      expect(result).toEqual(mockRows)

      // Verify that the SQL query includes the seats filter
      const mockExecute = vi.mocked(payload.db.drizzle.execute)
      expect(mockExecute).toHaveBeenCalled()

      // Get the first call argument safely
      const firstCall = mockExecute.mock.calls[0]
      expect(firstCall).toBeDefined()

      if (firstCall) {
        const sqlQuery = firstCall[0]
        expect(sqlQuery).toContain("ticket.seat = ANY('{A1,B2}')")
      }
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      vi.mocked(payload.db.drizzle.execute).mockRejectedValue(new Error('Database error'))

      // Act
      const result = await checkBookedOrPendingPaymentSeats({
        eventId: 123,
        eventScheduleId: 'schedule-1',
        payload: payload as any,
      })

      // Assert
      expect(result).toEqual([])
    })

    it('should handle empty result sets', async () => {
      // Arrange
      vi.mocked(payload.db.drizzle.execute).mockResolvedValue({
        rows: [],
      } as any)

      // Act
      const result = await checkBookedOrPendingPaymentSeats({
        eventId: 123,
        eventScheduleId: 'schedule-1',
        payload: payload as any,
      })

      // Assert
      expect(result).toEqual([])
    })
  })
})
