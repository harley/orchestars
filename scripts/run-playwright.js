#!/usr/bin/env node

// This script runs Playwright tests in a separate process to avoid conflicts with Vitest

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'
import { dirname } from 'path'

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get the arguments passed to this script
const args = process.argv.slice(2)

// Find the playwright executable
const playwrightBin = path.resolve(__dirname, '../node_modules/.bin/playwright')

// Set environment variables to prevent conflicts
// Create a clean environment with only essential variables
const env = {}
// Only copy essential environment variables
const essentialEnvVars = [
  'PATH',
  'HOME',
  'USER',
  'TEMP',
  'TMP',
  'SHELL',
  'TERM',
  'LANG',
  'LC_ALL',
  'DISPLAY',
]

for (const key of essentialEnvVars) {
  if (process.env[key]) {
    env[key] = process.env[key]
  }
}

// Add Playwright-specific environment variables
Object.assign(env, {
  PLAYWRIGHT_SKIP_EXPECT_OVERRIDE: '1',
  NODE_OPTIONS: '--no-warnings',
  NODE_NO_WARNINGS: '1',
  FORCE_COLOR: '1',
})

// Spawn a new process to run Playwright
const playwrightProcess = spawn(playwrightBin, ['test', ...args], {
  env,
  stdio: 'inherit',
  shell: true,
})

// Handle the process exit
playwrightProcess.on('exit', (code) => {
  process.exit(code)
})

// Handle errors
playwrightProcess.on('error', (err) => {
  console.error('Failed to start Playwright:', err)
  process.exit(1)
})
