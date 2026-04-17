# Native Swipe Throttle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current snap-on-release swipe with a native CSS scroll-snap carousel so users see adjacent throttle cards while dragging — both on the `/throttle/:address` page and in the Conductor layout's center column.

**Architecture:** A new shared `ThrottleSwipeContainer.vue` component wraps all throttle slides in a `scroll-snap-type: x mandatory` container. An `IntersectionObserver` detects which slide is centered and emits `update:modelValue`. External navigation (nav chips, deep links) is handled by a `watch(modelValue)` that calls `scrollIntoView`. ThrottleView syncs with Vue Router (`router.replace`); ConductorLayout uses a local `ref`.

**Tech Stack:** Vue 3 Composition API, CSS scroll-snap, IntersectionObserver, Vue Router 4, VueUse, Vuetify 3

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `apps/throttle/src/throttle/ThrottleSwipeContainer.vue` | **Create** | Scroll-snap container + two-way address sync |
| `apps/throttle/src/views/ThrottleView.vue` | **Modify** | Replace `useSwipe` + single component with `ThrottleSwipeContainer`; sync with router |
| `apps/throttle/src/conductor/ConductorLayout.vue` | **Modify** | Replace `v-carousel` with `ThrottleSwipeContainer`; local ref for active address |
| `apps/throttle/e2e/throttle.spec.ts` | **Modify** | Add E2E tests for swipe navigation flow |

---

## Task 1: Create `ThrottleSwipeContainer.vue`

**Files:**
- Create: `apps/throttle/src/throttle/ThrottleSwipeContainer.vue`

- [ ] **Step 1: Create the file with full implementation**

```vue
<!-- apps/throttle/src/throttle/ThrottleSwipeContainer.vue -->
<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { Component } from 'vue'
import type { Throttle } from '@repo/modules/locos'

const props = defineProps<{
  throttles: Throttle[]
  modelValue: number | null | undefined
  variantComponent: Component
  variantProps?: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [address: number]
}>()

const containerRef = ref<HTMLElement | null>(null)
const slideEls = ref<(HTMLElement | null)[]>([])
const currentVisibleAddress = ref<number | null>(null)

let observer: IntersectionObserver | null = null

function getSlideIndex(address: number): number {
  return props.throttles.findIndex(t => t.address === address)
}

function scrollToAddress(address: number, behavior: ScrollBehavior = 'smooth') {
  const index = getSlideIndex(address)
  const el = slideEls.value[index]
  if (index < 0 || !el) return
  el.scrollIntoView({ behavior, inline: 'start', block: 'nearest' })
}

function setupObserver() {
  observer?.disconnect()
  if (!containerRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          const index = slideEls.value.indexOf(entry.target as HTMLElement)
          const throttle = props.throttles[index]
          if (throttle && throttle.address !== currentVisibleAddress.value) {
            currentVisibleAddress.value = throttle.address
            emit('update:modelValue', throttle.address)
          }
        }
      }
    },
    { root: containerRef.value, threshold: 0.55 },
  )
  slideEls.value.forEach(el => { if (el) observer?.observe(el) })
}

// External navigation (nav chip, deep link) → scroll to matching slide
watch(() => props.modelValue, (address) => {
  if (address == null || address === currentVisibleAddress.value) return
  nextTick(() => scrollToAddress(address, 'smooth'))
})

// Throttle list changed (add/remove) → re-observe and re-anchor
watch(() => props.throttles.length, () => {
  nextTick(() => {
    setupObserver()
    if (props.modelValue != null) scrollToAddress(props.modelValue, 'instant')
  })
})

onMounted(() => {
  nextTick(() => {
    setupObserver()
    if (props.modelValue != null) scrollToAddress(props.modelValue, 'instant')
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div ref="containerRef" class="swipe-container">
    <div
      v-for="(throttle, index) in throttles"
      :key="throttle.address"
      :ref="(el) => { slideEls[index] = el as HTMLElement | null }"
      class="swipe-slide"
    >
      <component
        :is="variantComponent"
        :address="throttle.address"
        v-bind="variantProps"
      />
    </div>
  </div>
</template>

<style scoped>
.swipe-container {
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
  width: 100%;
  height: 100%;
}

.swipe-container::-webkit-scrollbar {
  display: none;
}

.swipe-slide {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  scroll-snap-align: start;
}
</style>
```

- [ ] **Step 2: Verify the file was created**

```bash
ls apps/throttle/src/throttle/ThrottleSwipeContainer.vue
```
Expected: file exists.

---

## Task 2: Update `ThrottleView.vue`

**Files:**
- Modify: `apps/throttle/src/views/ThrottleView.vue`

