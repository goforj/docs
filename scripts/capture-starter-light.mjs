import { chromium } from '../docs/node_modules/playwright/index.mjs'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// Capture a real Vue starter with auth and the component library enabled.
const base = process.env.STARTER_PREVIEW_URL || 'http://localhost:5195'
const output = fileURLToPath(new URL('../docs/assets/starter-kits/', import.meta.url))
await mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1496, height: 938 }, deviceScaleFactor: 2, colorScheme: 'light' })
await page.addInitScript(() => localStorage.setItem('theme', 'light'))
const path = (name) => `${output}${name}-light.png`
async function visit(route) {
  await page.goto(`${base}${route}`)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(250)
  await page.locator('input').evaluateAll(inputs => inputs.forEach(input => input.blur()))
  await page.waitForTimeout(150)
}
async function full(...names) {
  for (const name of names) await page.screenshot({ path: path(name) })
}
async function account(name) {
  await page.screenshot({ path: path(name), clip: { x: 461, y: 96, width: 574, height: 746 } })
}
try {
  await visit('/login')
  await full('auth-login-wide', 'browser-login-screen')
  await page.locator('#login').focus()
  await full('auth-login-focused')
  await page.locator('#login').blur()
  await page.waitForTimeout(150)
  await account('account-login')
  await visit('/register')
  await full('auth-register')
  await account('account-register')
  await visit('/forgot-password')
  await account('account-password-reset')
  await page.locator('input[type="email"]').fill('admin@example.com')
  await page.getByRole('button', { name: /email password reset link/i }).click()
  await page.getByText('We have emailed your password reset link.').waitFor()
  await page.locator('input').evaluateAll(inputs => inputs.forEach(input => input.blur()))
  await account('account-password-reset-sent')
  await visit('/login')
  await page.locator('#login').fill(process.env.STARTER_PREVIEW_USERNAME || 'admin')
  await page.locator('#password').fill(process.env.STARTER_PREVIEW_PASSWORD || 'admin')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await page.waitForURL(`${base}/`)
  await page.evaluate(() => document.fonts.ready)
  await full('app-dashboard-shell')
  for (const [route, wide, detail] of [
    ['profile', 'settings-profile', 'account-profile-settings'],
    ['password', 'settings-password-compact', 'account-password-settings'],
    ['appearance', 'settings-appearance', 'account-appearance-settings']
  ]) {
    await visit(`/settings/${route}`)
    await full(wide)
    const heading = await page.locator('h2').first().boundingBox()
    await page.screenshot({ path: path(detail), clip: { x: heading.x - 24, y: heading.y - 24, width: 624, height: 500 } })
  }
  await visit('/components/overview')
  await full('components-overview')
  await visit('/components/navigation')
  await full('browser-navigation-patterns')
  await visit('/components/overlays')
  await full('browser-overlay-patterns')
  await page.getByRole('button', { name: 'Open invite dialog', exact: true }).click()
  await page.getByRole('dialog').waitFor()
  await page.waitForTimeout(250)
  await full('overlay-invite-dialog')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Open command menu', exact: true }).click()
  await page.getByRole('dialog').waitFor()
  await page.waitForTimeout(250)
  await full('browser-command-palette')
} finally {
  await browser.close()
}
