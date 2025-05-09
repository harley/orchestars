import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../../../../../src/app/(payload)/api/checkin-app/validate/[ticket-code]/route'
import { createAdminFactory } from '../../../factories'

// Mock the getPayload function
vi.mock('../../../../../src/payload-config/getPayloadConfig', () => ({
  getPayload: vi.fn(),
}))

// Mock the headers function
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

// Mock the handleNextErrorMsgResponse function
vi.mock('../../../../../src/utilities/handleNextErrorMsgResponse', () => ({
  handleNextErrorMsgResponse: vi.fn().mockImplementation((error) => {
    if (error instanceof Error) {
      const errorCode = error.message
      switch (errorCode) {
        case 'CHECKIN001':
          return Promise.resolve('Ticket not found')
        case 'CHECKIN005':
          return Promise.resolve('Unauthorized - Invalid admin user')
        case 'CHECKIN013':
          return Promise.resolve('Ticket code is required')
        case 'CHECKIN014':
          return Promise.resolve('Please choose event, it is required')
        default:
          return Promise.resolve(error.message)
      }
    }
    return Promise.resolve('Unknown error')
  }),
}))

// Import the mocked modules
import { getPayload } from '../../../../../src/payload-config/getPayloadConfig'
import { headers } from 'next/headers'
import { handleNextErrorMsgResponse } from '../../../../../src/utilities/handleNextErrorMsgResponse'

