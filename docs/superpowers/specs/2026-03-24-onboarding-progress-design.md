# OnboardingProgress Component — Design Spec

**Date:** 2026-03-24
**Branch:** `feature/onboarding-progress-cmp`
**Status:** Approved

---

## Summary

A display-only progress visualization component for `@repo/ui` that renders a winding train track with a 🚂 steam locomotive animating between 5 fixed onboarding stations. Complements the existing `OnboardingWizard.vue` in `apps/cloud` — intended as a summary/dashboard view of onboarding progress, not a replacement for the wizard.

Storybook-only for initial delivery.

---

## Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Animation approach | SVG `getPointAtLength()` + `requestAnimationFrame` | Train follows the exact curve with auto-rotation. No external deps. Proven in prototype. |
| Component scope | Display-only, no click handlers | Keeps it simple; parent controls state via props |
| Station count | Fixed 5 stations | Matches the onboarding flow exactly; no need for dynamic generation |
| Status message | Prop-driven | Parent provides contextual text; component just renders it |
| Location | `packages/ui/src/onboarding/` | Shared UI package, accessible from any app |

---

## File Structure

```
packages/ui/src/onboarding/
├── OnboardingProgress.vue          # Main component
├── OnboardingProgress.stories.ts   # Storybook stories
├── useTrainAnimation.ts            # Composable: path sampling + animation loop
└── trackPath.ts                    # SVG path data + station coordinates constants
```

---

## Props & Types

```typescript
interface OnboardingStep {
  label: string
  status: 'completed' | 'active' | 'pending'
}

interface Props {
  /** Index of the station the train should be at (0-4) */
  currentStep: number
  /** Label and status for each of the 5 stations */
  steps: OnboardingStep[]
  /** Optional message displayed below the track */
  statusMessage?: string
}
```

### Default steps (for reference)

```typescript
const DEFAULT_STEPS: OnboardingStep[] = [
  { label: 'Sign Up', status: 'completed' },
  { label: 'Select Plan', status: 'completed' },
  { label: 'Create Layout', status: 'completed' },
  { label: 'Install', status: 'active' },
  { label: 'Drive Trains', status: 'pending' },
]
```

---

## Visual Design

### Track

- Single SVG, viewBox `0 -20 900 270`
- Winding sinusoidal path: `M 60,140 C 120,140 140,60 220,60 C 300,60 320,140 400,140 C 480,140 500,60 580,60 C 660,60 680,140 760,140 C 810,140 840,100 840,80`
- Layers (bottom to top): brown ties (`stroke-dasharray: 3 8`), dark metal rails, inner rail highlight, subtle center line
- Dark background: `#0d1422`

### Stations

Each station has:
- A vertical pole connecting to the track
- A signal light: outer ring + inner filled circle + glow halo
- An uppercase label below (valleys) or above (peaks)

**Color by status:**
| Status | Color | Hex |
|--------|-------|-----|
| completed | Green | `#4ade80` |
| active | Cyan | `#7dd3fc` |
| pending | Purple | `#a855f7` |

The active station has a pulsing glow animation (SMIL `<animate>` on radius and opacity).

### Station coordinates

| Index | Label | SVG Position | Track Position |
|-------|-------|-------------|----------------|
| 0 | Sign Up | (60, 140) | Valley (left) |
| 1 | Select Plan | (220, 60) | Peak |
| 2 | Create Layout | (400, 140) | Valley |
| 3 | Install | (580, 60) | Peak |
| 4 | Drive Trains | (840, 80) | End (slight rise) |

### 🚂 Steam Locomotive

SVG group centered at origin, positioned via `transform="translate(x,y) rotate(angle)"`:

- **Boiler** — blue ellipse body with front face circle
- **Cab** — rear box with roof overhang and cyan window
- **Funnel** — flared smokestack with rim, smoke puffs animating upward (SMIL)
- **Bell** — golden circle on top of boiler
- **Headlight** — yellow circle on front with pulsing glow (SMIL)
- **Cowcatcher** — angled front plate
- **Wheels** — 2 large spoked drive wheels with connecting rod + 1 smaller front wheel
- **Chassis** — dark blue frame bar

### Status Message

Italic text centered below the track, color `#64748b`. Rendered only when `statusMessage` prop is provided.

---

## Animation System

### `useTrainAnimation` composable

```typescript
function useTrainAnimation(
  pathRef: Ref<SVGPathElement | null>,
  currentStep: Ref<number>
): {
  trainTransform: Ref<string>
}
```

**Behavior:**
1. On mount, calculates station fractions by sampling the path at 2000 points via `findFractionForPoint()` to find the exact fraction where each station's (x, y) coordinate lies on the path
2. Positions the train at `currentStep` immediately (no animation on mount)
3. Watches `currentStep` — when it changes, animates the train from current position to the new station

**Animation details:**
- Uses `requestAnimationFrame` loop
- Duration: `|targetFraction - currentFraction| * 2000ms + 400ms` (proportional to distance)
- Easing: `easeInOutCubic` — smooth acceleration and deceleration
- Train rotation: calculated from path tangent using a small delta (`getPointAtLength(pos + 2)` vs `getPointAtLength(pos)`) and `Math.atan2`
- Cancels in-flight animation if `currentStep` changes mid-transit

**No external dependencies.** Pure `requestAnimationFrame` + SVG DOM API.

### SMIL Animations (no JS cost)

These run continuously via SVG `<animate>` elements:
- Smoke puffs: 3 circles rising and fading from the funnel
- Headlight glow: pulsing radius
- Active station glow: pulsing radius and opacity

---

## Storybook Stories

File: `OnboardingProgress.stories.ts`

| Story | `currentStep` | Steps config | statusMessage | Purpose |
|-------|--------------|--------------|---------------|---------|
| `Default` | 0 | All pending except step 0 active | `'Creating your account...'` | Initial state |
| `MidProgress` | 3 | 0-2 completed, 3 active, 4 pending | `'Clearing the signal...'` | Typical mid-flow state |
| `Complete` | 4 | All completed | `'All aboard! 🚂'` | Final state |
| `Interactive` | Knob (0-4) | Dynamic based on knob | Dynamic | Lets viewer click through all states and see animation |
| `WithStatusMessage` | 2 | 0-1 completed, 2 active, 3-4 pending | `'Building your layout...'` | Demonstrates status message |

### Story patterns

- Follow existing `@repo/ui` story conventions: `Meta<typeof OnboardingProgress>`, `tags: ['autodocs']`, decorators with dark background and padding
- `Interactive` story uses `render()` with `ref` + buttons to increment/decrement step (demonstrating the animation)

---

## Tailwind / Styling

- Component uses inline SVG styling (fills, strokes) rather than Tailwind classes since it's all SVG
- Outer container uses Tailwind: `rounded-xl bg-[#0d1422] p-4` (or equivalent)
- Status message uses Tailwind: `text-center text-sm italic text-slate-500`
- No new entries needed in `animation-preset.ts` — all animations are SMIL-based within the SVG

---

## Constraints

- **No new dependencies** — uses only Vue 3, SVG DOM APIs, and `requestAnimationFrame`
- **Vue 3 Composition API** with `<script setup lang="ts">`
- **TypeScript strict** — no `any` types
- **@repo/ui workspace** imports only
- **Storybook only** — no integration with `apps/cloud` in this iteration
