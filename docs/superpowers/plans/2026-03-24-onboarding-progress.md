# OnboardingProgress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a display-only train track progress component with animated locomotive for `@repo/ui`, viewable in Storybook.

**Architecture:** Single SVG component with a `useTrainAnimation` composable handling path-following animation via `getPointAtLength()` + `requestAnimationFrame`. Track path data and station coordinates live in a constants file. Five Storybook stories demonstrate different states.

**Tech Stack:** Vue 3 Composition API, TypeScript, SVG, Storybook 8, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-24-onboarding-progress-design.md`

---

## File Structure

```
packages/ui/src/onboarding/
├── trackPath.ts                    # SVG path data + station coordinates + types
├── useTrainAnimation.ts            # Composable: path sampling, fraction calc, animation loop
├── OnboardingProgress.vue          # Main component: SVG track, stations, train, status message
└── OnboardingProgress.stories.ts   # Storybook stories: Default, MidProgress, Complete, Interactive, WithStatusMessage
```

---

### Task 1: Track Path Constants

**Files:**
- Create: `packages/ui/src/onboarding/trackPath.ts`

- [ ] **Step 1: Create the types and constants file**

```typescript
// packages/ui/src/onboarding/trackPath.ts

export interface OnboardingStep {
  label: string
  status: 'completed' | 'active' | 'pending'
}

export interface StationCoord {
  x: number
  y: number
  labelY: number      // Y position for the label text
  labelAnchor: 'top' | 'bottom'  // Whether label goes above or below the track
}

/** The winding SVG path d attribute for the track */
export const TRACK_PATH_D =
  'M 60,140 C 120,140 140,60 220,60 C 300,60 320,140 400,140 C 480,140 500,60 580,60 C 660,60 680,140 760,140 C 810,140 840,100 840,80'

/** Station positions on the SVG canvas */
export const STATION_COORDS: StationCoord[] = [
  { x: 60, y: 140, labelY: 185, labelAnchor: 'bottom' },
  { x: 220, y: 60, labelY: 16, labelAnchor: 'top' },
  { x: 400, y: 140, labelY: 185, labelAnchor: 'bottom' },
  { x: 580, y: 60, labelY: 16, labelAnchor: 'top' },
  { x: 840, y: 80, labelY: 36, labelAnchor: 'top' },
]

/** Colors for each step status */
export const STATUS_COLORS: Record<OnboardingStep['status'], string> = {
  completed: '#4ade80',
  active: '#7dd3fc',
  pending: '#a855f7',
}

/** SVG viewBox for the component */
export const VIEWBOX = '0 -20 900 270'
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/onboarding/trackPath.ts
git commit -m "feat(ui): add track path constants and types for OnboardingProgress"
```

---

### Task 2: Train Animation Composable

**Files:**
- Create: `packages/ui/src/onboarding/useTrainAnimation.ts`

- [ ] **Step 1: Create the composable**

```typescript
// packages/ui/src/onboarding/useTrainAnimation.ts

import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { STATION_COORDS } from './trackPath'

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Finds the fraction along an SVG path that is closest to a given (x, y) point.
 * Samples the path at `steps` evenly-spaced intervals and returns the fraction
 * (0–1) of the closest sample.
 */
function findFractionForPoint(
  path: SVGPathElement,
  totalLen: number,
  targetX: number,
  targetY: number,
  steps = 2000
): number {
  let bestDist = Infinity
  let bestFrac = 0
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps
    const pt = path.getPointAtLength(frac * totalLen)
    const dist = Math.hypot(pt.x - targetX, pt.y - targetY)
    if (dist < bestDist) {
      bestDist = dist
      bestFrac = frac
    }
  }
  return bestFrac
}

