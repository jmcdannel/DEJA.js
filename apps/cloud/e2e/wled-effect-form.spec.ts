import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Navigate to a WLED effect edit page. Uses demo mode (VITE_DEMO_MODE=true)
 * to bypass auth. Navigates directly to the effect edit URL.
 */
async function goToWledEffect(page: Page, effectId = 'betatrack-wled-wled-statoin-overhead') {
  await page.goto(`/effects/${effectId}`)
  // Wait for the WLED form to be visible
  await page.waitForSelector('.wled-form', { timeout: 10000 })
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
    await goToWledEffect(page)
  })

  // ── Form renders ─────────────────────────────────────────────

  test('renders the WLED form with all sections', async ({ page }) => {
    const form = wledForm(page)
    await expect(form).toBeVisible()

    // Check all section labels are present
    await expect(form.getByText('COLOR', { exact: true })).toBeVisible()
    await expect(form.getByText('EFFECT', { exact: true })).toBeVisible()
    await expect(form.getByText('PALETTE', { exact: true })).toBeVisible()
    await expect(form.getByText('CONTROLS', { exact: true })).toBeVisible()
    await expect(form.getByText('SEGMENTS', { exact: true })).toBeVisible()
    await expect(form.getByText('TRANSITION', { exact: true })).toBeVisible()
  })

  test('renders the LED strip preview', async ({ page }) => {
    const stripBar = page.locator('.wled-strip-preview .strip-bar')
    await expect(stripBar).toBeVisible()
    // Should have at least one segment in the strip
    const segments = stripBar.locator('.strip-segment')
    await expect(segments.first()).toBeVisible()
  })

  // ── Effect selection ─────────────────────────────────────────

  test('can search and select effects without form submission', async ({ page }) => {
    const form = wledForm(page)

    // Search for an effect
    const searchInput = form.locator('.wled-effect-list input[type="text"]')
    await searchInput.fill('rainbow')

    // Should filter the list
    const pills = form.locator('.effect-pill')
    const count = await pills.count()
    expect(count).toBeGreaterThan(0)

    // Every visible pill should contain "rainbow" (case-insensitive)
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await pills.nth(i).textContent()
      expect(text?.toLowerCase()).toContain('rainbow')
    }

    // Click the first result — should NOT redirect to /effects
    await pills.first().click()
    await expect(page).not.toHaveURL('/effects')

    // The clicked pill should now have the 'active' class
    await expect(pills.first()).toHaveClass(/active/)
  })

  test('clicking an effect pill does not submit the parent form', async ({ page }) => {
    const form = wledForm(page)
    const url = page.url()

    // Click "Breathe" effect
    const breathePill = form.locator('.effect-pill', { hasText: 'Breathe' })
    await breathePill.click()

    // Should stay on the same page
    await expect(page).toHaveURL(url)
    await expect(breathePill).toHaveClass(/active/)
  })

  // ── Palette selection ────────────────────────────────────────

  test('can select a palette without form submission', async ({ page }) => {
    const form = wledForm(page)
    const url = page.url()

    // Click a palette row (e.g. "Ocean" or the second palette)
    const paletteRows = form.locator('.palette-row')
    await expect(paletteRows.first()).toBeVisible()

    await paletteRows.nth(2).click()

    // Should stay on same page
    await expect(page).toHaveURL(url)
    // Clicked palette should be active
    await expect(paletteRows.nth(2)).toHaveClass(/active/)
  })

  // ── Color picker ─────────────────────────────────────────────

  test('can click color swatches without form submission', async ({ page }) => {
    const form = wledForm(page)
    const url = page.url()

    // Click a color swatch
    const swatches = form.locator('.swatch')
    await expect(swatches.first()).toBeVisible()
    await swatches.first().click()

    // Should stay on same page
    await expect(page).toHaveURL(url)
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

    // Find the brightness slider by its label
    const brightnessSection = form.locator('.wled-slider', { hasText: 'Brightness' })
    await expect(brightnessSection).toBeVisible()

    const slider = brightnessSection.locator('input[type="range"]')
    await expect(slider).toBeVisible()

    // Change the value
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

  test('shows segment cards with start/stop values', async ({ page }) => {
    const form = wledForm(page)

    const segmentCards = form.locator('.segment-card')
    await expect(segmentCards.first()).toBeVisible()

    // Active segment should show editable range inputs
    const activeCard = segmentCards.filter({ hasClass: 'active' })
    const rangeInputs = activeCard.locator('.range-input')
    await expect(rangeInputs).toHaveCount(2) // start + stop
  })

  test('can edit segment start/stop values', async ({ page }) => {
    const form = wledForm(page)

    // Find the active segment's range inputs
    const activeCard = form.locator('.segment-card.active')
    const startInput = activeCard.locator('.range-input').first()
    const stopInput = activeCard.locator('.range-input').last()

    // Change start value
    await startInput.fill('5')
    await startInput.press('Enter')

    // Change stop value
    await stopInput.fill('25')
    await stopInput.press('Enter')

    // Should stay on page (no form submission)
    await expect(page).not.toHaveURL('/effects')
  })

  test('can add a new segment', async ({ page }) => {
    const form = wledForm(page)

    const segmentCards = form.locator('.segment-card')
    const initialCount = await segmentCards.count()

    // Click "+ Add Segment"
    const addBtn = form.locator('.add-segment-btn')
    await addBtn.click()

    // Should have one more segment card
    await expect(segmentCards).toHaveCount(initialCount + 1)

    // Should stay on page
    await expect(page).not.toHaveURL('/effects')
  })

  test('can toggle segment on/off', async ({ page }) => {
    const form = wledForm(page)

    const toggleSwitch = form.locator('.toggle-switch').first()
    await expect(toggleSwitch).toBeVisible()

    // Click toggle
    await toggleSwitch.click()

    // Should stay on page
    await expect(page).not.toHaveURL('/effects')
  })

  test('selecting a segment updates active state', async ({ page }) => {
    const form = wledForm(page)

    // Add a second segment first
    await form.locator('.add-segment-btn').click()

    const segmentCards = form.locator('.segment-card')
    await expect(segmentCards).toHaveCount(2)

    // Click the second segment card
    await segmentCards.nth(1).click()

    // Second card should be active
    await expect(segmentCards.nth(1)).toHaveClass(/active/)
    // First should not be active
    await expect(segmentCards.nth(0)).not.toHaveClass(/active/)
  })

  // ── No form submission on any control ────────────────────────

  test('no control interaction triggers form submission', async ({ page }) => {
    const form = wledForm(page)
    const url = page.url()

    // Click through multiple controls rapidly
    const actions = [
      () => form.locator('.effect-pill').nth(3).click(),
      () => form.locator('.palette-row').nth(1).click(),
      () => form.locator('.swatch').nth(2).click(),
      () => form.locator('.slot-btn').nth(1).click(),
      () => form.locator('.toggle-switch').first().click(),
    ]

    for (const action of actions) {
      await action()
      // Verify we haven't navigated away
      expect(page.url()).toBe(url)
    }
  })
})
