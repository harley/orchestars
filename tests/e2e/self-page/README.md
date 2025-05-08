# Self Page E2E Tests

This directory contains end-to-end tests for the `/self` page, which is the customer check-in ticket page.

## Test Files

- `self-page.spec.ts`: Basic functionality tests for the self page
- `mobile.spec.ts`: Mobile-specific tests for the self page
- `debug.spec.ts`: Debugging tests to help identify page structure

## Running the Tests

You can run the tests using the following commands:

```bash
# Run all tests for the self page
pnpm test:e2e tests/e2e/self-page/

# Run a specific test file
pnpm test:e2e tests/e2e/self-page/self-page.spec.ts
pnpm test:e2e tests/e2e/self-page/mobile.spec.ts

# Run tests with UI mode
pnpm test:e2e:ui tests/e2e/self-page/

# Run tests in debug mode
pnpm test:e2e:debug tests/e2e/self-page/

# Show the HTML report after a test run
pnpm test:e2e:report
```

## Test Coverage

### Basic Functionality Tests (`self-page.spec.ts`)

1. **Form Display**: Verifies that the form and its elements are displayed correctly
2. **Form Submission**: Tests that the form can be submitted with valid data
3. **Form Validation**: Checks that the form validates input correctly

### Mobile Tests (`mobile.spec.ts`)

1. **Mobile Display**: Verifies that the form displays correctly on mobile devices
2. **Touch-Friendly Buttons**: Checks that buttons are large enough for touch interaction
3. **Element Spacing**: Verifies that there's adequate spacing between form elements
4. **Orientation Change**: Tests that the form works in both portrait and landscape orientations
5. **Text Size**: Checks that text is readable on mobile devices
6. **Tap Targets**: Verifies that input fields are large enough for easy tapping

## Test Approach

These tests use a combination of techniques:

1. **Direct DOM Interaction**: Using Playwright's locators to find and interact with elements
2. **Visual Verification**: Taking screenshots for visual inspection
3. **Responsive Testing**: Testing on different viewport sizes and orientations
4. **Accessibility Testing**: Checking for adequate tap target sizes and text readability

## Notes on Implementation

1. **Selectors**: The tests use specific selectors based on the actual implementation:
   - Form: `form[aria-label="Ticket code verification form"]`
   - Email input: `input[name="email"]`
   - Ticket code input: `input[name="ticketCode"]`
   - Submit button: `button[type="submit"]`

2. **API Mocking**: The tests don't rely on API responses, as MSW mocking wasn't working reliably. Instead, they focus on form interaction and validation.

3. **Accessibility Standards**: The tests check for basic accessibility standards:
   - Button size: At least 40x40 pixels (44x44 is ideal)
   - Text size: At least 14px (16px is ideal)
   - Input field size: At least 40px height (44px is ideal)
   - Element spacing: At least 8px between elements

## Future Improvements

1. **API Integration**: Improve the MSW integration to properly mock API responses
2. **More Comprehensive Tests**: Add tests for error handling, success messages, etc.
3. **Visual Regression Testing**: Add visual regression tests to catch UI changes
4. **Accessibility Testing**: Implement accessibility tests using axe-core (currently not implemented)