export function useTrainAnimation(
  pathRef: Ref<SVGPathElement | null>,
  currentStep: Ref<number>
) {
  const trainTransform = ref('')
  let stationFractions: number[] = []
  let currentFraction = 0
  let animFrame: number | null = null

  function positionTrain(path: SVGPathElement, totalLen: number, fraction: number) {
    const pt = path.getPointAtLength(fraction * totalLen)
    const delta = Math.min(2, totalLen * 0.002)
    const pt2 = path.getPointAtLength(
      Math.min(fraction * totalLen + delta, totalLen)
    )
    const angle =
      Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI)
    trainTransform.value = `translate(${pt.x}, ${pt.y}) rotate(${angle})`
  }

  function animateTo(station: number) {
    const path = pathRef.value
    if (!path || stationFractions.length === 0) return

    const totalLen = path.getTotalLength()
    const targetFraction = stationFractions[station] ?? 0
    const startFraction = currentFraction

    if (animFrame) cancelAnimationFrame(animFrame)

    const duration =
      Math.abs(targetFraction - startFraction) * 2000 + 400
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeInOutCubic(progress)
      const frac =
        startFraction + (targetFraction - startFraction) * eased
      positionTrain(path!, totalLen, frac)
      if (progress < 1) {
        animFrame = requestAnimationFrame(tick)
      } else {
        currentFraction = targetFraction
        animFrame = null
      }
    }
    animFrame = requestAnimationFrame(tick)
    // Note: currentFraction is updated inside the tick loop when progress === 1,
    // NOT here — so mid-animation restarts use the actual interpolated position.
  }

  onMounted(() => {
    const path = pathRef.value
    if (!path) return

    const totalLen = path.getTotalLength()
    stationFractions = STATION_COORDS.map((c) =>
      findFractionForPoint(path, totalLen, c.x, c.y)
    )

    // Position immediately at current step (no animation on mount)
    const initialFrac = stationFractions[currentStep.value] ?? 0
    currentFraction = initialFrac
    positionTrain(path, totalLen, initialFrac)
  })

  watch(currentStep, (newStep) => {
    animateTo(newStep)
  })

  onUnmounted(() => {
    if (animFrame) cancelAnimationFrame(animFrame)
  })

  return { trainTransform }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/onboarding/useTrainAnimation.ts
git commit -m "feat(ui): add useTrainAnimation composable for path-following animation"
```

---

### Task 3: OnboardingProgress Component

**Files:**
- Create: `packages/ui/src/onboarding/OnboardingProgress.vue`

- [ ] **Step 1: Create the component**

Create `packages/ui/src/onboarding/OnboardingProgress.vue` with:

- `<script setup lang="ts">` block:
  - Import `ref`, `computed`, `useTemplateRef` from `vue`
  - Import `useTrainAnimation` from `./useTrainAnimation`
  - Import `TRACK_PATH_D`, `STATION_COORDS`, `STATUS_COLORS`, `VIEWBOX`, `type OnboardingStep` from `./trackPath`
  - Props: `currentStep: number`, `steps: OnboardingStep[]`, `statusMessage?: string`
  - `useTemplateRef('trackPathEl')` to get a ref to the SVG `<path>` element
  - Call `useTrainAnimation(trackPathRef, toRef(() => props.currentStep))` to get `trainTransform`
  - Computed `activeStationIndex`: finds the index where `step.status === 'active'`

- `<template>` block — single `<div>` wrapper with dark background, containing:
  - One `<svg>` with `viewBox` from `VIEWBOX` constant, `preserveAspectRatio="xMidYMid meet"`
  - Inside `<defs>`: the track `<path>` with `id="trackPath"` and a `<radialGradient>` for smoke
  - Track layers (4 `<use href="#trackPath">` elements): ties, rails, inner highlight, center line — using the same stroke values from the prototype
  - Station group: `v-for="(station, i) in steps"` rendering for each station:
    - Vertical pole `<line>` from `STATION_COORDS[i]` offset
    - Signal dot: outer `<circle>` with `stroke` from `STATUS_COLORS[station.status]`, inner filled `<circle>`
    - Glow halo `<circle>` with low opacity
    - Pulsing `<animate>` elements only when `i === activeStationIndex` (use `v-if`)
    - Label `<text>` at `STATION_COORDS[i].labelY`, color from `STATUS_COLORS[station.status]`, font-size `12` for active / `10` for others
  - The `<path>` element with `ref="trackPathEl"` (invisible, used by composable for `getPointAtLength`)
  - Train `<g>` with `:transform="trainTransform"` containing the full steam locomotive SVG from the prototype: boiler ellipse, cab with window, flared funnel, smoke puffs with `<animate>`, bell, headlight with pulsing `<animate>`, cowcatcher, 3 wheels with spokes and connecting rods, chassis frame
  - Outside the SVG: `<p>` for `statusMessage` (if provided), styled with `text-center text-sm italic text-slate-500 mt-4`

The SVG train group markup should be copied directly from the working prototype at `.superpowers/brainstorm/89018-1774358002/approach-demos-v3.html` — the `<g id="trainGroup">` section (the 🚂 steam locomotive with boiler, funnel, cab, wheels, smoke, bell, headlight).

- [ ] **Step 2: Verify component renders in Storybook**

Run: `cd packages/ui && pnpm storybook`

Open the browser and verify the component renders. If there are errors, fix them before proceeding.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/onboarding/OnboardingProgress.vue
git commit -m "feat(ui): add OnboardingProgress component with animated train"
```

---

### Task 4: Storybook Stories

**Files:**
- Create: `packages/ui/src/onboarding/OnboardingProgress.stories.ts`

- [ ] **Step 1: Create the stories file**

