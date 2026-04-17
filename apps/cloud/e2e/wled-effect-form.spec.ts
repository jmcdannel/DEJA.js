import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sign in using demo mode credentials and navigate to effects.
 * Demo mode (VITE_DEMO_MODE=true) auto-fills email/password on the login page.
 */
async function signInDemo(page: Page) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // Demo mode may auto-sign-in, wait a moment
  await page.waitForTimeout(2000)

  // If we're still on login, fill credentials and sign in
  if (page.url().includes('login')) {
    const emailInput = page.locator('input[type="email"], input[autocomplete="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()

    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill(process.env.VITE_DEMO_EMAIL || 'demo@dejajs.com')
      await passwordInput.fill(process.env.VITE_DEMO_PASSWORD || 'demo123')
      await page.locator('button[type="submit"], .v-btn:has-text("Sign")').first().click()
      await page.waitForTimeout(3000)
    }
  }
}

/**
 * Navigate to a WLED effect edit page.
 */
async function goToWledEffect(page: Page, effectId = 'betatrack-wled-wled-statoin-overhead') {
  await page.goto(`/effects/${effectId}`)
  await page.waitForLoadState('networkidle')
  // Wait for the WLED form to be visible
  await page.waitForSelector('.wled-form', { timeout: 15000 })
}

/** Get the WLED form container */
function wledForm(page: Page) {
  return page.locator('.wled-form')
}

// ---------------------------------------------------------------------------
// Tests — WLED Effect Form
// ---------------------------------------------------------------------------

