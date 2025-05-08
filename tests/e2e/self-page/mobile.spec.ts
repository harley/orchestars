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

    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toBeVisible()

    const ticketInput = page.locator('input[name="ticketCode"]')
    await expect(ticketInput).toBeVisible()

    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()

    // Check that the form fits within the viewport
    const formBoundingBox = await form.boundingBox()
    expect(formBoundingBox?.width).toBeLessThanOrEqual(375)

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/self-page-mobile.png' })
  })

  test('should have touch-friendly button sizes on mobile', async ({ page }) => {
    // Navigate to the self page
    await page.goto('/self')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check that the submit button is large enough for touch interaction
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()

    const buttonBoundingBox = await submitButton.boundingBox()

    // Buttons should be at least 40x40 pixels for touch accessibility
    // (44x44 is ideal, but 40x40 is acceptable)
    expect(buttonBoundingBox?.height).toBeGreaterThanOrEqual(40)
    expect(buttonBoundingBox?.width).toBeGreaterThanOrEqual(40)
  })

  test('should have proper spacing between elements on mobile', async ({ page }) => {
    // Navigate to the self page
    await page.goto('/self')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check spacing between form elements
    const emailInput = page.locator('input[name="email"]')
    const ticketInput = page.locator('input[name="ticketCode"]')

    const emailBox = await emailInput.boundingBox()
    const ticketBox = await ticketInput.boundingBox()

    if (emailBox && ticketBox) {
      // Verify there's adequate spacing between form elements
      const spacing = ticketBox.y - (emailBox.y + emailBox.height)
      expect(spacing).toBeGreaterThanOrEqual(8) // At least 8px spacing
    }
  })

  test('should handle orientation change', async ({ page }) => {
    // Navigate to the self page
    await page.goto('/self')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check in portrait mode
    const form = page.locator('form[aria-label="Ticket code verification form"]')
    await expect(form).toBeVisible()

    // Take a screenshot in portrait mode
    await page.screenshot({ path: 'test-results/self-page-portrait.png' })

    // Change to landscape orientation
    await page.setViewportSize({ width: 667, height: 375 })

    // Wait a moment for the layout to adjust
    await page.waitForTimeout(500)

    // Verify the form is still visible and usable in landscape
    await expect(form).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="ticketCode"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Take a screenshot in landscape mode
    await page.screenshot({ path: 'test-results/self-page-landscape.png' })
  })

  test('should have readable text sizes on mobile', async ({ page }) => {
    // Navigate to the self page
    await page.goto('/self')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check that text is readable (font size is adequate)
    // This requires evaluating the computed styles
    const fontSize = await page.evaluate(() => {
      const inputElement = document.querySelector('input[name="email"]')
      if (!inputElement) return 0

      const computedStyle = window.getComputedStyle(inputElement)
      // Parse font size (e.g., "16px" -> 16)
      return parseInt(computedStyle.fontSize, 10)
    })

    // Font size should be at least 14px for mobile readability
    // (16px is ideal, but 14px is acceptable)
    expect(fontSize).toBeGreaterThanOrEqual(14)
  })

  test('should have adequate tap targets', async ({ page }) => {
    // Navigate to the self page
    await page.goto('/self')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check that input fields have adequate height for tapping
    const emailInput = page.locator('input[name="email"]')
    const inputBox = await emailInput.boundingBox()

    // Input height should be at least 40px for easy tapping
    // (44px is ideal, but 40px is acceptable)
    expect(inputBox?.height).toBeGreaterThanOrEqual(40)
  })
})
