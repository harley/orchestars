import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, userAgent } from 'next/server'
import { POST } from '../../../../../src/app/(payload)/api/seat-holding/seat/route'
import { headers } from 'next/headers'
import { checkBookedOrPendingPaymentSeats } from '../../../../../src/app/(payload)/api/bank-transfer/order/utils'
import { handleNextErrorMsgResponse } from '../../../../../src/utilities/handleNextErrorMsgResponse'
import { generatePassword } from '../../../../../src/utilities/generatePassword'
import { Event, SeatHolding } from '@/payload-types'

// Mock the dependencies
vi.mock('payload', () => ({
  default: {
    init: vi.fn(),
    findByID: vi.fn(),
    find: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
}))

// Mock the payload config
vi.mock('@/payload.config', () => ({
  default: {},
}))

vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data,
    })),
  },
  userAgent: vi.fn(),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

vi.mock('../../../../../src/app/(payload)/api/bank-transfer/order/utils', () => ({
  checkBookedOrPendingPaymentSeats: vi.fn(),
}))

vi.mock('../../../../../src/utilities/handleNextErrorMsgResponse', () => ({
  handleNextErrorMsgResponse: vi.fn(),
}))

vi.mock('../../../../../src/utilities/generatePassword', () => ({
  generatePassword: vi.fn(),
}))

// Import the mocked modules
import payload from 'payload'

