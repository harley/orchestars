import { describe, it, expect, vi } from 'vitest'
import { mockPayloadRequest, mockPayload } from '../../mocks/payload'
import { createAdminFactory, createUserFactory } from '../../factories'

describe('PayloadCMS Request Mocking', () => {
  it('should create a default mock request', () => {
    // Act
    const req = mockPayloadRequest()

    // Assert
    expect(req).toHaveProperty('payload')
    expect(req).toHaveProperty('user', null)
    expect(req).toHaveProperty('method', 'GET')
    expect(req).toHaveProperty('headers')
    expect(req).toHaveProperty('cookies')
    expect(req).toHaveProperty('ip', '127.0.0.1')
  })

  it('should allow overriding properties', () => {
    // Arrange
    const mockUser = createAdminFactory({ role: 'super-admin' })

    // Act
    const req = mockPayloadRequest({
      user: mockUser,
      method: 'POST',
      path: '/api/users',
      body: { email: 'test@example.com' },
    })

    // Assert
    expect(req.user).toBe(mockUser)
    expect(req.method).toBe('POST')
    expect(req.path).toBe('/api/users')
    expect(req.body).toEqual({ email: 'test@example.com' })
  })

  it('should provide mock methods for API operations', async () => {
    // Arrange
    const mockUser = createUserFactory()
    const req = mockPayloadRequest()

    // Mock return values
    req.findByID.mockResolvedValue(mockUser)
    req.create.mockResolvedValue(mockUser)

    // Act & Assert
    await expect(req.findByID({ collection: 'users', id: '1' })).resolves.toBe(mockUser)
    await expect(
      req.create({ collection: 'users', data: { email: 'test@example.com' } }),
    ).resolves.toBe(mockUser)

    expect(req.findByID).toHaveBeenCalledWith({ collection: 'users', id: '1' })
    expect(req.create).toHaveBeenCalledWith({
      collection: 'users',
      data: { email: 'test@example.com' },
    })
  })

  it('should provide mock response methods', () => {
    // Arrange
    const req = mockPayloadRequest()

    // Act
    req.res.status(404)
    req.res.json({ error: 'Not found' })

    // Assert
    expect(req.res.status).toHaveBeenCalledWith(404)
    expect(req.res.json).toHaveBeenCalledWith({ error: 'Not found' })
  })

  it('should allow mocking deeply nested payload methods', async () => {
    // Arrange
    const payload = mockPayload()
    const mockUser = createUserFactory()

    // Set up mock implementation
    payload.find.mockResolvedValue({
      docs: [mockUser],
      hasNextPage: false,
      hasPrevPage: false,
      limit: 1,
      nextPage: null,
      page: 1,
      pagingCounter: 1,
      prevPage: null,
      totalDocs: 1,
      totalPages: 1,
    })

    const req = mockPayloadRequest({
      payload,
    })

    // Act
    const result = await req.payload.find({ collection: 'users' })

    // Assert
    // The result should include all the pagination properties
    expect(result).toEqual({
      docs: [mockUser],
      hasNextPage: false,
      hasPrevPage: false,
      limit: 1,
      nextPage: null,
      page: 1,
      pagingCounter: 1,
      prevPage: null,
      totalDocs: 1,
      totalPages: 1,
    })
    expect(payload.find).toHaveBeenCalledWith({ collection: 'users' })
  })
})
