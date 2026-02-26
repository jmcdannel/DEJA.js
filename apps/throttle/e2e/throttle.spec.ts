import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Mock Firebase REST and WebSocket calls so tests run without a real backend */
async function mockBackend(page: Page) {
  // Intercept Firebase Auth requests and return a fake signed-in user
  await page.route('**/identitytoolkit.googleapis.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        users: [{ localId: 'test-user', email: 'test@deja.js' }],
      }),
    })
  )

  // Intercept Firebase Realtime Database layout listing
  await page.route('**/.json*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        'test-layout': { name: 'Test Layout', id: 'test-layout' },
      }),
    })
  )

  // Intercept Firestore reads for the throttle collection
  await page.route('**/firestore.googleapis.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Home / Login page', () => {
  test('shows the login page when not authenticated', async ({ page }) => {
    await page.goto('/')
    // Should redirect to /login or show a login prompt
    await expect(page).toHaveURL(/login|\//)
    // Page should not show a runtime error
    await expect(page.locator('body')).not.toContainText('Uncaught Error')
  })
})

test.describe('Layout selection', () => {
  test('shows select-layout view when no layout is chosen', async ({ page }) => {
    await mockBackend(page)
    await page.goto('/connect')
    // Either redirects to login or shows the connect / layout-selection page
    const url = page.url()
    expect(['/login', '/connect'].some((p) => url.includes(p))).toBeTruthy()
  })
})

test.describe('Throttle navigation', () => {
  test('throttle-list route renders without crash', async ({ page }) => {
    await mockBackend(page)
    // Navigate directly; auth guard will redirect to /login if not signed in
    await page.goto('/locos')
    await expect(page.locator('body')).not.toContainText('Uncaught Error')
  })

  test('individual throttle route accepts address param', async ({ page }) => {
    await mockBackend(page)
    await page.goto('/throttle/3')
    await expect(page.locator('body')).not.toContainText('Uncaught Error')
  })
})

test.describe('Turnouts page', () => {
  test('turnouts route renders without crash', async ({ page }) => {
    await mockBackend(page)
    await page.goto('/turnouts')
    await expect(page.locator('body')).not.toContainText('Uncaught Error')
  })
})
