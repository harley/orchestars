import { test, expect } from '@playwright/test'

test('debug self page content', async ({ page }) => {
  // Navigate to the self page
  await page.goto('/self')

  // Wait for the page to load
  await page.waitForLoadState('networkidle')

  // Take a screenshot
  await page.screenshot({ path: 'test-results/self-page-debug.png' })

  // Log the page title
  const title = await page.title()
  console.log('Page title:', title)

  // Log the current URL
  const url = page.url()
  console.log('Current URL:', url)

  // Check if there's any form on the page
  const formCount = await page.locator('form').count()
  console.log('Number of forms on the page:', formCount)

  if (formCount > 0) {
    // Get the HTML of the first form
    const formHtml = await page
      .locator('form')
      .first()
      .evaluate((node) => node.outerHTML)
    console.log('First form HTML:', formHtml)

    // Check for inputs
    const inputCount = await page.locator('input').count()
    console.log('Number of inputs on the page:', inputCount)

    // Get attributes of inputs
    if (inputCount > 0) {
      for (let i = 0; i < inputCount; i++) {
        const inputLocator = page.locator('input').nth(i)
        const type = await inputLocator.getAttribute('type')
        const name = await inputLocator.getAttribute('name')
        const placeholder = await inputLocator.getAttribute('placeholder')
        console.log(`Input ${i + 1}: type=${type}, name=${name}, placeholder=${placeholder}`)
      }
    }

    // Check for buttons
    const buttonCount = await page.locator('button').count()
    console.log('Number of buttons on the page:', buttonCount)

    if (buttonCount > 0) {
      for (let i = 0; i < buttonCount; i++) {
        const buttonLocator = page.locator('button').nth(i)
        const type = await buttonLocator.getAttribute('type')
        const text = await buttonLocator.textContent()
        console.log(`Button ${i + 1}: type=${type}, text=${text}`)
      }
    }
  } else {
    // If no form is found, log the entire page HTML for debugging
    const pageHtml = await page.content()
    console.log('Page HTML (first 1000 chars):', pageHtml.substring(0, 1000))
  }

  // Pass the test regardless of what we find
  expect(true).toBeTruthy()
})