Replace the entire file. Key changes:
- Remove `useSwipe`, `useTemplateRef`, `ref="throttleNavRef"`
- Import and use `ThrottleSwipeContainer`
- `handleSwipeChange` calls `router.replace` (not push — back button returns to list)
- `handleSelect` (nav chips) calls `router.push`

- [ ] **Step 1: Replace `ThrottleView.vue` with the updated version**

```vue
<!-- apps/throttle/src/views/ThrottleView.vue -->
<script async setup lang="ts">
import { computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { useLocos } from '@repo/modules/locos'
import ThrottleNavItem from '@/throttle/ThrottleNavItem.vue'
import ButtonsThrottle from '@/throttle/ButtonsThrottle.vue'
import SliderThrottle from '@/throttle/SliderThrottle.vue'
import Dashboard from '@/throttle/Dashboard.vue'
import ThrottleSwipeContainer from '@/throttle/ThrottleSwipeContainer.vue'
import { useThrottleSettings } from '@/throttle/useThrottleSettings'
import SaveToRosterChip from '@/throttle/SaveToRosterChip.vue'

const route = useRoute()
const router = useRouter()
const { getThrottles } = useLocos()
const throttles = getThrottles()
const lastThrottleAddress = useStorage<number>('@DEJA/lastThrottleAddress', throttles.value[0]?.address || 3)

const routeAddr = computed(() => route.params.address ? parseInt(route.params.address.toString()) : NaN)

if (!Number.isNaN(routeAddr.value)) {
  lastThrottleAddress.value = routeAddr.value
} else if (lastThrottleAddress.value === undefined || Number.isNaN(lastThrottleAddress.value)) {
  lastThrottleAddress.value = 3
}

const { variant, showFunctions, showSpeedometer, showConsist } = useThrottleSettings()

const variantMap = {
  buttons: ButtonsThrottle,
  slider: SliderThrottle,
  dashboard: Dashboard,
} as const

const variantComponent = computed(() => variantMap[variant.value] ?? ButtonsThrottle)

const settingsProps = computed(() => ({
  showFunctions: showFunctions.value,
  showSpeedometer: showSpeedometer.value,
  showConsist: showConsist.value,
}))

watch(() => route.params.address, (newVal) => {
  lastThrottleAddress.value = parseInt(newVal?.toString())
})

function handleSwipeChange(newAddress: number) {
  lastThrottleAddress.value = newAddress
  router.replace({ name: 'throttle', params: { address: newAddress } })
}

function handleSelect(newAddress: number) {
  lastThrottleAddress.value = newAddress
  router.push({ name: 'throttle', params: { address: newAddress } })
}
</script>

<template>
  <div class="@container flex-grow flex flex-col relative overflow-hidden w-full h-full flex-1 min-h-0">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px] -top-[200px] -left-[300px]"></div>
      <div class="absolute w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] -bottom-[100px] -right-[200px]"></div>
      <div class="absolute w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[90px] top-[30%] left-[40%]"></div>
    </div>
    <div class="absolute top-2 left-2 z-10">
      <SaveToRosterChip v-if="!Number.isNaN(routeAddr)" :address="routeAddr" />
    </div>
    <ThrottleSwipeContainer
      v-if="throttles?.length"
      :throttles="throttles"
      :model-value="routeAddr"
      :variant-component="variantComponent"
      :variant-props="settingsProps"
      class="flex-1 min-h-0"
      @update:model-value="handleSwipeChange"
    />
    <v-slide-group show-arrows selected-class="bg-success">
      <v-slide-group-item v-for="item in throttles" :key="item.id">
        <ThrottleNavItem v-if="item.address" :address="item.address" @select="handleSelect(item.address)" />
      </v-slide-group-item>
    </v-slide-group>
  </div>
</template>
```

- [ ] **Step 2: Confirm removed imports are gone**

```bash
grep -n "useSwipe\|useTemplateRef\|throttleNavRef" apps/throttle/src/views/ThrottleView.vue
```
Expected: no output (zero matches).

---

## Task 3: Update `ConductorLayout.vue`

**Files:**
- Modify: `apps/throttle/src/conductor/ConductorLayout.vue`

Replace the `v-carousel` in the center column with `ThrottleSwipeContainer`. Add a local `activeThrottleAddress` ref initialized from the first throttle.

- [ ] **Step 1: Replace the file with the updated version**