test.describe('WLED Effect Form', () => {
  test.beforeEach(async ({ page }) => {
    await signInDemo(page)
    await goToWledEffect(page)
  })

  // ── Form renders ─────────────────────────────────────────────

  test('renders the WLED form with all sections', async ({ page }) => {
    const form = wledForm(page)
    await expect(form).toBeVisible()

    // Check all section labels are present (uppercase)
    await expect(form.getByText('COLOR')).toBeVisible()
    await expect(form.getByText('EFFECT')).toBeVisible()
    await expect(form.getByText('PALETTE')).toBeVisible()
    await expect(form.getByText('CONTROLS')).toBeVisible()
    await expect(form.getByText('SEGMENTS')).toBeVisible()
    await expect(form.getByText('TRANSITION')).toBeVisible()
  })

  test('renders the LED strip preview', async ({ page }) => {
    const stripBar = page.locator('.wled-strip-preview .strip-bar')
    await expect(stripBar).toBeVisible()
    const segments = stripBar.locator('.strip-segment')
    await expect(segments.first()).toBeVisible()
  })

  // ── Effect selection ─────────────────────────────────────────

  test('can search and select effects without form submission', async ({ page }) => {
    const form = wledForm(page)
    const url = page.url()

    // Search for an effect
    const searchInput = form.locator('.wled-effect-list input[type="text"]')
    await searchInput.fill('rainbow')

    // Should filter the list
    const pills = form.locator('.effect-pill')
    const count = await pills.count()
    expect(count).toBeGreaterThan(0)

    // Click the first result — should NOT redirect
    await pills.first().click()
    expect(page.url()).toBe(url)

    // The clicked pill should be active
    await expect(pills.first()).toHaveClass(/active/)
  })

  test('clicking an effect pill does not submit the parent form', async ({ page }) => {
    const form = wledForm(page)
    const url = page.url()

    const breathePill = form.locator('.effect-pill', { hasText: 'Breathe' })
    await breathePill.click()

    expect(page.url()).toBe(url)
    await expect(breathePill).toHaveClass(/active/)
  })

  // ── Palette selection ────────────────────────────────────────

  test('can select a palette without form submission', async ({ page }) => {
    const form = wledForm(page)
    const url = page.url()

    const paletteRows = form.locator('.palette-row')
    await expect(paletteRows.first()).toBeVisible()

    await paletteRows.nth(2).click()

    expect(page.url()).toBe(url)
    await expect(paletteRows.nth(2)).toHaveClass(/active/)
  })

  // ── Color picker ─────────────────────────────────────────────

  test('can click color swatches without form submission', async ({ page }) => {
    const form = wledForm(page)
    const url = page.url()

    const swatches = form.locator('.swatch')
    await expect(swatches.first()).toBeVisible()
    await swatches.first().click()

    expect(page.url()).toBe(url)
  })

  test('can switch between Fx/Bg/Cs color slots', async ({ page }) => {
    const form = wledForm(page)

    const slotButtons = form.locator('.slot-btn')
    await expect(slotButtons).toHaveCount(3)

    // Click Bg slot
    await slotButtons.nth(1).click()
    await expect(slotButtons.nth(1)).toHaveClass(/active/)

    // Click Cs slot
    await slotButtons.nth(2).click()
    await expect(slotButtons.nth(2)).toHaveClass(/active/)

    // Click back to Fx
    await slotButtons.nth(0).click()
    await expect(slotButtons.nth(0)).toHaveClass(/active/)
  })

  // ── Sliders ──────────────────────────────────────────────────

  test('brightness slider is interactive', async ({ page }) => {
    const form = wledForm(page)

    const brightnessSection = form.locator('.wled-slider', { hasText: 'Brightness' })
    await expect(brightnessSection).toBeVisible()

    const slider = brightnessSection.locator('input[type="range"]')
    await slider.fill('200')
    const valueDisplay = brightnessSection.locator('.wled-slider__value')
    await expect(valueDisplay).toHaveText('200')
  })

  test('speed slider is interactive', async ({ page }) => {
    const form = wledForm(page)

    const speedSection = form.locator('.wled-slider', { hasText: 'Speed' })
    await expect(speedSection).toBeVisible()

    const slider = speedSection.locator('input[type="range"]')
    await slider.fill('50')
    const valueDisplay = speedSection.locator('.wled-slider__value')
    await expect(valueDisplay).toHaveText('50')
  })

  // ── Segments ─────────────────────────────────────────────────

  test('active segment shows editable range inputs', async ({ page }) => {
    const form = wledForm(page)

    const activeCard = form.locator('.segment-card.active')
    await expect(activeCard).toBeVisible()

    const rangeInputs = activeCard.locator('.range-input')
    await expect(rangeInputs).toHaveCount(2)
  })

  test('can edit segment start/stop values', async ({ page }) => {
    const form = wledForm(page)
    const url = page.url()

    const activeCard = form.locator('.segment-card.active')
    const startInput = activeCard.locator('.range-input').first()
    const stopInput = activeCard.locator('.range-input').last()

    await startInput.fill('5')
    await startInput.dispatchEvent('change')

    await stopInput.fill('25')
    await stopInput.dispatchEvent('change')

    // Should stay on page
    expect(page.url()).toBe(url)
  })

  test('can add a new segment', async ({ page }) => {
    const form = wledForm(page)
    const url = page.url()

    const segmentCards = form.locator('.segment-card')
    const initialCount = await segmentCards.count()

    await form.locator('.add-segment-btn').click()

    await expect(segmentCards).toHaveCount(initialCount + 1)
    expect(page.url()).toBe(url)
  })

  test('can toggle segment on/off', async ({ page }) => {
    const form = wledForm(page)
    const url = page.url()

    const toggleSwitch = form.locator('.toggle-switch').first()
    await toggleSwitch.click()

    expect(page.url()).toBe(url)
  })

  test('selecting a segment updates active state', async ({ page }) => {
    const form = wledForm(page)

    // Add a second segment
    await form.locator('.add-segment-btn').click()

    const segmentCards = form.locator('.segment-card')
    await expect(segmentCards).toHaveCount(2)

    // Click the second segment card
    await segmentCards.nth(1).click()
    await expect(segmentCards.nth(1)).toHaveClass(/active/)
    await expect(segmentCards.nth(0)).not.toHaveClass(/active/)
  })

  // ── No form submission on any control ────────────────────────

  test('no control interaction triggers form submission', async ({ page }) => {
    const form = wledForm(page)
    const url = page.url()

    const actions = [
      () => form.locator('.effect-pill').nth(3).click(),
      () => form.locator('.palette-row').nth(1).click(),
      () => form.locator('.swatch').nth(2).click(),
      () => form.locator('.slot-btn').nth(1).click(),
      () => form.locator('.toggle-switch').first().click(),
    ]

    for (const action of actions) {
      await action()
      expect(page.url()).toBe(url)
    }
  })
})
