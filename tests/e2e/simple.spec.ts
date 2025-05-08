import { test, expect } from '@playwright/test';

test('simple test', async ({ page }) => {
  // Create a simple HTML page
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Simple Test</title>
      </head>
      <body>
        <h1>Hello, Playwright!</h1>
        <form>
          <label for="email">Email:</label>
          <input id="email" type="email" placeholder="Enter your email" required />
          
          <label for="ticket">Ticket Code:</label>
          <input id="ticket" type="text" placeholder="Enter your ticket code" required />
          
          <button type="submit">Check In</button>
        </form>
      </body>
    </html>
  `);
  
  // Check that the page has loaded
  await expect(page).toHaveTitle('Simple Test');
  
  // Check that the form elements are present
  await expect(page.getByRole('heading', { name: 'Hello, Playwright!' })).toBeVisible();
  await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
  await expect(page.getByPlaceholder('Enter your ticket code')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Check In' })).toBeVisible();
  
  // Fill in the form
  await page.getByPlaceholder('Enter your email').fill('test@example.com');
  await page.getByPlaceholder('Enter your ticket code').fill('TICKET123');
  
  // Check that the form values are set
  await expect(page.getByPlaceholder('Enter your email')).toHaveValue('test@example.com');
  await expect(page.getByPlaceholder('Enter your ticket code')).toHaveValue('TICKET123');
});
