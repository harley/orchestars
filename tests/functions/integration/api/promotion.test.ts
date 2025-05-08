import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { server } from '../../setup'
import { http, HttpResponse } from 'msw'
import type { Promotion } from '../../../../src/payload-types'

// Mock the payload module
vi.mock('payload', () => ({
  default: {
    init: vi.fn(),
    find: vi.fn(),
  },
}))

// Mock the config import
vi.mock('@payload-config', () => ({
  default: {
    // Add any required config properties here
    collections: {},
    globals: {},
  },
}))

// Import the mocked modules
import payload from 'payload'

// Import the handler to test
import { GET } from '../../../../src/app/(payload)/api/promotion/route'

describe('Promotion API', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return active promotions for an event', async () => {
    // Arrange
    const mockPromotions = [
      {
        id: 1,
        code: 'SUMMER10',
        perUserLimit: 1,
        discountType: 'percentage',
        discountValue: 10,
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T23:59:59.999Z',
        conditions: {},
        appliedTicketClasses: [],
        discountApplyScope: 'total_order_value',
        maxRedemptions: 100,
        status: 'active',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      } as Promotion,
    ]

    // Mock the payload.find method
    vi.mocked(payload.find).mockResolvedValue({
      docs: mockPromotions,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10,
      nextPage: null,
      page: 1,
      pagingCounter: 1,
      prevPage: null,
      totalDocs: 1,
      totalPages: 1,
    })

    // Create a mock request
    const request = new NextRequest('http://localhost:3000/api/promotion?eventId=1')

    // Act
    const response = await GET(request, {})

    // Assert
    expect(payload.init).toHaveBeenCalled()
    expect(payload.find).toHaveBeenCalledWith({
      collection: 'promotions',
      limit: 10,
      where: {
        event: { equals: 1 },
        status: { equals: 'active' },
        startDate: { less_than_equal: expect.any(String) },
        endDate: { greater_than_equal: expect.any(String) },
        isPrivate: { equals: false },
      },
      select: {
        id: true,
        code: true,
        appliedTicketClasses: true,
        perUserLimit: true,
        discountType: true,
        discountValue: true,
        startDate: true,
        endDate: true,
        conditions: true,
        discountApplyScope: true,
      },
    })

    const responseData = await response.json()
    expect(responseData).toEqual(mockPromotions)
  })

  it('should handle errors gracefully', async () => {
    // Arrange
    const errorMessage = 'Database connection error'
    vi.mocked(payload.find).mockRejectedValue(new Error(errorMessage))

    // Create a mock request
    const request = new NextRequest('http://localhost:3000/api/promotion?eventId=1')

    // Act
    const response = await GET(request, {})

    // Assert
    // The actual implementation returns an empty array with status 200 on error
    expect(response.status).toBe(200)
    const responseData = await response.json()
    expect(responseData).toEqual([])
  })
})
