/**
 * This file sets up Playwright's expect function in a way that doesn't conflict with Vitest
 */

import { expect as playwrightExpect } from '@playwright/test';

// Export the Playwright expect function with a different name
export const pwExpect = playwrightExpect;

// This ensures we're not overriding the global expect
export { test } from '@playwright/test';
