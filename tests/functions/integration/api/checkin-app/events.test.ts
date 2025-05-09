import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import { GET } from '../../../../../src/app/(payload)/api/checkin-app/events/route'
import { createAdminFactory } from '../../../factories'

// Mock the getPayload function
vi.mock('../../../../../src/payload-config/getPayloadConfig', () => ({
  getPayload: vi.fn(),
}))

// Mock the headers function
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

// Import the mocked modules
import { getPayload } from '../../../../../src/payload-config/getPayloadConfig'
import { headers } from 'next/headers'

describe('Checkin App Events API', () => {
  // Setup common test variables
  const mockAdmin = createAdminFactory({
    email: 'admin@example.com',
    role: 'admin',
  })

  const mockEvents = [
    {
      id: 1,
      title: 'Test Event 1',
      eventLocation: 'Test Location 1',
      startDatetime: '2023-01-01T10:00:00.000Z',
      endDatetime: '2023-01-01T12:00:00.000Z',
      schedules: [
        {
          id: 'schedule-1',
          date: '2023-01-01',
          details: [
            {
              time: '10:00',
              name: 'Opening',
              description: 'Opening ceremony',
            },
          ],
        },
      ],
    },
    {
      id: 2,
      title: 'Test Event 2',
      eventLocation: 'Test Location 2',
      startDatetime: '2023-01-02T10:00:00.000Z',
      endDatetime: '2023-01-02T12:00:00.000Z',
      schedules: [
        {
          id: 'schedule-2',
          date: '2023-01-02',
          details: [
            {
              time: '10:00',
              name: 'Opening',
              description: 'Opening ceremony',
            },
          ],
        },
      ],
    },
  ]

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()

    // Setup default mock implementations
    vi.mocked(headers).mockReturnValue({
      get: vi.fn().mockReturnValue('Bearer mock-token'),
    } as any)

    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockAdmin }),
      find: vi.fn().mockResolvedValue({
        docs: mockEvents,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 50,
        totalDocs: mockEvents.length,
        totalPages: 1,
      }),
    } as any)
  })

  it('should successfully retrieve events when authenticated', async () => {
    // Act
    const response = await GET()
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(responseData).toHaveProperty('events')
    expect(responseData.events.docs).toHaveLength(2)
    
    // Verify payload.find was called with correct parameters
    const mockPayload = await getPayload()
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: 'events',
      where: {
        status: {
          equals: 'published_open_sales',
        },
      },
      limit: 50,
      select: {
        id: true,
        title: true,
        eventLocation: true,
        startDatetime: true,
        endDatetime: true,
        schedules: {
          id: true,
          date: true,
          details: {
            time: true,
            name: true,
            description: true,
          },
        },
      },
    })
  })

  it('should return 401 when user is not authenticated', async () => {
    // Arrange
    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: null }),
      find: vi.fn(),
    } as any)

    // Act
    const response = await GET()
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(responseData).toEqual({ error: 'Unauthorized - Invalid admin user' })
    
    // Verify payload.find was not called
    const mockPayload = await getPayload()
    expect(mockPayload.find).not.toHaveBeenCalled()
  })

  it('should return 404 when no events are found', async () => {
    // Arrange
    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockAdmin }),
      find: vi.fn().mockResolvedValue({
        docs: [],
        hasNextPage: false,
        hasPrevPage: false,
        limit: 50,
        totalDocs: 0,
        totalPages: 0,
      }),
    } as any)

    // Act
    const response = await GET()
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(responseData).toEqual({ error: 'No event is found' })
  })

  it('should handle unexpected errors gracefully', async () => {
    // Arrange
    const errorMessage = 'Database connection error'
    vi.mocked(getPayload).mockRejectedValue(new Error(errorMessage))

    // Act
    let response: NextResponse
    let error: any
    
    try {
      response = await GET()
    } catch (e) {
      error = e
    }

    // Assert
    expect(error).toBeDefined()
    expect(error.message).toBe(errorMessage)
  })
})
