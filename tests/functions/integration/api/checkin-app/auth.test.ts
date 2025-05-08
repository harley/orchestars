import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { POST } from '../../../../../src/app/(payload)/api/checkin-app/auth/route'
import { createAdminFactory } from '../../../factories'

// Mock the getPayload function
vi.mock('../../../../../src/payload-config/getPayloadConfig', () => ({
  getPayload: vi.fn(),
}))

// Mock the isAdminOrSuperAdminOrEventAdmin function
vi.mock('../../../../../src/access/isAdminOrSuperAdmin', () => ({
  isAdminOrSuperAdminOrEventAdmin: vi.fn(),
}))

// Mock the cookies function
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Import the mocked modules
import { getPayload } from '../../../../../src/payload-config/getPayloadConfig'
import { isAdminOrSuperAdminOrEventAdmin } from '../../../../../src/access/isAdminOrSuperAdmin'
import { cookies } from 'next/headers'

describe('Checkin App Auth API', () => {
  // Setup common test variables
  const mockAdmin = createAdminFactory({
    email: 'admin@example.com',
    role: 'admin',
  })

  const mockToken = 'mock-jwt-token'
  const mockCookieStore = {
    set: vi.fn(),
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()

    // Setup default mock implementations
    vi.mocked(getPayload).mockResolvedValue({
      login: vi.fn().mockResolvedValue({
        user: mockAdmin,
        token: mockToken,
      }),
    } as any)

    vi.mocked(isAdminOrSuperAdminOrEventAdmin).mockReturnValue(true)
    vi.mocked(cookies).mockReturnValue(mockCookieStore as any)
  })

  it('should successfully authenticate with valid admin credentials', async () => {
    // Arrange
    const requestBody = {
      email: 'admin@example.com',
      password: 'password123',
    }

    const request = new NextRequest('http://localhost:3000/api/checkin-app/auth', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(responseData).toEqual({
      token: mockToken,
      user: mockAdmin,
    })

    // Verify payload.login was called with correct parameters
    const mockPayload = await getPayload()
    expect(mockPayload.login).toHaveBeenCalledWith({
      collection: 'admins',
      data: {
        email: requestBody.email,
        password: requestBody.password,
      },
    })

    // Verify cookie was set
    expect(cookies).toHaveBeenCalled()
    expect(mockCookieStore.set).toHaveBeenCalledWith('payload-token', mockToken, {
      maxAge: 60 * 60 * 24 * 1, // 1 day
      httpOnly: true,
      secure: false, // process.env.NODE_ENV !== 'production'
    })
  })

  it('should return 400 when email or password is missing', async () => {
    // Arrange - Missing password
    const requestWithoutPassword = new NextRequest('http://localhost:3000/api/checkin-app/auth', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@example.com' }),
    })

    // Act
    const response = await POST(requestWithoutPassword)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(responseData).toEqual({ error: 'Email and password are required' })

    // Verify payload.login was not called
    const mockPayload = await getPayload()
    expect(mockPayload.login).not.toHaveBeenCalled()
  })

  it('should return 401 when credentials are invalid', async () => {
    // Arrange
    vi.mocked(getPayload).mockResolvedValue({
      login: vi.fn().mockResolvedValue({
        user: null, // No user found with these credentials
        token: null,
      }),
    } as any)

    const request = new NextRequest('http://localhost:3000/api/checkin-app/auth', {
      method: 'POST',
      body: JSON.stringify({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      }),
    })

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(responseData).toEqual({ error: 'Invalid credentials' })
  })

  it('should return 403 when user does not have required role', async () => {
    // Arrange
    vi.mocked(isAdminOrSuperAdminOrEventAdmin).mockReturnValue(false)

    const request = new NextRequest('http://localhost:3000/api/checkin-app/auth', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
    })

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(403)
    expect(responseData).toEqual({
      error: 'Unauthorized access. Only event admins can access the check-in app.',
    })

    // Verify cookie was not set
    expect(mockCookieStore.set).not.toHaveBeenCalled()
  })

  it('should handle unexpected errors gracefully', async () => {
    // Arrange
    const errorMessage = 'Database connection error'
    vi.mocked(getPayload).mockRejectedValue(new Error(errorMessage))

    const request = new NextRequest('http://localhost:3000/api/checkin-app/auth', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123',
      }),
    })

    // Act
    const response = await POST(request)
    const responseData = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(responseData).toEqual({
      error: 'Authentication failed',
      details: errorMessage,
    })
  })
})
