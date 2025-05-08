# Testing Setup for PayloadCMS

This guide provides a comprehensive overview of how to use Vitest and Playwright for testing PayloadCMS applications.

## Table of Contents

- [Installation](#installation)
  - [Vitest Installation](#vitest-installation)
  - [Playwright Installation](#playwright-installation)
- [Configuration](#configuration)
  - [Vitest Configuration](#vitest-configuration)
  - [Playwright Configuration](#playwright-configuration)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
  - [Running Vitest Tests](#running-vitest-tests)
  - [Running Playwright Tests](#running-playwright-tests)
- [Writing Tests](#writing-tests)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
  - [End-to-End Tests with Vitest](#end-to-end-tests-with-vitest)
  - [End-to-End Tests with Playwright](#end-to-end-tests-with-playwright)
- [Mocking PayloadCMS](#mocking-payloadcms)
- [Test Factories](#test-factories)
- [Environment Variables](#environment-variables)
- [Coverage Reports](#coverage-reports)
- [Best Practices](#best-practices)
- [Handling Conflicts Between Vitest and Playwright](#handling-conflicts-between-vitest-and-playwright)

## Installation

### Vitest Installation

To set up Vitest for your PayloadCMS project, install the following dependencies:

```bash
pnpm add -D vitest @vitest/coverage-v8 @vitest/ui vite-tsconfig-paths @faker-js/faker supertest vitest-mock-extended dotenv msw
```

### Playwright Installation

To set up Playwright for end-to-end testing, install the following dependencies:

```bash
pnpm add -D @playwright/test
```

Then install the Playwright browsers:

```bash
npx playwright install
```

## Configuration

### Vitest Configuration

Create a `vitest.config.ts` file in your project root:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath } from 'url'
import path from 'path'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/functions/setup.ts'],
    include: ['./tests/functions/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '.next/',
        'src/payload-types.ts',
        'src/migrations/',
      ],
    },
    alias: {
      '@': path.resolve(dirname, './src'),
      '@payload-config': path.resolve(dirname, './src/payload.config.ts'),
    },
  },
})
```

### Playwright Configuration

Create a `playwright.config.ts` file in your project root:

```typescript
import { defineConfig, devices } from '@playwright/test'

// This prevents conflicts with Vitest's expect
process.env.PLAYWRIGHT_SKIP_EXPECT_OVERRIDE = '1'

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: ['./tests/functions/**', '**/playwright-setup.ts'],
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
})
```

Create a test setup file at `tests/functions/setup.ts`:

```typescript
import { config } from 'dotenv'
import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { setupServer } from 'msw/node'

// Load environment variables from .env.test file
config({ path: '.env.test' })

// Set up environment variables for testing
process.env.PAYLOAD_SECRET = 'test-secret'
process.env.DATABASE_URI = 'postgres://postgres:postgres@localhost:5432/test_db'
process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3000'

// Create MSW server for mocking HTTP requests
export const server = setupServer()

// Set up global test hooks
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
})
```

Create a `.env.test` file for test-specific environment variables:

```
# Test environment variables
PAYLOAD_SECRET=test-secret
DATABASE_URI=postgres://postgres:postgres@localhost:5432/test_db
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

Update your `package.json` to include test scripts:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

## Test Structure

Organize your tests in a structured way:

```
tests/
├── e2e/                 # End-to-end tests with Playwright
│   ├── self-page/       # Tests for the self page
│   │   ├── basic.spec.ts       # Basic page tests
│   │   ├── debug.spec.ts       # Debug tests
│   │   ├── mobile.spec.ts      # Mobile-specific tests
│   │   └── self-page.spec.ts   # Main page tests
│   ├── api.test.ts      # API tests with Playwright
│   └── playwright-setup.ts # Playwright setup utilities
├── functions/           # Tests with Vitest
│   ├── factories/       # Test data factories
│   ├── integration/     # Integration tests
│   │   └── api/         # API integration tests
│   ├── mocks/           # Mock implementations
│   ├── setup.ts         # Global test setup for Vitest
│   └── unit/            # Unit tests
│       ├── access/      # Access control tests
│       ├── fields/      # Field validation tests
│       └── hooks/       # Hook tests
```

## Running Tests

### Running Vitest Tests

Run Vitest tests using the following commands:

```bash
# Run all Vitest tests once
pnpm test

# Run tests in watch mode (for development)
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage

# Run a specific test file
pnpm test tests/functions/unit/fields/formatSlug.test.ts
```

### Running Playwright Tests

Run Playwright tests using the following commands:

```bash
# Run all Playwright tests
pnpm test:e2e

# Run tests with UI
pnpm test:e2e:ui

# Run tests in debug mode
pnpm test:e2e:debug

# Run a specific test file
pnpm test:e2e tests/e2e/self-page/basic.spec.ts

# Run all self-page tests
pnpm test:e2e:self-page

# View the Playwright test report
pnpm test:e2e:report
```

## Writing Tests

### Unit Tests

Unit tests focus on testing individual functions, hooks, or components in isolation.

#### Testing Hooks

```typescript
// tests/unit/hooks/revalidateHeader.test.ts
import { describe, it, expect, vi } from 'vitest'
import { revalidateHeader } from '../../../src/Header/hooks/revalidateHeader'
import { mockHookArgs } from '../../mocks/payload'

// Mock the next/cache module
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

import { revalidateTag } from 'next/cache'

describe('revalidateHeader hook', () => {
  it('should revalidate the header tag', () => {
    // Arrange
    const doc = { id: 1, title: 'Test Header' }
    const args = mockHookArgs({
      doc,
      req: {
        payload: {
          logger: {
            info: vi.fn(),
          },
        },
        context: {},
      },
    })

    // Act
    const result = revalidateHeader(args)

    // Assert
    expect(revalidateTag).toHaveBeenCalledWith('global_header')
    expect(result).toBe(doc)
  })
})
```

#### Testing Access Control

```typescript
// tests/unit/access/isAdminOrSuperAdmin.test.ts
import { describe, it, expect } from 'vitest'
import { isAdminOrSuperAdmin } from '../../../src/access/isAdminOrSuperAdmin'

describe('isAdminOrSuperAdmin', () => {
  it('should return true when user is admin', () => {
    const result = isAdminOrSuperAdmin({
      req: { user: { role: 'admin' } },
    })
    expect(result).toBe(true)
  })

  it('should return false when user is null', () => {
    const result = isAdminOrSuperAdmin({
      req: { user: null },
    })
    expect(result).toBe(false)
  })
})
```

#### Testing Field Validation

```typescript
// tests/unit/fields/formatSlug.test.ts
import { describe, it, expect } from 'vitest'
import { formatSlug } from '../../../src/fields/slug/formatSlug'

describe('formatSlug', () => {
  it('should convert spaces to hyphens', () => {
    const result = formatSlug('hello world')
    expect(result).toBe('hello-world')
  })
})
```

### Integration Tests

Integration tests verify that different parts of the application work together correctly.

#### Testing API Endpoints

```typescript
// tests/integration/api/promotion.test.ts
import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import type { Promotion } from '../../../src/payload-types'

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
    collections: {},
    globals: {},
  },
}))

import payload from 'payload'
import { GET } from '../../../src/app/(payload)/api/promotion/route'

describe('Promotion API', () => {
  it('should return active promotions for an event', async () => {
    // Arrange
    const mockPromotions = [
      {
        id: 1,
        code: 'SUMMER10',
        // Add required fields
        status: 'active',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      } as Promotion,
    ]

    vi.mocked(payload.find).mockResolvedValue({
      docs: mockPromotions,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10,
      totalDocs: 1,
      totalPages: 1,
    })

    // Act
    const response = await GET(new NextRequest('http://localhost:3000/api/promotion?eventId=1'), {})

    // Assert
    const responseData = await response.json()
    expect(responseData).toEqual(mockPromotions)
  })
})
```

### End-to-End Tests with Vitest

End-to-end tests with Vitest verify the entire application flow from start to finish using supertest.

```typescript
// tests/functions/e2e/api.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import { createAdminFactory } from '../factories'
import { mockPayload } from '../mocks/payload'

// Mock the payload module
vi.mock('payload', () => ({
  default: mockPayload(),
}))

import payload from 'payload'

describe('API Endpoints', () => {
  let app: express.Application
  let adminToken: string

  beforeAll(async () => {
    // Set up Express app and authentication
    app = express()

    // Mock routes for testing
    app.get('/api/events', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      return res.json({
        docs: [
          { id: 1, name: 'Test Event 1', status: 'published' },
        ],
      })
    })
  })

  it('should return events when authenticated', async () => {
    // Act
    const response = await request(app)
      .get('/api/events')
      .set('Authorization', `JWT token`)

    // Assert
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('docs')
  })
})
```

### End-to-End Tests with Playwright

End-to-end tests with Playwright verify the UI and user interactions in real browsers.

```typescript
// tests/e2e/self-page/basic.spec.ts
import { test, pwExpect } from '../playwright-setup'

test('should load the self page', async ({ page }) => {
  // Navigate to the self page
  await page.goto('/self')

  // Wait for the page to load
  await page.waitForLoadState('networkidle')

  // Take a screenshot to see what's on the page
  await page.screenshot({ path: 'test-results/self-page.png' })

  // Log the page content for debugging
  const content = await page.content()
  console.log('Page content:', content.substring(0, 500) + '...')

  // Check if the page has loaded
  await pwExpect(page).toHaveURL('/self')
})
```

For mobile-specific tests:

```typescript
// tests/e2e/self-page/mobile.spec.ts
import { test, expect } from '@playwright/test'

// Define a test suite for mobile testing
test.describe('Self Page - Mobile', () => {
  // Use mobile viewport
  test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE dimensions

  test('should display the check-in form on mobile', async ({ page }) => {
    // Navigate to the self page
    await page.goto('/self')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Verify the form elements are present and properly sized for mobile
    const form = page.locator('form[aria-label="Ticket code verification form"]')
    await expect(form).toBeVisible()

    // Check that the form fits within the viewport
    const formBoundingBox = await form.boundingBox()
    expect(formBoundingBox?.width).toBeLessThanOrEqual(375)

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/self-page-mobile.png' })
  })
})
```

## Mocking PayloadCMS

Create utility functions for mocking PayloadCMS objects:

```typescript
// tests/mocks/payload.ts
import { vi } from 'vitest'
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended'
import type { Payload } from 'payload'
import type { PayloadRequest } from 'payload/types'

// Create a deep mock of the Payload instance
export const mockPayload = (): DeepMockProxy<Payload> => {
  return mockDeep<Payload>()
}

// Create a mock PayloadRequest object
export const mockPayloadRequest = (overrides: Partial<PayloadRequest> = {}): PayloadRequest => {
  const mockReq = {
    payload: mockPayload(),
    user: null,
    payloadAPI: 'local',
    locale: 'en',
    // Add other required properties
    ...overrides,
  } as unknown as PayloadRequest

  return mockReq
}

// Create a mock hook args object
export const mockHookArgs = <T = any>(overrides: Partial<T> = {}) => {
  return {
    req: mockPayloadRequest(),
    operation: 'create',
    ...overrides,
  } as unknown as T
}
```

## Test Factories

Create factories for generating test data:

```typescript
// tests/factories/index.ts
import { faker } from '@faker-js/faker'
import type { User, Admin, Event } from '../../src/payload-types'

// Create a factory for User
export const createUserFactory = (overrides: Partial<User> = {}): User => {
  return {
    id: faker.number.int(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  } as User
}

// Create a factory for Admin
export const createAdminFactory = (overrides: Partial<Admin> = {}): Admin => {
  return {
    id: faker.number.int(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(['admin', 'super-admin']),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  } as Admin
}
```

## Environment Variables

Test-specific environment variables are defined in `.env.test`. These are loaded automatically in the test setup.

## Coverage Reports

Code coverage reports help identify untested code. Run coverage reports with:

```bash
pnpm test:coverage
```

## Best Practices

1. **Isolate tests**: Each test should be independent and not rely on the state from other tests.
2. **Mock external dependencies**: Use mocks for external services, databases, and APIs.
3. **Use descriptive test names**: Test names should describe what is being tested and the expected outcome.
4. **Follow the AAA pattern**: Arrange, Act, Assert.
5. **Test edge cases**: Include tests for error conditions and edge cases.
6. **Keep tests fast**: Unit tests should be fast to encourage frequent testing.
7. **Use test factories**: Generate test data consistently using factories.
8. **Clean up after tests**: Reset mocks and clean up any resources created during tests.
9. **Focus on behavior, not implementation**: Test what the code does, not how it does it.
10. **Maintain test coverage**: Aim for high test coverage, especially for critical code paths.

## Handling Conflicts Between Vitest and Playwright

When using both Vitest and Playwright in the same project, you may encounter conflicts, particularly with the global `expect` function. Here are strategies to handle these conflicts:

### 1. Use Custom Scripts for Running Tests

We've created custom scripts that run Playwright tests in an isolated environment to avoid conflicts with Vitest:

```bash
# Run all self-page tests
pnpm test:e2e:self-page
```

The script (`scripts/run-specific-tests.cjs`) runs each test file separately with a clean environment.

### 2. Use a Custom Setup File for Playwright

Create a custom setup file (`tests/e2e/playwright-setup.ts`) that provides a renamed version of the Playwright `expect` function:

```typescript
/**
 * This file sets up Playwright's expect function in a way that doesn't conflict with Vitest
 */

import { expect as playwrightExpect } from '@playwright/test';

// Export the Playwright expect function with a different name
export const pwExpect = playwrightExpect;

// This ensures we're not overriding the global expect
export { test } from '@playwright/test';
```

Then use this in your Playwright tests:

```typescript
import { test, pwExpect } from '../playwright-setup'

test('should load the page', async ({ page }) => {
  // ...
  await pwExpect(page).toHaveURL('/some-path')
})
```

### 3. Configure Playwright to Ignore Vitest Tests

In your `playwright.config.ts`, add the following to ignore Vitest test files:

```typescript
testIgnore: ['./tests/functions/**', '**/playwright-setup.ts'],
```

### 4. Set the PLAYWRIGHT_SKIP_EXPECT_OVERRIDE Environment Variable

In your `playwright.config.ts`, add:

```typescript
// This prevents conflicts with Vitest's expect
process.env.PLAYWRIGHT_SKIP_EXPECT_OVERRIDE = '1'
```

This tells Playwright not to override the global `expect` function.
