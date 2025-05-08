import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import { createAdminFactory } from '../functions/factories'
import { mockPayload } from '../functions/mocks/payload'

// Mock the payload module
vi.mock('payload', () => ({
  default: mockPayload(),
}))

// Import the mocked module
import payload from 'payload'

describe('API Endpoints', () => {
  let app: express.Application
  let adminToken: string

  beforeAll(async () => {
    // Create an Express app for testing
    app = express()

    // Mock the payload.login method to return a token
    const mockAdmin = createAdminFactory({ email: 'admin@example.com' })
    vi.mocked(payload.login).mockResolvedValue({
      user: mockAdmin,
      token: 'mock-jwt-token',
      exp: Date.now() + 3600000, // 1 hour from now
    })

    // Login to get a token
    const loginResponse = await payload.login({
      collection: 'admins',
      data: {
        email: 'admin@example.com',
        password: 'password',
      },
    })

    adminToken = loginResponse.token as string

    // Set up routes for testing
    app.use(express.json())

    // Mock route for getting events
    app.get('/api/events', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      return res.json({
        docs: [
          { id: 1, name: 'Test Event 1', status: 'published' },
          { id: 2, name: 'Test Event 2', status: 'draft' },
        ],
      })
    })

    // Mock route for creating an event
    app.post('/api/events', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      return res.status(201).json({
        id: 3,
        ...req.body,
      })
    })
  })

  it('should return events when authenticated', async () => {
    // Act
    const response = await request(app).get('/api/events').set('Authorization', `JWT ${adminToken}`)

    // Assert
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('docs')
    expect(response.body.docs).toHaveLength(2)
  })

  it('should return 401 when not authenticated', async () => {
    // Act
    const response = await request(app).get('/api/events')

    // Assert
    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error', 'Unauthorized')
  })

  it('should create an event when authenticated', async () => {
    // Arrange
    const newEvent = {
      name: 'New Test Event',
      status: 'draft',
    }

    // Act
    const response = await request(app)
      .post('/api/events')
      .set('Authorization', `JWT ${adminToken}`)
      .send(newEvent)

    // Assert
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id', 3)
    expect(response.body).toHaveProperty('name', 'New Test Event')
    expect(response.body).toHaveProperty('status', 'draft')
  })
})
