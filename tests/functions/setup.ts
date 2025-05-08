import { config } from 'dotenv'
import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { setupServer } from 'msw/node'

// Load environment variables from .env file
config({ path: '.env.test' })

// Set up environment variables for testing if they're not already set in .env.test
process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'test-secret'
// Use the DATABASE_URI from .env.test which is already loaded
// process.env.DATABASE_URI is already set to postgres://postgres:123456a%40@127.0.0.1:5432/orchestars_local_test
process.env.NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Create MSW server for mocking HTTP requests
export const server = setupServer()

// Set up global test hooks
beforeAll(() => {
  // Start the MSW server
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  // Reset MSW handlers between tests
  server.resetHandlers()
  // Clear all mocks between tests
  vi.clearAllMocks()
})

afterAll(() => {
  // Close the MSW server when tests are done
  server.close()
})
