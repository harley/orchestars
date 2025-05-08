# Vitest Testing Guide for OrcheStars

This guide provides comprehensive information on how to write and run unit and integration tests for the OrcheStars application using Vitest. For end-to-end testing with Playwright, see the [Playwright Testing Guide](./playwright-testing-guide.md).

## Table of Contents

1. [Introduction](#introduction)
2. [Test Setup](#test-setup)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Writing Unit Tests](#writing-unit-tests)
6. [Writing Integration Tests](#writing-integration-tests)
7. [Writing E2E Tests](#writing-e2e-tests)
8. [Mocking](#mocking)
9. [Test Factories](#test-factories)
10. [Environment Variables](#environment-variables)
11. [Coverage Reports](#coverage-reports)
12. [Best Practices](#best-practices)

## Introduction

OrcheStars uses Vitest as its testing framework. Vitest is a Vite-native testing framework that provides a fast and feature-rich testing experience.

Key features of our testing setup:
- Fast test execution with Vitest
- TypeScript support
- Mocking capabilities
- Code coverage reporting
- Test factories for generating test data
- Environment variable management

## Test Setup

The testing environment is configured in the following files:
- `vitest.config.ts` - Main Vitest configuration
- `tests/functions/setup.ts` - Global test setup and teardown
- `.env.test` - Test-specific environment variables

## Running Tests

You can run Vitest tests using the following npm scripts:

```bash
# Run all tests once
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

## Test Structure

Tests are organized in the following directory structure:

```
tests/
├── e2e/                 # End-to-end tests with Playwright (see Playwright Testing Guide)
└── functions/           # Tests with Vitest
    ├── factories/       # Test data factories
    ├── integration/     # Integration tests
    │   └── api/         # API integration tests
    ├── mocks/           # Mock implementations
    ├── setup.ts         # Global test setup for Vitest
    └── unit/            # Unit tests
        ├── access/      # Access control tests
        ├── fields/      # Field validation tests
        └── hooks/       # Hook tests
```

## Writing Unit Tests

Unit tests focus on testing individual functions, hooks, or components in isolation. They should be fast and not depend on external services.

### Testing Hooks

PayloadCMS hooks can be tested by mocking the hook arguments and verifying the expected behavior:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { revalidateHeader } from '../../../src/Header/hooks/revalidateHeader'
import { mockHookArgs } from '../../mocks/payload'

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
    expect(result).toBe(doc)
  })
})
```

### Testing Access Control

Access control functions can be tested by providing different user scenarios:

```typescript
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

### Testing Field Validation

Field validation functions can be tested by providing different input scenarios:

```typescript
import { describe, it, expect } from 'vitest'
import { formatSlug } from '../../../src/fields/slug/formatSlug'

describe('formatSlug', () => {
  it('should convert spaces to hyphens', () => {
    const result = formatSlug('hello world')
    expect(result).toBe('hello-world')
  })
})
```

## Writing Integration Tests

Integration tests verify that different parts of the application work together correctly. For PayloadCMS, this often means testing API endpoints or database operations.

### Testing API Endpoints

```typescript
import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../../../src/app/(payload)/api/promotion/route'

// Mock the payload module
vi.mock('payload', () => ({
  default: {
    init: vi.fn(),
    find: vi.fn(),
  },
}))

describe('Promotion API', () => {
  it('should return active promotions for an event', async () => {
    // Arrange
    const mockPromotions = [{ id: 1, code: 'SUMMER10' }]
    vi.mocked(payload.find).mockResolvedValue({
      docs: mockPromotions,
    })

    // Act
    const response = await GET(new NextRequest('http://localhost:3000/api/promotion?eventId=1'), {})

    // Assert
    const responseData = await response.json()
    expect(responseData).toEqual(mockPromotions)
  })
})
```

## Writing E2E Tests with Vitest

End-to-end tests with Vitest verify the entire application flow from start to finish. For PayloadCMS, this often means testing the API endpoints with a real server.

```typescript
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'

describe('API Endpoints', () => {
  let app: express.Application
  let adminToken: string

  beforeAll(async () => {
    // Set up Express app and authentication
  })

  it('should return events when authenticated', async () => {
    const response = await request(app)
      .get('/api/events')
      .set('Authorization', `JWT ${adminToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('docs')
  })
})
```

For browser-based end-to-end testing, we use Playwright. See the [Playwright Testing Guide](./playwright-testing-guide.md) for more information.

## Mocking

Vitest provides powerful mocking capabilities. We use the following approaches:

### Function Mocking

```typescript
import { vi } from 'vitest'

// Mock a function
const mockFn = vi.fn()
mockFn.mockReturnValue('mocked value')

// Mock a module
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))
```

### PayloadCMS Mocking

We provide utility functions for mocking PayloadCMS objects:

```typescript
import { mockPayload, mockPayloadRequest } from '../../mocks/payload'

// Mock a Payload instance
const payload = mockPayload()
payload.find.mockResolvedValue({ docs: [] })

// Mock a PayloadRequest
const req = mockPayloadRequest({
  user: { id: 1, email: 'admin@example.com' },
})
```

## Test Factories

Test factories help generate test data consistently:

```typescript
import { createUserFactory, createEventFactory } from '../factories'

// Create a user with default values
const user = createUserFactory()

// Create a user with custom values
const admin = createUserFactory({ role: 'admin' })

// Create an event
const event = createEventFactory({ status: 'published' })
```

## Environment Variables

Test-specific environment variables are defined in `.env.test`. These are loaded automatically in the test setup.

```
# .env.test
PAYLOAD_SECRET=test-secret
DATABASE_URI=postgres://postgres:postgres@localhost:5432/test_db
```

## Coverage Reports

Code coverage reports help identify untested code. Run coverage reports with:

```bash
pnpm test:coverage
```

The coverage report will be generated in the `coverage` directory.

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

## Using Vitest with Playwright

When using both Vitest and Playwright in the same project, you may encounter conflicts, particularly with the global `expect` function. See the [Playwright Testing Guide](./playwright-testing-guide.md) for information on how to handle these conflicts.