```vue
<!-- apps/throttle/src/conductor/ConductorLayout.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLocos } from '@repo/modules'
import ButtonsThrottle from '@/throttle/ButtonsThrottle.vue'
import SliderThrottle from '@/throttle/SliderThrottle.vue'
import Dashboard from '@/throttle/Dashboard.vue'
import ThrottleList from '@/throttle/ThrottleList.vue'
import ThrottleSwipeContainer from '@/throttle/ThrottleSwipeContainer.vue'
import Routes from '@/routes/Routes.vue'
import {
  TurnoutList,
  EffectList,
  SignalList,
  DeviceConnectionList,
} from '@repo/ui'
import { useConductorSettings } from '@/conductor/useConductorSettings'

const { getThrottles } = useLocos()
const throttles = getThrottles()

const { variant, rightPanel } = useConductorSettings()

const variantMap = {
  buttons: ButtonsThrottle,
  slider: SliderThrottle,
  dashboard: Dashboard,
} as const

const variantComponent = computed(() => variantMap[variant.value] ?? ButtonsThrottle)

const rightPanelMap = {
  turnouts: TurnoutList,
  effects: EffectList,
  signals: SignalList,
  devices: DeviceConnectionList,
  routes: Routes,
} as const

const rightPanelComponent = computed(() => rightPanelMap[rightPanel.value] ?? TurnoutList)

const activeThrottleAddress = ref<number | null>(null)

watch(throttles, (newThrottles) => {
  if (newThrottles?.length && activeThrottleAddress.value == null) {
    activeThrottleAddress.value = newThrottles[0].address
  }
}, { immediate: true })
</script>

<template>
  <main class="@container relative">
    <div class="conductor-layout grid grid-cols-1 @[960px]:grid-cols-3 gap-2 w-full">

      <!-- Column 1: Throttle list -->
      <div class="rounded border-1 border-green-500 border-opacity-50 order-2 @[960px]:!order-1 overflow-hidden min-h-[70vh] @[960px]:min-h-0" style="background: rgba(var(--v-theme-surface), 0.2)">
        <div class="@container h-full overflow-hidden p-4">
          <div v-if="throttles?.length" class="relative h-full w-full">
            <ThrottleList />
          </div>
        </div>
      </div>

      <!-- Column 2: Swipeable throttle controls -->
      <div class="order-1 @[960px]:!order-2 overflow-hidden min-h-[90vh] @[960px]:min-h-0" style="background: rgba(var(--v-theme-surface), 0.2)">
        <div class="@container h-full overflow-hidden">
          <ThrottleSwipeContainer
            v-if="throttles && throttles.length > 0"
            :throttles="throttles"
            :model-value="activeThrottleAddress"
            :variant-component="variantComponent"
            :variant-props="{ showSpeedometer: false, showConsist: false }"
            @update:model-value="activeThrottleAddress = $event"
          />
        </div>
      </div>

      <!-- Column 3: Right panel -->
      <div class="order-3 overflow-hidden min-h-[70vh] @[960px]:min-h-0" style="background: rgba(var(--v-theme-surface), 0.2)">
        <div class="@container h-full overflow-y-auto p-4">
          <component :is="rightPanelComponent" />
        </div>
      </div>

    </div>
  </main>
</template>

<style scoped>
.drawer-closed {
  right: 0;
  transition: right 0.2s;
}

.drawer-open {
  right: var(--v-navigation-drawer-width, 256px);
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

@media (min-width: 960px) {
  .conductor-layout {
    height: calc(100vh - var(--v-layout-bottom) - var(--v-layout-top));
  }
}
</style>
```

- [ ] **Step 2: Confirm v-carousel is gone**

```bash
grep -n "v-carousel" apps/throttle/src/conductor/ConductorLayout.vue
```
Expected: no output.

---

## Task 4: Add E2E tests for swipe navigation

**Files:**
- Modify: `apps/throttle/e2e/throttle.spec.ts`

Add a new `describe` block for swipe navigation. These tests verify the URL updates when swiping and that the container renders all throttle slides.

- [ ] **Step 1: Append the new describe block to `apps/throttle/e2e/throttle.spec.ts`**

Add these tests at the end of the file (before the final closing):

