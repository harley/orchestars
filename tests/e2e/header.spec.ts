import { test, expect } from '@playwright/test'

test('language switcher is positioned as the rightmost element on desktop', async ({ page }) => {
  // Set viewport to desktop size
  await page.setViewportSize({ width: 1280, height: 800 })
  
  // Navigate to the home page
  await page.goto('/')
  
  // Wait for the header to load
  await page.waitForSelector('nav')
  
  // Check that the language switcher is visible
  const languageSwitcher = page.locator('nav .hidden.md\\:block LanguageSwitcher')
  await expect(languageSwitcher).toBeVisible()
  
  // Get the bounding box of the language switcher and the user profile/login button
  const languageSwitcherBox = await page.locator('nav .hidden.md\\:block').boundingBox()
  const userProfileBox = await page.locator('nav button:has(svg[data-lucide="user"]), nav .avatar').boundingBox()
  
  // Verify that the language switcher is positioned to the right of the user profile button
  expect(languageSwitcherBox.x).toBeGreaterThan(userProfileBox.x)
})

test('language switcher is present in mobile menu', async ({ page }) => {
  // Set viewport to mobile size
  await page.setViewportSize({ width: 375, height: 667 })
  
  // Navigate to the home page
  await page.goto('/')
  
  // Wait for the header to load
  await page.waitForSelector('nav')
  
  // Open the mobile menu
  await page.click('nav button:has(svg[data-lucide="menu"])')
  
  // Wait for the mobile menu to open
  await page.waitForSelector('[role="dialog"]')
  
  // Check that the language switcher is visible in the mobile menu
  const languageSwitcherInMenu = page.locator('[role="dialog"] LanguageSwitcher')
  await expect(languageSwitcherInMenu).toBeVisible()
})