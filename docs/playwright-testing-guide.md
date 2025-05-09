# Playwright E2E Testing Guide for OrcheStars

This guide provides comprehensive information on how to write and run end-to-end tests for the OrcheStars application using Playwright.

## Table of Contents

1. [Introduction](#introduction)
2. [Setup](#setup)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Writing Tests](#writing-tests)
6. [Mocking API Responses](#mocking-api-responses)
7. [Mobile Testing](#mobile-testing)
8. [Accessibility Testing](#accessibility-testing)
9. [Best Practices](#best-practices)
10. [Handling Conflicts with Vitest](#handling-conflicts-with-vitest)
11. [Troubleshooting](#troubleshooting)

## Introduction

Playwright is a powerful end-to-end testing framework that allows us to automate browser interactions and verify that our application works correctly from the user's perspective. This guide covers how to use Playwright to test the OrcheStars application.

## Setup

Playwright has been set up with the following configuration:

- **Test Directory**: `tests/e2e`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:3000`
- **Web Server**: Automatically starts the development server before running tests

### Installation

Playwright and its dependencies are already installed in the project. If you need to install it in a new environment, run:

```bash
pnpm add -D @playwright/test
npx playwright install
```

For accessibility testing, we also use:

```bash
pnpm add -D @axe-core/playwright
```

## Running Tests

You can run Playwright tests using the following npm scripts:

```bash
# Run all tests
pnpm test:e2e

# Run tests with UI mode
pnpm test:e2e:ui

# Run tests in debug mode
pnpm test:e2e:debug

# Show the HTML report after a test run
pnpm test:e2e:report
```

### Running Specific Tests

To run a specific test file:

```bash
pnpm test:e2e tests/e2e/self-page/basic.spec.ts
```

To run all self-page tests:

```bash
pnpm test:e2e:self-page
```

To run tests with a specific tag:

```bash
pnpm test:e2e --grep @mobile
```

### Running Tests in Specific Browsers

To run tests in a specific browser:

```bash
pnpm test:e2e --project=chromium
pnpm test:e2e --project="Mobile Chrome"
```

## Test Structure

Tests are organized in the following directory structure:

```
tests/
└── e2e/
    ├── self-page/
    │   ├── basic.spec.ts       # Basic page tests
    │   ├── debug.spec.ts       # Debug tests
    │   ├── mobile.spec.ts      # Mobile-specific tests
    │   └── self-page.spec.ts   # Main page tests
    ├── api.test.ts             # API tests with Playwright
    └── playwright-setup.ts     # Playwright setup utilities
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Navigate to the page
    await page.goto('/path');

    // Interact with the page
    await page.getByRole('button', { name: 'Click Me' }).click();

    // Assert the expected outcome
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Page Objects

For complex pages, consider using the Page Object Model pattern:

```typescript
// selfPage.ts
export class SelfPage {
  constructor(private page) {}

  async goto() {
    await this.page.goto('/self');
  }

  async fillForm(email, ticketCode) {
    await this.page.getByPlaceholder(/enter your email/i).fill(email);
    await this.page.getByPlaceholder(/enter your ticket code/i).fill(ticketCode);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /verify/i }).click();
  }

  async expectSuccessMessage() {
    await expect(this.page.getByText(/success/i)).toBeVisible();
  }
}

// In your test
const selfPage = new SelfPage(page);
await selfPage.goto();
await selfPage.fillForm('test@example.com', 'TICKET123');
await selfPage.submitForm();
await selfPage.expectSuccessMessage();
```

## Mocking API Responses

We use MSW (Mock Service Worker) to mock API responses in our tests:

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Create a mock server
const server = setupServer();

// Setup before tests
test.beforeEach(async () => {
  // Setup MSW to intercept API requests
  server.use(
    rest.post('/api/self/verify-ticket', (req, res, ctx) => {
      return res(ctx.json({
        message: 'Verification successful',
        data: {
          // Mock data here
        }
      }));
    })
  );

  // Start the server
  server.listen();
});

// Cleanup after tests
test.afterEach(() => {
  server.resetHandlers();
});

test.afterAll(() => {
  server.close();
});
```

## Mobile Testing

Playwright allows testing on mobile viewports:

```typescript
// In playwright.config.ts (already configured)
projects: [
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 12'] },
  },
]

// In your test
test.describe('Mobile Tests', () => {
  // Use a specific mobile viewport
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display properly on mobile', async ({ page }) => {
    // Your test code here
  });
});
```

## Accessibility Testing

We use `@axe-core/playwright` for accessibility testing:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have any accessibility violations', async ({ page }) => {
  await page.goto('/self');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Best Practices

1. **Use meaningful test names**: Test names should describe what is being tested and the expected outcome.

2. **Keep tests independent**: Each test should be independent and not rely on the state from other tests.

3. **Use data-testid attributes**: Add `data-testid` attributes to elements that are important for testing but don't have other reliable selectors.

4. **Test user flows**: Focus on testing complete user flows rather than individual components.

5. **Mock external dependencies**: Use MSW to mock API responses to make tests reliable and fast.

6. **Test accessibility**: Include accessibility tests to ensure your application is usable by everyone.

7. **Test on multiple browsers and viewports**: Use Playwright's multi-browser and mobile viewport support.

8. **Use visual testing for complex UIs**: Consider using Playwright's screenshot comparison for complex visual components.

## Handling Conflicts with Vitest

When using both Playwright and Vitest in the same project, you may encounter conflicts, particularly with the global `expect` function. Here are strategies to handle these conflicts:

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
  await pwExpect(page).toHaveURL('/self')
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

## Troubleshooting

### Tests are failing with timeout errors

- Increase the timeout in the test or in the configuration file:
  ```typescript
  // In a specific test
  test.setTimeout(60000);

  // In playwright.config.ts
  export default defineConfig({
    timeout: 60000,
  });
  ```

### Tests are failing because elements are not found

- Use `await page.waitForSelector()` to wait for elements to appear.
- Check if the selector is correct.
- Use `page.pause()` to debug the test:
  ```typescript
  await page.pause();
  ```

### Tests are failing in CI but passing locally

- Make sure the CI environment has the same dependencies installed.
- Check if there are any environment-specific configurations.
- Use `--headed` mode to see what's happening in CI:
  ```bash
  npx playwright test --headed
  ```