```typescript
// ---------------------------------------------------------------------------
// Swipe navigation — ThrottleSwipeContainer
// ---------------------------------------------------------------------------

test.describe('Swipe container — throttle page', () => {
  test.beforeEach(async ({ page }) => {
    await setLayout(page)
    await mockBackend(page)
  })

  test('throttle page renders a scroll container (not a hard-switch)', async ({ page }) => {
    const loggedIn = await loginWithDemo(page)
    test.skip(!loggedIn, 'Demo credentials not configured — set VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD in .env')

    await page.goto('/throttle/3')
    await page.waitForLoadState('networkidle')

    // The swipe container should be present
    const container = page.locator('.swipe-container')
    await expect(container).toBeVisible({ timeout: 5_000 })
  })

  test('URL updates to new address after swipe to next throttle', async ({ page }) => {
    const loggedIn = await loginWithDemo(page)
    test.skip(!loggedIn, 'Demo credentials not configured — set VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD in .env')

    await page.goto('/throttle/3')
    await page.waitForLoadState('networkidle')

    const container = page.locator('.swipe-container')
    const hasContainer = await container.isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasContainer) {
      test.info().annotations.push({ type: 'skip-reason', description: 'No swipe container visible — no active throttles' })
      return
    }

    const slides = page.locator('.swipe-slide')
    const slideCount = await slides.count()

    if (slideCount < 2) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Need 2+ throttles to test swipe navigation' })
      return
    }

    const initialUrl = page.url()

    // Simulate a swipe by scrolling the container to the second slide
    await container.evaluate((el) => {
      const secondSlide = el.querySelectorAll('.swipe-slide')[1] as HTMLElement
      secondSlide?.scrollIntoView({ behavior: 'instant', inline: 'start' })
    })

    // Wait for IntersectionObserver to fire and URL to update
    await page.waitForFunction(
      (url) => window.location.href !== url,
      initialUrl,
      { timeout: 2_000 },
    ).catch(() => {
      // URL may not change if only one throttle — not a failure
    })

    await expect(page.locator('body')).not.toContainText('No Throttle Assigned')
    await expect(page.locator('body')).not.toContainText('Uncaught Error')
  })

  test('nav chip click scrolls to correct throttle and updates URL', async ({ page }) => {
    const loggedIn = await loginWithDemo(page)
    test.skip(!loggedIn, 'Demo credentials not configured — set VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD in .env')

    await page.goto('/throttle/3')
    await page.waitForLoadState('networkidle')

    // Click a different throttle nav chip if one exists
    const navChips = page.locator('.throttle-nav-chip')
    const chipCount = await navChips.count()

    if (chipCount < 2) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Need 2+ throttle nav chips to test chip navigation' })
      return
    }

    // Click the second chip
    await navChips.nth(1).click()
    await page.waitForURL(/\/throttle\/\d+/, { timeout: 3_000 })

    await expect(page.locator('body')).not.toContainText('No Throttle Assigned')
  })
})
```

- [ ] **Step 2: Verify the test file has no syntax errors**

```bash
pnpm --filter=deja-throttle exec tsc --noEmit --skipLibCheck e2e/throttle.spec.ts 2>&1 | head -20
```

If the command errors (missing tsconfig for e2e), just visually confirm the file parses correctly — the Playwright runner will catch syntax errors on first run.

---

## Task 5: Run lint and type-check, then commit

- [ ] **Step 1: Lint the changed files**

```bash
pnpm --filter=deja-throttle lint 2>&1 | tail -20
```

Fix any reported errors before committing.

- [ ] **Step 2: Commit**

```bash
cd /Users/jmcdannel/TTT/DEJA.js.git/swipe-throttle
git add apps/throttle/src/throttle/ThrottleSwipeContainer.vue \
        apps/throttle/src/views/ThrottleView.vue \
        apps/throttle/src/conductor/ConductorLayout.vue \
        apps/throttle/e2e/throttle.spec.ts
git commit -m "feat(throttle): native CSS scroll-snap swipe between throttles

- Add ThrottleSwipeContainer with scroll-snap + IntersectionObserver sync
- ThrottleView: replace useSwipe with ThrottleSwipeContainer, router.replace on swipe
- ConductorLayout: replace v-carousel with ThrottleSwipeContainer

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- ✅ CSS scroll-snap container renders all throttles side by side
- ✅ Native browser physics (momentum, rubber-band) — no JS during drag
- ✅ Adjacent cards visible while dragging (scroll-snap peek)
- ✅ URL updates on swipe (router.replace)
- ✅ External navigation (nav chips, deep links) scrolls to correct slide
- ✅ Feedback loop prevented via `currentVisibleAddress` ref
- ✅ Implemented on both ThrottleView and ConductorLayout
- ✅ Shared component — no duplication between the two consumers

**Placeholder scan:** No TBDs, no "implement later", all steps have complete code.

**Type consistency:**
- `ThrottleSwipeContainer` prop `throttles: Throttle[]` matches usage in both ThrottleView and ConductorLayout (`getThrottles()` returns `Throttle[]` from `@repo/modules/locos`)
- `modelValue: number | null | undefined` matches `routeAddr` (which can be `NaN`) and `activeThrottleAddress` (which starts as `null`)
- `variantComponent: Component` matches the computed `variantMap[variant.value]` return type
- `emit('update:modelValue', throttle.address)` — `throttle.address` is `number` ✅
- `handleSwipeChange(newAddress: number)` in ThrottleView matches the emit signature ✅
