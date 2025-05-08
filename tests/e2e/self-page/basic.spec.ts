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