```typescript
// packages/ui/src/onboarding/OnboardingProgress.stories.ts

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import OnboardingProgress from './OnboardingProgress.vue'
import type { OnboardingStep } from './trackPath'

function makeSteps(activeIndex: number): OnboardingStep[] {
  const labels = ['Sign Up', 'Select Plan', 'Create Layout', 'Install', 'Drive Trains']
  return labels.map((label, i) => ({
    label,
    status: i < activeIndex ? 'completed' : i === activeIndex ? 'active' : 'pending',
  }))
}

const meta: Meta<typeof OnboardingProgress> = {
  title: 'Onboarding/OnboardingProgress',
  component: OnboardingProgress,
  tags: ['autodocs'],
  argTypes: {
    currentStep: {
      control: { type: 'range', min: 0, max: 4, step: 1 },
    },
    statusMessage: {
      control: 'text',
    },
  },
  decorators: [
    () => ({
      template:
        '<div class="p-6" style="min-height: 320px; background: #0f1729;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof OnboardingProgress>

export const Default: Story = {
  args: {
    currentStep: 0,
    steps: makeSteps(0),
    statusMessage: 'Creating your account...',
  },
}

export const MidProgress: Story = {
  args: {
    currentStep: 3,
    steps: makeSteps(3),
    statusMessage: 'Clearing the signal...',
  },
}

export const Complete: Story = {
  args: {
    currentStep: 4,
    steps: [
      { label: 'Sign Up', status: 'completed' },
      { label: 'Select Plan', status: 'completed' },
      { label: 'Create Layout', status: 'completed' },
      { label: 'Install', status: 'completed' },
      { label: 'Drive Trains', status: 'completed' },
    ],
    statusMessage: 'All aboard! 🚂',
  },
}

export const Interactive: Story = {
  render: () => ({
    components: { OnboardingProgress },
    setup() {
      const currentStep = ref(0)
      const statusMessages = [
        'Creating your account...',
        'Choosing your plan...',
        'Building your layout...',
        'Clearing the signal...',
        'All aboard! 🚂',
      ]
      const steps = ref(makeSteps(0))

      function goTo(step: number) {
        currentStep.value = step
        steps.value = makeSteps(step)
      }

      return { currentStep, steps, statusMessages, goTo }
    },
    template: `
      <div>
        <OnboardingProgress
          :current-step="currentStep"
          :steps="steps"
          :status-message="statusMessages[currentStep]"
        />
        <div class="flex gap-2 mt-4 justify-center">
          <button
            v-for="i in 5"
            :key="i"
            @click="goTo(i - 1)"
            class="px-3 py-1 rounded text-sm"
            :class="currentStep === i - 1
              ? 'bg-cyan-500 text-slate-900'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
          >
            Station {{ i }}
          </button>
        </div>
      </div>
    `,
  }),
}

export const WithStatusMessage: Story = {
  args: {
    currentStep: 2,
    steps: makeSteps(2),
    statusMessage: 'Building your layout...',
  },
}
```

- [ ] **Step 2: Run Storybook and verify all 5 stories render**

Run: `cd packages/ui && pnpm storybook`

Verify in browser:
- `Onboarding/OnboardingProgress` appears in the sidebar
- `Default` — train at station 1, one green dot
- `MidProgress` — train at station 4 (Install), 3 green + 1 cyan + 1 purple
- `Complete` — train at the end, all green
- `Interactive` — clicking station buttons animates the train smoothly
- `WithStatusMessage` — status text visible below track

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/onboarding/OnboardingProgress.stories.ts
git commit -m "feat(ui): add Storybook stories for OnboardingProgress"
```

---

### Task 5: Visual Polish & Verification

**Files:**
- Modify: `packages/ui/src/onboarding/OnboardingProgress.vue` (if needed)

- [ ] **Step 1: Run Storybook and visually verify**

Run: `cd packages/ui && pnpm storybook`

Check against the prototype at `.superpowers/brainstorm/89018-1774358002/approach-demos-v3.html`:
- Track winding shape matches
- Station dots are green/cyan/purple with glow
- Train is the 🚂 steam locomotive (boiler, funnel, wheels, smoke)
- Train stops precisely at each station marker
- Train auto-rotates to follow the track direction
- Smoke puffs animate from the funnel
- Headlight pulses
- Active station has pulsing glow
- Status message appears below track

- [ ] **Step 2: Fix any visual discrepancies**

If the train doesn't align with stations, check `findFractionForPoint()` is being called correctly in `onMounted`.

If the train doesn't rotate, check the angle calculation uses the correct delta direction.

- [ ] **Step 3: Test the Interactive story animation**

Click through all 5 station buttons in the Interactive story:
- Train should animate smoothly between stations
- No janky jumps or rotation flips
- Train follows the curve, not straight lines

- [ ] **Step 4: Final commit**

```bash
git add -A packages/ui/src/onboarding/
git commit -m "feat(ui): polish OnboardingProgress visual alignment and animation"
```
