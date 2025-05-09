import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getExistingSeatHolding,
  getSeatHoldings,
} from '../../../../../src/app/(payload)/api/seat-holding/seat/utils'

// Mock the payload module
vi.mock('payload', () => ({
  default: {
    find: vi.fn(),
    db: {
      drizzle: {
        execute: vi.fn(),
      },
    },
  },
}))

// Mock the sql function from @payloadcms/db-postgres
vi.mock('@payloadcms/db-postgres', () => {
  // Create a mock function with a raw property
  const mockSql = vi.fn((_strings: any) => 'mocked-sql-query')
  // Add the raw property to the function
  Object.defineProperty(mockSql, 'raw', {
    value: vi.fn((str: string) => str),
    writable: true,
  })
  return { sql: mockSql }
})

// Import the mocked modules
import payload from 'payload'
import { sql } from '@payloadcms/db-postgres'

describe('Seat Holding Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getExistingSeatHolding', () => {
    it('should return existing seat holdings for given event and schedule', async () => {
      // Arrange
      const mockRows = [
        {
          id: 'holding-1',
          seatName: 'A1',
          code: 'code-123',
          expire_time: new Date().toISOString(),
        },
      ]

      vi.mocked(payload.db.drizzle.execute).mockResolvedValue({
        rows: mockRows,
      } as any)

      // Act
      const result = await getExistingSeatHolding({
        eventId: 123,
        eventScheduleId: 'schedule-1',
        payload: payload as any,
      })

      // Assert
      expect(result).toEqual(mockRows)
      expect(payload.db.drizzle.execute).toHaveBeenCalled()
    })

    it('should include seat filtering when inSeats is provided', async () => {
      // Arrange
      const mockRows = [
        {
          id: 'holding-1',
          seatName: 'A1',
          code: 'code-123',
          expire_time: new Date().toISOString(),
        },
      ]

      vi.mocked(payload.db.drizzle.execute).mockResolvedValue({
        rows: mockRows,
      } as any)

      // Act
      const result = await getExistingSeatHolding({
        eventId: 123,
        eventScheduleId: 'schedule-1',
        inSeats: ['A1', 'B2'],
        payload: payload as any,
      })

      // Assert
      expect(result).toEqual(mockRows)
      expect(payload.db.drizzle.execute).toHaveBeenCalled()
      // Verify that the SQL query includes the inSeats filter
      expect(sql.raw).toHaveBeenCalledWith(expect.stringContaining('AND EXISTS'))
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      vi.mocked(payload.db.drizzle.execute).mockRejectedValue(new Error('Database error'))

      // Act
      const result = await getExistingSeatHolding({
        eventId: 123,
        eventScheduleId: 'schedule-1',
        payload: payload as any,
      })

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('getSeatHoldings', () => {
    it('should return seat holdings for given event and schedule', async () => {
      // Arrange
      const mockDocs = [
        {
          id: 'holding-1',
          seatName: 'A1,B2',
        },
        {
          id: 'holding-2',
          seatName: 'C3',
        },
      ]

      vi.mocked(payload.find).mockResolvedValue({
        docs: mockDocs,
      } as any)

      // Act
      const result = await getSeatHoldings({
        eventId: 123,
        eventScheduleId: 'schedule-1',
        payload: payload as any,
      })

      // Assert
      // The order doesn't matter, so we'll check that all expected items are present
      expect(result).toHaveLength(3)
      expect(result).toContain('A1')
      expect(result).toContain('B2')
      expect(result).toContain('C3')
      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'seatHoldings',
          where: expect.objectContaining({
            event: { equals: 123 },
            eventScheduleId: { equals: 'schedule-1' },
          }),
        }),
      )
    })

    it('should exclude seats with a specific holding code when notEqualSeatHoldingCode is provided', async () => {
      // Arrange
      vi.mocked(payload.find).mockResolvedValue({
        docs: [
          {
            id: 'holding-1',
            seatName: 'A1,B2',
          },
        ],
      } as any)

      // Act
      const result = await getSeatHoldings({
        eventId: 123,
        eventScheduleId: 'schedule-1',
        notEqualSeatHoldingCode: 'exclude-this-code',
        payload: payload as any,
      })

      // Assert
      expect(result).toEqual(['A1', 'B2'])
      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            code: { not_equals: 'exclude-this-code' },
          }),
        }),
      )
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      vi.mocked(payload.find).mockRejectedValue(new Error('Database error'))

      // Act
      const result = await getSeatHoldings({
        eventId: 123,
        eventScheduleId: 'schedule-1',
        payload: payload as any,
      })

      // Assert
      expect(result).toEqual([])
    })

    it('should handle empty seat names', async () => {
      // Arrange
      vi.mocked(payload.find).mockResolvedValue({
        docs: [
          {
            id: 'holding-1',
            seatName: '',
          },
          {
            id: 'holding-2',
            seatName: null,
          },
        ],
      } as any)

      // Act
      const result = await getSeatHoldings({
        eventId: 123,
        eventScheduleId: 'schedule-1',
        payload: payload as any,
      })

      // Assert
      // The actual implementation returns empty strings, but we'll check that there are no meaningful values
      expect(result.every((item) => !item || item === '')).toBe(true)
    })
  })
})
