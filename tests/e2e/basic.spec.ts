import { test, expect } from '@playwright/test'

// Skip the web server startup
test.skip('basic test', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/')

  // Check that the page has loaded
  await expect(page).toHaveTitle(/OrcheStars/)
})