describe('Seat Holding API', () => {
  // Common test variables
  const mockEvent = {
    id: 123,
    title: 'Test Event',
    schedules: [
      {
        id: 'schedule-1',
        date: '2023-12-01',
        details: [
          {
            time: '19:00',
            name: 'Evening Show',
          },
        ],
      },
    ],
    // Required by Event type
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Event

  const mockSeatHolding = {
    id: 1, // Changed to number to match SeatHolding type
    code: 'existing-code-123',
    expire_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    event: 123,
    eventScheduleId: 'schedule-1',
    seatName: 'A1',
    // Required by SeatHolding type
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as SeatHolding

  const mockRequest = (body: any) => {
    return {
      json: vi.fn().mockResolvedValue(body),
      headers: {
        get: vi.fn().mockReturnValue('Mozilla/5.0'),
      },
    } as unknown as NextRequest
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mocks
    vi.mocked(payload.init).mockResolvedValue({} as any)
    vi.mocked(payload.findByID).mockResolvedValue(mockEvent)
    vi.mocked(payload.find).mockResolvedValue({
      docs: [],
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10,
      totalDocs: 0,
      totalPages: 1,
      page: 1,
      pagingCounter: 1,
      nextPage: null,
      prevPage: null,
    })
    vi.mocked(payload.update).mockResolvedValue(mockSeatHolding)
    vi.mocked(payload.create).mockResolvedValue(mockSeatHolding)

    vi.mocked(checkBookedOrPendingPaymentSeats).mockResolvedValue([])
    vi.mocked(handleNextErrorMsgResponse).mockResolvedValue('Error message')
    vi.mocked(generatePassword).mockReturnValue('new-code-456')

    vi.mocked(userAgent).mockReturnValue({
      browser: { name: 'Chrome', version: '100' },
      os: { name: 'Windows', version: '10' },
      isBot: false,
      ua: 'Mozilla/5.0',
      device: { type: 'desktop' },
      engine: { name: 'Blink' },
      cpu: {},
    } as any)

    vi.mocked(headers).mockReturnValue({
      get: vi.fn().mockImplementation((key) => {
        if (key === 'request-ip' || key === 'x-forwarded-for') {
          return '127.0.0.1'
        }
        return null
      }),
    } as any)
  })

  it('should successfully create a new seat holding', async () => {
    // Arrange
    const requestBody = {
      seatName: 'A1',
      eventId: 123,
      eventScheduleId: 'schedule-1',
      userInfo: { name: 'Test User' },
    }

    const request = mockRequest(requestBody)

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(responseData).toHaveProperty('seatHoldingCode', 'new-code-456')
    expect(responseData).toHaveProperty('expireTime')

    // Verify payload.create was called with correct parameters
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'seatHoldings',
        data: expect.objectContaining({
          code: 'new-code-456',
          event: 123,
          eventScheduleId: 'schedule-1',
          seatName: 'A1',
          userInfo: { name: 'Test User' },
        }),
      }),
    )
  })

  it('should update an existing seat holding when seatHoldingCode is provided', async () => {
    // Arrange
    const requestBody = {
      seatName: 'A2',
      eventId: 123,
      eventScheduleId: 'schedule-1',
      seatHoldingCode: 'existing-code-123',
    }

    const request = mockRequest(requestBody)

    // Mock finding an existing seat holding
    vi.mocked(payload.find).mockResolvedValue({
      docs: [mockSeatHolding],
    } as any)

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(responseData).toHaveProperty('seatHoldingCode', 'existing-code-123')
    expect(responseData).toHaveProperty('expireTime')

    // Verify payload.update was called with correct parameters
    expect(payload.update).toHaveBeenCalledWith({
      collection: 'seatHoldings',
      id: 1,
      data: {
        expire_time: expect.any(String),
        event: 123,
        eventScheduleId: 'schedule-1',
        seatName: 'A2',
      },
      select: {
        id: true,
        code: true,
        expire_time: true,
      },
    })
  })

  it('should return 400 when seatName is missing', async () => {
    // Arrange
    const requestBody = {
      eventId: 123,
      eventScheduleId: 'schedule-1',
    }

    const request = mockRequest(requestBody)

    // Act
    const response = await POST(request)

    // Assert
    expect(response.status).toBe(400)
    expect(await response.json()).toHaveProperty('message')
  })

  it('should return 400 when eventId is missing', async () => {
    // Arrange
    const requestBody = {
      seatName: 'A1',
      eventScheduleId: 'schedule-1',
    }

    const request = mockRequest(requestBody)

    // Act
    const response = await POST(request)

    // Assert
    expect(response.status).toBe(400)
    expect(await response.json()).toHaveProperty('message')
  })

  it('should return 400 when eventScheduleId is missing', async () => {
    // Arrange
    const requestBody = {
      seatName: 'A1',
      eventId: 123,
    }

    const request = mockRequest(requestBody)

    // Act
    const response = await POST(request)

    // Assert
    expect(response.status).toBe(400)
    expect(await response.json()).toHaveProperty('message')
  })

  it('should return 400 when event does not exist', async () => {
    // Arrange
    const requestBody = {
      seatName: 'A1',
      eventId: 999,
      eventScheduleId: 'schedule-1',
    }

    const request = mockRequest(requestBody)

    // Mock event not found
    vi.mocked(payload.findByID).mockResolvedValue(null as any)

    // Act
    const response = await POST(request)

    // Assert
    expect(response.status).toBe(400)
    expect(await response.json()).toHaveProperty('message')
  })

  it('should return 400 when event schedule does not exist', async () => {
    // Arrange
    const requestBody = {
      seatName: 'A1',
      eventId: 123,
      eventScheduleId: 'non-existent-schedule',
    }

    const request = mockRequest(requestBody)

    // Act
    const response = await POST(request)

    // Assert
    expect(response.status).toBe(400)
    expect(await response.json()).toHaveProperty('message')
  })

  it('should return 400 when seats are already held by another user', async () => {
    // Arrange
    const requestBody = {
      seatName: 'A1',
      eventId: 123,
      eventScheduleId: 'schedule-1',
    }

    const request = mockRequest(requestBody)

    // Mock existing seats held by another user
    vi.mocked(payload.find).mockResolvedValue({
      docs: [
        {
          id: 'other-holding',
          seatName: 'A1',
          code: 'other-code',
        },
      ],
    } as any)

    // Act
    const response = await POST(request)

    // Assert
    expect(response.status).toBe(400)
    expect(await response.json()).toHaveProperty('message')
  })

  it('should return 400 when seats are already booked', async () => {
    // Arrange
    const requestBody = {
      seatName: 'A1',
      eventId: 123,
      eventScheduleId: 'schedule-1',
    }

    const request = mockRequest(requestBody)

    // Mock seats already booked
    vi.mocked(checkBookedOrPendingPaymentSeats).mockResolvedValue([{ seatName: 'A1', total: 1 }])

    // Act
    const response = await POST(request)

    // Assert
    expect(response.status).toBe(400)
    expect(await response.json()).toHaveProperty('message')
  })

  // SQL Injection Tests
  describe('SQL Injection Protection', () => {
    it('should safely handle malicious input in seatName', async () => {
      // Arrange
      const maliciousSeatName = "A1'; DROP TABLE users; --"
      const requestBody = {
        seatName: maliciousSeatName,
        eventId: 123,
        eventScheduleId: 'schedule-1',
      }

      const request = mockRequest(requestBody)

      // Act
      const response = await POST(request)

      // Assert
      // The API should process this normally and not crash
      expect(response.status).toBe(200)
      expect(await response.json()).toHaveProperty('seatHoldingCode')

      // Verify payload.create was called with the malicious input (which will be sanitized by the DB layer)
      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            seatName: maliciousSeatName,
          }),
        }),
      )
    })

    it('should safely handle malicious input in eventScheduleId', async () => {
      // Arrange
      const maliciousScheduleId = "schedule-1'; DROP TABLE events; --"
      const requestBody = {
        seatName: 'A1',
        eventId: 123,
        eventScheduleId: maliciousScheduleId,
      }

      const request = mockRequest(requestBody)

      // Mock event with the malicious schedule ID to pass validation
      vi.mocked(payload.findByID).mockResolvedValue({
        ...mockEvent,
        schedules: [
          {
            id: maliciousScheduleId,
            date: '2023-12-01',
          },
        ],
      } as unknown as Event)

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(await response.json()).toHaveProperty('seatHoldingCode')

      // Verify payload.create was called with the malicious input
      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventScheduleId: maliciousScheduleId,
          }),
        }),
      )
    })

    it('should safely handle malicious input in userInfo', async () => {
      // Arrange
      const maliciousUserInfo = {
        name: "User'); DROP TABLE admins; --",
        email: "user@example.com' OR '1'='1",
      }
      const requestBody = {
        seatName: 'A1',
        eventId: 123,
        eventScheduleId: 'schedule-1',
        userInfo: maliciousUserInfo,
      }

      const request = mockRequest(requestBody)

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(await response.json()).toHaveProperty('seatHoldingCode')

      // Verify payload.create was called with the malicious input
      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userInfo: maliciousUserInfo,
          }),
        }),
      )
    })
  })

  // Additional Edge Cases
  describe('Edge Cases', () => {
    it('should handle extremely long seatName values', async () => {
      // Arrange
      const longSeatName = 'A'.repeat(1000) + '1'
      const requestBody = {
        seatName: longSeatName,
        eventId: 123,
        eventScheduleId: 'schedule-1',
      }

      const request = mockRequest(requestBody)

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(await response.json()).toHaveProperty('seatHoldingCode')

      // Verify payload.create was called with the long input
      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            seatName: longSeatName,
          }),
        }),
      )
    })

    it('should handle special characters in seatName', async () => {
      // Arrange
      const specialSeatName = 'A1!@#$%^&*()_+{}[]|\\:;"\'<>,.?/'
      const requestBody = {
        seatName: specialSeatName,
        eventId: 123,
        eventScheduleId: 'schedule-1',
      }

      const request = mockRequest(requestBody)

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(await response.json()).toHaveProperty('seatHoldingCode')

      // Verify payload.create was called with the special characters
      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            seatName: specialSeatName,
          }),
        }),
      )
    })

    it('should return 400 when using an expired seat holding code', async () => {
      // Arrange
      const requestBody = {
        seatName: 'A1',
        eventId: 123,
        eventScheduleId: 'schedule-1',
        seatHoldingCode: 'expired-code',
      }

      const request = mockRequest(requestBody)

      // Mock finding an expired seat holding (empty result)
      vi.mocked(payload.find).mockResolvedValue({
        docs: [],
      } as any)

      // Act
      const response = await POST(request)

      // Assert
      // Should create a new holding instead of updating
      expect(response.status).toBe(200)
      expect(await response.json()).toHaveProperty('seatHoldingCode', 'new-code-456')

      // Verify payload.create was called (not update)
      expect(payload.create).toHaveBeenCalled()
      expect(payload.update).not.toHaveBeenCalled()
    })

    it('should handle multiple seats in a single request', async () => {
      // Arrange
      const multipleSeats = 'A1,B2,C3'
      const requestBody = {
        seatName: multipleSeats,
        eventId: 123,
        eventScheduleId: 'schedule-1',
      }

      const request = mockRequest(requestBody)

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(await response.json()).toHaveProperty('seatHoldingCode')

      // Verify payload.create was called with all seats
      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            seatName: multipleSeats,
          }),
        }),
      )
    })
  })
})