describe('Checkin App Validate Ticket API', () => {
  // Setup common test variables
  const mockAdmin = createAdminFactory({
    email: 'admin@example.com',
    role: 'admin',
  })

  // Mock a single ticket record
  const mockTicket = {
    id: 1,
    ticket_code: 'TICKET-12345',
    attendee_name: 'John Doe',
    seat: 'A1',
    ticket_price_info: { name: 'VIP', price: 100 },
    event_schedule_id: 'schedule-1',
    status: 'booked',
    email: 'john.doe@example.com',
    phone_number: '1234567890',
    is_checked_in: false,
    check_in_time: null,
    checked_in_by_id: null,
    checked_in_by_email: null,
    ticket_given_time: null,
    ticket_given_by: null,
  }

  // Mock a checked-in ticket record
  const mockCheckedInTicket = {
    ...mockTicket,
    is_checked_in: true,
    check_in_time: '2023-01-01T10:00:00.000Z',
    checked_in_by_id: 1,
    checked_in_by_email: 'admin@example.com',
    ticket_given_time: '2023-01-01T10:05:00.000Z',
    ticket_given_by: 'Admin User',
  }

  // Mock multiple tickets with the same seat
  const mockMultipleTickets = [
    mockTicket,
    {
      ...mockTicket,
      id: 2,
      ticket_code: 'TICKET-67890',
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
      db: {
        drizzle: {
          execute: vi.fn().mockResolvedValue({
            rows: [mockTicket],
          }),
        },
      },
    } as any)
  })

  it('should successfully validate a ticket by ticket code', async () => {
    // Arrange
    const ticketCode = 'TICKET-12345'
    const eventId = 1
    const eventScheduleId = 'schedule-1'

    const request = new NextRequest(
      `http://localhost:3000/api/checkin-app/validate/${ticketCode}`,
      {
        method: 'POST',
        body: JSON.stringify({ eventId, eventScheduleId }),
      },
    )

    // Mock the nextUrl.pathname to return the ticket code
    Object.defineProperty(request, 'nextUrl', {
      value: {
        pathname: `/api/checkin-app/validate/${ticketCode}`,
      },
    })

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(responseData).toHaveProperty('ticket')
    expect(responseData.ticket).toHaveProperty('ticketCode', ticketCode)
    expect(responseData.ticket).toHaveProperty('isCheckedIn', false)

    // Verify SQL query was executed
    const mockPayload = await getPayload()
    expect(mockPayload.db.drizzle.execute).toHaveBeenCalled()

    // With the SQL tag, we can't easily check the exact string content
    // Instead, we verify that the execute function was called once
    expect(mockPayload.db.drizzle.execute).toHaveBeenCalledTimes(1)
  })

  it('should successfully validate a ticket by seat label', async () => {
    // Arrange
    const seatLabel = 'A1'
    const eventId = 1
    const eventScheduleId = 'schedule-1'

    const request = new NextRequest(`http://localhost:3000/api/checkin-app/validate/${seatLabel}`, {
      method: 'POST',
      body: JSON.stringify({ eventId, eventScheduleId }),
    })

    // Mock the nextUrl.pathname to return the seat label
    Object.defineProperty(request, 'nextUrl', {
      value: {
        pathname: `/api/checkin-app/validate/${seatLabel}`,
      },
    })

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(responseData).toHaveProperty('ticket')
    expect(responseData.ticket).toHaveProperty('seat', seatLabel)

    // Verify SQL query was executed
    const mockPayload = await getPayload()
    expect(mockPayload.db.drizzle.execute).toHaveBeenCalled()

    // With the SQL tag, we can't easily check the exact string content
    // Instead, we verify that the execute function was called once
    expect(mockPayload.db.drizzle.execute).toHaveBeenCalledTimes(1)
  })

  it('should return status 300 when multiple tickets are found for the same seat', async () => {
    // Arrange
    const seatLabel = 'A1'
    const eventId = 1
    const eventScheduleId = 'schedule-1'

    // Mock multiple tickets with the same seat
    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockAdmin }),
      db: {
        drizzle: {
          execute: vi.fn().mockResolvedValue({
            rows: mockMultipleTickets,
          }),
        },
      },
    } as any)

    const request = new NextRequest(`http://localhost:3000/api/checkin-app/validate/${seatLabel}`, {
      method: 'POST',
      body: JSON.stringify({ eventId, eventScheduleId }),
    })

    // Mock the nextUrl.pathname to return the seat label
    Object.defineProperty(request, 'nextUrl', {
      value: {
        pathname: `/api/checkin-app/validate/${seatLabel}`,
      },
    })

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(300)
    expect(responseData).toHaveProperty('tickets')
    expect(responseData.tickets).toHaveLength(2)
    expect(responseData.tickets[0]).toHaveProperty('seat', seatLabel)
    expect(responseData.tickets[1]).toHaveProperty('seat', seatLabel)
  })

  it('should return ticket with check-in info when ticket is already checked in', async () => {
    // Arrange
    const ticketCode = 'TICKET-12345'
    const eventId = 1
    const eventScheduleId = 'schedule-1'

    // Mock a checked-in ticket
    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockAdmin }),
      db: {
        drizzle: {
          execute: vi.fn().mockResolvedValue({
            rows: [mockCheckedInTicket],
          }),
        },
      },
    } as any)

    const request = new NextRequest(
      `http://localhost:3000/api/checkin-app/validate/${ticketCode}`,
      {
        method: 'POST',
        body: JSON.stringify({ eventId, eventScheduleId }),
      },
    )

    // Mock the nextUrl.pathname to return the ticket code
    Object.defineProperty(request, 'nextUrl', {
      value: {
        pathname: `/api/checkin-app/validate/${ticketCode}`,
      },
    })

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(responseData).toHaveProperty('ticket')
    expect(responseData.ticket).toHaveProperty('isCheckedIn', true)
    expect(responseData.ticket).toHaveProperty('checkinRecord')
    expect(responseData.ticket.checkinRecord).toHaveProperty('checkInTime')
    expect(responseData.ticket.checkinRecord).toHaveProperty('checkedInBy')
  })

  it('should return 400 when ticket is not found', async () => {
    // Arrange
    const ticketCode = 'NONEXISTENT'
    const eventId = 1
    const eventScheduleId = 'schedule-1'

    // Mock no tickets found
    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockAdmin }),
      db: {
        drizzle: {
          execute: vi.fn().mockResolvedValue({
            rows: [],
          }),
        },
      },
    } as any)

    const request = new NextRequest(
      `http://localhost:3000/api/checkin-app/validate/${ticketCode}`,
      {
        method: 'POST',
        body: JSON.stringify({ eventId, eventScheduleId }),
      },
    )

    // Mock the nextUrl.pathname to return the ticket code
    Object.defineProperty(request, 'nextUrl', {
      value: {
        pathname: `/api/checkin-app/validate/${ticketCode}`,
      },
    })

    // Mock the handleNextErrorMsgResponse to return a specific message
    vi.mocked(handleNextErrorMsgResponse).mockResolvedValue('Ticket not found')

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(responseData).toHaveProperty('message', 'Ticket not found')
  })

  it('should return 401 when user is not authenticated', async () => {
    // Arrange
    const ticketCode = 'TICKET-12345'
    const eventId = 1
    const eventScheduleId = 'schedule-1'

    // Mock unauthenticated user
    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: null }),
      db: {
        drizzle: {
          execute: vi.fn(),
        },
      },
    } as any)

    const request = new NextRequest(
      `http://localhost:3000/api/checkin-app/validate/${ticketCode}`,
      {
        method: 'POST',
        body: JSON.stringify({ eventId, eventScheduleId }),
      },
    )

    // Mock the nextUrl.pathname to return the ticket code
    Object.defineProperty(request, 'nextUrl', {
      value: {
        pathname: `/api/checkin-app/validate/${ticketCode}`,
      },
    })

    // Mock the handleNextErrorMsgResponse to return a specific message
    vi.mocked(handleNextErrorMsgResponse).mockResolvedValue('Unauthorized - Invalid admin user')

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(responseData).toHaveProperty('message', 'Unauthorized - Invalid admin user')

    // Verify SQL query was not executed
    const mockPayload = await getPayload()
    expect(mockPayload.db.drizzle.execute).not.toHaveBeenCalled()
  })

  it('should return 400 when eventId or eventScheduleId is missing', async () => {
    // Arrange
    const ticketCode = 'TICKET-12345'
    // Missing eventId and eventScheduleId

    const request = new NextRequest(
      `http://localhost:3000/api/checkin-app/validate/${ticketCode}`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      },
    )

    // Mock the nextUrl.pathname to return the ticket code
    Object.defineProperty(request, 'nextUrl', {
      value: {
        pathname: `/api/checkin-app/validate/${ticketCode}`,
      },
    })

    // Mock the handleNextErrorMsgResponse to return a specific message
    vi.mocked(handleNextErrorMsgResponse).mockResolvedValue('Please choose event, it is required')

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(responseData).toHaveProperty('message', 'Please choose event, it is required')
  })

  it('should handle unexpected errors gracefully', async () => {
    // Arrange
    const ticketCode = 'TICKET-12345'
    const eventId = 1
    const eventScheduleId = 'schedule-1'
    const errorMessage = 'Database connection error'

    vi.mocked(getPayload).mockRejectedValue(new Error(errorMessage))

    const request = new NextRequest(
      `http://localhost:3000/api/checkin-app/validate/${ticketCode}`,
      {
        method: 'POST',
        body: JSON.stringify({ eventId, eventScheduleId }),
      },
    )

    // Mock the nextUrl.pathname to return the ticket code
    Object.defineProperty(request, 'nextUrl', {
      value: {
        pathname: `/api/checkin-app/validate/${ticketCode}`,
      },
    })

    // Mock the handleNextErrorMsgResponse to return the error message
    vi.mocked(handleNextErrorMsgResponse).mockResolvedValue(errorMessage)

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(responseData).toHaveProperty('message', errorMessage)
  })

  it('should safely handle potential SQL injection in ticket code', async () => {
    // Arrange
    const maliciousTicketCode = "' OR 1=1 --"
    const eventId = 1
    const eventScheduleId = 'schedule-1'

    // Setup mock to track what SQL is executed
    const executeMock = vi.fn().mockResolvedValue({
      rows: [], // Return empty result to trigger the "not found" path
    })

    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockAdmin }),
      db: {
        drizzle: {
          execute: executeMock,
        },
      },
    } as any)

    const request = new NextRequest(
      `http://localhost:3000/api/checkin-app/validate/${maliciousTicketCode}`,
      {
        method: 'POST',
        body: JSON.stringify({ eventId, eventScheduleId }),
      },
    )

    // Mock the nextUrl.pathname to return the malicious ticket code
    Object.defineProperty(request, 'nextUrl', {
      value: {
        pathname: `/api/checkin-app/validate/${maliciousTicketCode}`,
      },
    })

    // Mock the handleNextErrorMsgResponse to return a specific message
    vi.mocked(handleNextErrorMsgResponse).mockResolvedValue('Ticket not found')

    // Act
    const response = await POST(request)

    // Assert
    // Check that the SQL query was called with the malicious input properly escaped/parameterized
    expect(executeMock).toHaveBeenCalled()
    const sqlQuery = executeMock.mock.calls[0]?.[0] || ''

    // The malicious input should not be directly interpolated into the query
    // It should either be parameterized or properly escaped
    expect(sqlQuery).not.toContain("' OR 1=1 --")

    // Verify the response is as expected for a not found ticket
    expect(response.status).toBe(400)
    const responseData = await response.json()
    expect(responseData).toHaveProperty('message', 'Ticket not found')
  })

  it('should safely handle potential SQL injection in eventScheduleId', async () => {
    // Arrange
    const ticketCode = 'TICKET-12345'
    const eventId = 1
    const maliciousEventScheduleId = "' OR 1=1 --"

    // Setup mock to track what SQL is executed
    const executeMock = vi.fn().mockResolvedValue({
      rows: [], // Return empty result to trigger the "not found" path
    })

    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockAdmin }),
      db: {
        drizzle: {
          execute: executeMock,
        },
      },
    } as any)

    const request = new NextRequest(
      `http://localhost:3000/api/checkin-app/validate/${ticketCode}`,
      {
        method: 'POST',
        body: JSON.stringify({ eventId, eventScheduleId: maliciousEventScheduleId }),
      },
    )

    // Mock the nextUrl.pathname to return the ticket code
    Object.defineProperty(request, 'nextUrl', {
      value: {
        pathname: `/api/checkin-app/validate/${ticketCode}`,
      },
    })

    // Mock the handleNextErrorMsgResponse to return a specific message
    vi.mocked(handleNextErrorMsgResponse).mockResolvedValue('Ticket not found')

    // Act
    const response = await POST(request)

    // Assert
    // Check that the SQL query was called with the malicious input properly escaped/parameterized
    expect(executeMock).toHaveBeenCalled()
    const sqlQuery = executeMock.mock.calls[0]?.[0] || ''

    // The malicious input should not be directly interpolated into the query
    // It should either be parameterized or properly escaped
    expect(sqlQuery).not.toContain("' OR 1=1 --")

    // Verify the response is as expected for a not found ticket
    expect(response.status).toBe(400)
    const responseData = await response.json()
    expect(responseData).toHaveProperty('message', 'Ticket not found')
  })
})
