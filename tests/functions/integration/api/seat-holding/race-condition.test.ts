import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../../../../../src/app/(payload)/api/seat-holding/seat/route'
import { checkBookedOrPendingPaymentSeats } from '../../../../../src/app/(payload)/api/bank-transfer/order/utils'
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
  headers: vi.fn().mockReturnValue({
    get: vi.fn().mockImplementation((key) => {
      if (key === 'request-ip' || key === 'x-forwarded-for') {
        return '127.0.0.1'
      }
      return null
    }),
  }),
}))

vi.mock('../../../../../src/app/(payload)/api/bank-transfer/order/utils', () => ({
  checkBookedOrPendingPaymentSeats: vi.fn(),
}))

vi.mock('../../../../../src/utilities/handleNextErrorMsgResponse', () => ({
  handleNextErrorMsgResponse: vi.fn().mockResolvedValue('Error message'),
}))

vi.mock('../../../../../src/utilities/generatePassword', () => ({
  generatePassword: vi.fn(),
}))

// Import the mocked modules
import payload from 'payload'

describe('Seat Holding API - Race Conditions', () => {
  // Common test variables
  const mockEvent = {
    id: 123,
    title: 'Test Event',
    schedules: [
      {
        id: 'schedule-1',
        date: '2023-12-01',
      },
    ],
    // Required by Event type
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Event

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
    vi.mocked(payload.create).mockResolvedValue({
      id: 1, // Changed to number to match SeatHolding type
      code: 'new-code',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as SeatHolding)
    vi.mocked(checkBookedOrPendingPaymentSeats).mockResolvedValue([])
    vi.mocked(generatePassword).mockReturnValue('new-code-456')
  })

  it('should handle concurrent requests for the same seat', async () => {
    // Arrange
    const requestBody1 = {
      seatName: 'A1',
      eventId: 123,
      eventScheduleId: 'schedule-1',
    }

    const requestBody2 = {
      seatName: 'A1',
      eventId: 123,
      eventScheduleId: 'schedule-1',
    }

    const request1 = mockRequest(requestBody1)
    const request2 = mockRequest(requestBody2)

    // Simulate race condition by making the first request's find operation take longer
    let findCallCount = 0
    vi.mocked(payload.find).mockImplementation(async () => {
      findCallCount++
      if (findCallCount === 1) {
        // First call - delay and return empty results (no existing holdings)
        await new Promise((resolve) => setTimeout(resolve, 50))
        return {
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
        }
      } else {
        // Second call - return the holding created by the first request
        return {
          docs: [
            {
              id: 1, // Changed to number
              seatName: 'A1',
              code: 'new-code-456',
              event: 123,
              eventScheduleId: 'schedule-1',
              expire_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as unknown as SeatHolding,
          ],
          hasNextPage: false,
          hasPrevPage: false,
          limit: 10,
          totalDocs: 1,
          totalPages: 1,
          page: 1,
          pagingCounter: 1,
          nextPage: null,
          prevPage: null,
        }
      }
    })

    // Act - start both requests almost simultaneously
    const responsePromise1 = POST(request1)
    const responsePromise2 = POST(request2)

    // Wait for both to complete
    const [response1, response2] = await Promise.all([responsePromise1, responsePromise2])
    const responseData1 = await response1.json()
    const responseData2 = await response2.json()

    // Assert
    // First request should succeed
    expect(response1.status).toBe(200)
    expect(responseData1).toHaveProperty('seatHoldingCode', 'new-code-456')

    // Second request should fail with seat already held error
    expect(response2.status).toBe(400)
    expect(responseData2).toHaveProperty('message')

    // Verify payload.create was called only once
    expect(payload.create).toHaveBeenCalledTimes(1)
  })

  it('should handle concurrent requests for different seats', async () => {
    // Arrange
    const requestBody1 = {
      seatName: 'A1',
      eventId: 123,
      eventScheduleId: 'schedule-1',
    }

    const requestBody2 = {
      seatName: 'B2',
      eventId: 123,
      eventScheduleId: 'schedule-1',
    }

    const request1 = mockRequest(requestBody1)
    const request2 = mockRequest(requestBody2)

    // Generate different codes for each request
    vi.mocked(generatePassword).mockImplementationOnce(() => 'code-for-A1')
    vi.mocked(generatePassword).mockImplementationOnce(() => 'code-for-B2')

    // Act - start both requests almost simultaneously
    const responsePromise1 = POST(request1)
    const responsePromise2 = POST(request2)

    // Wait for both to complete
    const [response1, response2] = await Promise.all([responsePromise1, responsePromise2])
    const responseData1 = await response1.json()
    const responseData2 = await response2.json()

    // Assert
    // Both requests should succeed
    expect(response1.status).toBe(200)
    expect(responseData1).toHaveProperty('seatHoldingCode', 'code-for-A1')

    expect(response2.status).toBe(200)
    expect(responseData2).toHaveProperty('seatHoldingCode', 'code-for-B2')

    // Verify payload.create was called twice with different seat names
    expect(payload.create).toHaveBeenCalledTimes(2)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          seatName: 'A1',
        }),
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          seatName: 'B2',
        }),
      }),
    )
  })
})
