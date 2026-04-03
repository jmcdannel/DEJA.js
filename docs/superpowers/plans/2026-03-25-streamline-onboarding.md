# 🚂 Streamline Onboarding — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder the DEJA.js onboarding flow so users name their layout immediately after signup, then choose a plan (or skip), and the layout is officially created in Firestore only when they reach the install step — with a redesigned Stripe-like input for naming.

**Architecture:** The wizard step order changes from Account→Plan→Payment→Layout→Install to Account→NameLayout→Plan→Payment→Install. Layout name+slug are persisted to the Firestore user doc as `onboarding.pendingLayout` but the actual `layouts/{id}` document is created at the install step. The NameLayoutStep uses a custom dual-field input inspired by Stripe Elements — a single container with auto-advance from layout name to slug.

**Tech Stack:** Vue 3, Vuetify, Firebase/Firestore, VueFire, @vueuse/core, @repo/modules, @repo/utils (slugify), @repo/ui (DejaTracker)

**Spec:** This plan (no separate spec document — requirements from user conversation)

**Working directory:** Create a new DEJA.js worktree from `preview` branch

**Base branch:** `preview` (mvp-getting-started merged via PR #239)

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `apps/cloud/src/Onboarding/steps/NameLayoutStep.vue` | Stripe-like dual-field input for layout name → slug. Emits `{name, id}` — no Firestore write. |

### Modified Files
| File | Change |
|------|--------|
| `packages/modules/onboarding/types.ts` | Add `layoutNamed`, `pendingLayoutName`, `pendingLayoutId` to `OnboardingState`. Reorder `OnboardingStep` union. |
| `packages/modules/onboarding/constants.ts` | Update `DEFAULT_ONBOARDING_STATE`, reorder `ONBOARDING_STEPS`. |
| `packages/modules/onboarding/useOnboarding.ts` | Add `setLayoutNamed()`, update `currentStepIndex` for new order. |
| `apps/cloud/src/Onboarding/OnboardingWizard.vue` | Reorder steps: NameLayout(1) → Plan(2) → Payment(3) → Install(4). Pass layout name/slug to InstallStep. |
| `apps/cloud/src/Onboarding/steps/PlanStep.vue` | Add "Use Free for Now" skip button. |
| `apps/cloud/src/Onboarding/steps/InstallStep.vue` | Accept `layoutName`+`layoutId` props, call `createLayout()` on mount. |
| `packages/ui/src/DejaTracker/DejaTracker.vue` | Update step labels to match new order. |
| `apps/dejajs-www/components/guides/GettingStartedGuide.tsx` | Update step descriptions to match new flow. |

### Removed Files
| File | Reason |
|------|--------|
| `apps/cloud/src/Onboarding/steps/LayoutStep.vue` | Replaced by `NameLayoutStep.vue` |

---

## Task 1: Create DEJA.js worktree

- [ ] **Step 1: Create the worktree**

```bash
cd /Users/jmcdannel/TTT/DEJA.js.git
git worktree add /Users/jmcdannel/TTT/worktrees/streamline-onboarding -b feature/streamline-onboarding origin/preview
```

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/jmcdannel/TTT/worktrees/streamline-onboarding
pnpm install
```

- [ ] **Step 3: Copy this plan into the worktree**

```bash
mkdir -p docs/superpowers/plans
cp /Users/jmcdannel/TTT/worktrees/preview/docs/superpowers/plans/2026-03-25-streamline-onboarding.md docs/superpowers/plans/
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/plans/2026-03-25-streamline-onboarding.md
git commit -m "docs: add streamline-onboarding implementation plan"
```

---

## Task 2: Update OnboardingState types

**Files:**
- Modify: `packages/modules/onboarding/types.ts`

- [ ] **Step 1: Update the types file**

Replace the full contents of `packages/modules/onboarding/types.ts`:

```typescript
import type { Timestamp } from 'firebase/firestore'

export interface OnboardingState {
  layoutNamed: boolean
  pendingLayoutName: string | null
  pendingLayoutId: string | null
  planSelected: boolean
  layoutCreated: boolean
  installStarted: boolean
  installStartedAt: Timestamp | null
  serverStarted: boolean
  serverStartedAt: Timestamp | null
}

export type OnboardingStep =
  | 'account'
  | 'layout'
  | 'plan'
  | 'install'
  | 'ready'

export interface OnboardingStepInfo {
  key: OnboardingStep
  label: string
  description: string
  icon: string
}
```

Note: `OnboardingStep` order changed — `layout` now comes before `plan`.

- [ ] **Step 2: Verify types compile**

Run: `cd /Users/jmcdannel/TTT/worktrees/streamline-onboarding && pnpm --filter @repo/modules exec tsc --noEmit`
Expected: May have errors from constants.ts — that's fine, we fix it in Task 3.

- [ ] **Step 3: Commit**

```bash
git add packages/modules/onboarding/types.ts
git commit -m "feat(modules): add layoutNamed and pendingLayout fields to OnboardingState"
```

---

## Task 3: Update onboarding constants

**Files:**
- Modify: `packages/modules/onboarding/constants.ts`

- [ ] **Step 1: Update the constants file**

Replace the full contents of `packages/modules/onboarding/constants.ts`:

```typescript
import type { OnboardingState, OnboardingStepInfo } from './types'

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  layoutNamed: false,
  pendingLayoutName: null,
  pendingLayoutId: null,
  planSelected: false,
  layoutCreated: false,
  installStarted: false,
  installStartedAt: null,
  serverStarted: false,
  serverStartedAt: null,
}

export const ONBOARDING_STEPS: OnboardingStepInfo[] = [
  {
    key: 'account',
    label: 'Create Account',
    description: 'Sign up to get started',
    icon: 'mdi-account-plus',
  },
  {
    key: 'layout',
    label: 'Name Layout',
    description: 'Give your railroad a name',
    icon: 'mdi-map-marker',
  },
  {
    key: 'plan',
    label: 'Choose Plan',
    description: 'Pick a plan or start free',
    icon: 'mdi-star',
  },
  {
    key: 'install',
    label: 'Install Server',
    description: 'One command to connect your railroad',
    icon: 'mdi-download',
  },
  {
    key: 'ready',
    label: 'Ready to Drive!',
    description: 'Your railroad is connected',
    icon: 'mdi-train',
  },
]

export const INSTALL_TIPS = [
  {
    title: 'DCC Addresses',
    text: 'DCC addresses are usually printed on the decoder or in the locomotive manual. Default address for new decoders is typically 3.',
    icon: 'mdi-information',
  },
  {
    title: 'Raspberry Pi',
    text: 'DEJA Server runs great on a Raspberry Pi 4 or 5. Just plug your CommandStation in via USB and you\'re set.',
    icon: 'mdi-raspberry-pi',
  },
  {
    title: 'Multi-Device',
    text: 'Once your server is running, open the Throttle app on any phone, tablet, or laptop on your network. All devices stay in sync automatically.',
    icon: 'mdi-cellphone-link',
  },
  {
    title: 'No WiFi Required on CommandStation',
    text: 'Your DCC-EX CommandStation connects via USB — no WiFi module needed. DEJA Server handles the network communication.',
    icon: 'mdi-usb',
  },
  {
    title: 'Cloud Sync',
    text: 'Your roster, turnout positions, and settings sync to the cloud in real time. Change something on your phone and see it on your tablet instantly.',
    icon: 'mdi-cloud-sync',
  },
]
```

- [ ] **Step 2: Verify types compile**

Run: `pnpm --filter @repo/modules exec tsc --noEmit`
Expected: PASS (or errors from useOnboarding.ts — fixed in Task 4)

- [ ] **Step 3: Commit**

```bash
git add packages/modules/onboarding/constants.ts
git commit -m "feat(modules): reorder onboarding steps — layout before plan"
```

---

## Task 4: Update useOnboarding composable

**Files:**
- Modify: `packages/modules/onboarding/useOnboarding.ts`

- [ ] **Step 1: Update the composable**

Replace the full contents of `packages/modules/onboarding/useOnboarding.ts`:

```typescript
import { computed } from 'vue'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useDocument, useCurrentUser, useFirestore } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { DEFAULT_ONBOARDING_STATE } from './constants'
import type { OnboardingState } from './types'

interface UserDocWithOnboarding {
  onboarding?: Partial<OnboardingState>
}

export function useOnboarding() {
  const user = useCurrentUser()
  const db = useFirestore()
  const layoutId = useStorage('@DEJA/layoutId', '')

  const userDocRef = computed(() => {
    if (!user.value) return null
    return doc(db, 'users', user.value.uid)
  })

  const userDoc = useDocument<UserDocWithOnboarding>(userDocRef)

  const state = computed<OnboardingState>(() => ({
    ...DEFAULT_ONBOARDING_STATE,
    ...(userDoc.value?.onboarding ?? {}),
  }))

  // Derived helpers for persistent prompts
  const needsInstall = computed(() => !state.value.serverStarted)
  const needsLocos = computed(() => state.value.serverStarted) // loco count check is caller's responsibility
  const isComplete = computed(
    () => state.value.planSelected && state.value.layoutCreated && state.value.serverStarted
  )

  // Current step index for progress tracker.
  // New order: 0=Account, 1=NameLayout, 2=Plan, 3=Install, 4=Ready
  // Starts at 1 because useOnboarding requires an authenticated user — account step is always complete.
  const currentStepIndex = computed(() => {
    if (!state.value.layoutNamed) return 1  // name layout step
    if (!state.value.planSelected) return 2 // plan step
    if (!state.value.layoutCreated) return 3 // install step (creates the layout)
    if (!state.value.serverStarted) return 3 // still on install, waiting for server
    return 4 // ready
  })

  // Write helpers — each is write-once (only writes if field is not already set)

  async function setLayoutNamed(name: string, id: string): Promise<void> {
    if (!user.value || state.value.layoutNamed) return
    await setDoc(
      doc(db, 'users', user.value.uid),
      {
        onboarding: {
          layoutNamed: true,
          pendingLayoutName: name,
          pendingLayoutId: id,
        },
      },
      { merge: true }
    )
  }

  async function setPlanSelected(): Promise<void> {
    if (!user.value || state.value.planSelected) return
    await setDoc(
      doc(db, 'users', user.value.uid),
      { onboarding: { planSelected: true } },
      { merge: true }
    )
  }

  async function setLayoutCreated(): Promise<void> {
    if (!user.value || state.value.layoutCreated) return
    await setDoc(
      doc(db, 'users', user.value.uid),
      { onboarding: { layoutCreated: true } },
      { merge: true }
    )
  }

  async function setInstallStarted(): Promise<void> {
    if (!user.value || state.value.installStarted) return
    await setDoc(
      doc(db, 'users', user.value.uid),
      {
        onboarding: {
          installStarted: true,
          installStartedAt: serverTimestamp(),
        },
      },
      { merge: true }
    )
  }

  return {
    state,
    needsInstall,
    needsLocos,
    isComplete,
    currentStepIndex,
    setLayoutNamed,
    setPlanSelected,
    setLayoutCreated,
    setInstallStarted,
  }
}
```

- [ ] **Step 2: Verify types compile**

Run: `pnpm --filter @repo/modules exec tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/modules/onboarding/useOnboarding.ts
git commit -m "feat(modules): add setLayoutNamed, update currentStepIndex for new flow"
```

---

## Task 5: Create NameLayoutStep.vue (Stripe-like input)

**Files:**
- Create: `apps/cloud/src/Onboarding/steps/NameLayoutStep.vue`

This is the core UX redesign — a single-container dual-field input that auto-advances from Layout Name to Layout ID (slug), inspired by Stripe Elements.

**UX Design:**
- Single rounded container with unified border and `focus-within` ring
- Left field: Layout Name (larger, primary)
- Separator: subtle `/` divider
- Right field: Layout ID/slug (auto-generated from name)
- Auto-advance: pressing Enter or Tab in name field moves focus to slug field
- Back-navigation: Backspace on empty slug returns focus to name field
- Slug auto-generates from name in real-time via `slugify()`
- Default name pre-filled from user's email prefix
- Smooth transitions via CSS

- [ ] **Step 1: Create the component**

Create `apps/cloud/src/Onboarding/steps/NameLayoutStep.vue`:

```vue
<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import { slugify } from '@repo/utils'

const emit = defineEmits<{
  complete: [payload: { name: string; id: string }]
}>()

const user = useCurrentUser()

const layoutName = ref('')
const layoutId = ref('')
const customSlug = ref(false)
const activeField = ref<'name' | 'slug'>('name')
const nameRef = ref<HTMLInputElement | null>(null)
const slugRef = ref<HTMLInputElement | null>(null)
const error = ref<string | null>(null)

// Pre-fill layout name from email prefix
onMounted(() => {
  if (user.value?.email) {
    const prefix = user.value.email.split('@')[0]
    // Capitalize first letter of each word
    layoutName.value = prefix
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }
  nextTick(() => nameRef.value?.focus())
})

// Auto-slugify name → ID (unless user has manually edited slug)
watch(layoutName, (name) => {
  if (!customSlug.value) {
    layoutId.value = slugify(name)
  }
})

// Validation
const nameValid = computed(() => layoutName.value.trim().length >= 2)
const slugValid = computed(() =>
  /^[a-z0-9-]+$/.test(layoutId.value) && layoutId.value.length >= 3
)
const canSubmit = computed(() => nameValid.value && slugValid.value)

function handleNameKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault()
    if (nameValid.value) {
      advanceToSlug()
    }
  }
}

function handleSlugKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  }
  // Backspace on empty slug → return to name
  if (e.key === 'Backspace' && layoutId.value === '') {
    e.preventDefault()
    customSlug.value = false
    activeField.value = 'name'
    nextTick(() => nameRef.value?.focus())
  }
}

function handleSlugInput() {
  // Once user edits slug manually, stop auto-generating
  customSlug.value = true
}

function advanceToSlug() {
  activeField.value = 'slug'
  nextTick(() => {
    slugRef.value?.focus()
    slugRef.value?.select()
  })
}

function handleSubmit() {
  if (!canSubmit.value) {
    if (!nameValid.value) {
      error.value = 'Layout name must be at least 2 characters'
      activeField.value = 'name'
      nextTick(() => nameRef.value?.focus())
    } else if (!slugValid.value) {
      error.value = 'Layout ID must be at least 3 characters (lowercase letters, numbers, hyphens)'
    }
    return
  }
  error.value = null
  emit('complete', { name: layoutName.value.trim(), id: layoutId.value })
}
</script>

<template>
  <div class="name-layout-step">
    <div class="step-container">
      <div class="step-card">
        <div class="flex items-center gap-3 mb-2">
          <v-icon color="primary" size="24">mdi-map-marker-path</v-icon>
          <h2 class="text-lg font-semibold text-sky-100">Name Your Railroad</h2>
        </div>
        <p class="text-sm opacity-60 mb-6">
          Every great railroad starts with a name. We'll create a unique ID for your layout automatically.
        </p>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-5"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <!-- 🎯 Stripe-like dual-field input -->
        <div
          class="stripe-input"
          :class="{
            'stripe-input--name-active': activeField === 'name',
            'stripe-input--slug-active': activeField === 'slug',
          }"
        >
          <!-- Layout Name field -->
          <div class="stripe-input__field stripe-input__name">
            <label class="stripe-input__label">
              Layout Name
            </label>
            <input
              ref="nameRef"
              v-model="layoutName"
              class="stripe-input__input"
              placeholder="My Railroad"
              @focus="activeField = 'name'"
              @keydown="handleNameKeydown"
            />
          </div>

          <!-- Separator -->
          <div class="stripe-input__sep">
            <span class="stripe-input__sep-icon">/</span>
          </div>

          <!-- Layout ID (slug) field -->
          <div class="stripe-input__field stripe-input__slug">
            <label class="stripe-input__label">
              Layout ID
            </label>
            <input
              ref="slugRef"
              v-model="layoutId"
              class="stripe-input__input stripe-input__input--mono"
              placeholder="my-railroad"
              @focus="activeField = 'slug'"
              @keydown="handleSlugKeydown"
              @input="handleSlugInput"
            />
          </div>
        </div>

        <p class="text-xs opacity-40 mt-2 mb-5">
          Press <kbd class="kbd">Enter</kbd> to advance · Layout ID: lowercase letters, numbers, hyphens
        </p>

        <v-btn
          @click="handleSubmit"
          :disabled="!canSubmit"
          color="primary"
          size="large"
          block
          class="text-none font-weight-bold"
        >
          <v-icon start>mdi-arrow-right</v-icon>
          Continue
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.name-layout-step {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
.step-container {
  width: 100%;
  max-width: 520px;
}

.step-card {
  position: relative;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid transparent;
  background-clip: padding-box;
}
.step-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 17px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(148, 163, 184, 0.1) 40%, rgba(20, 184, 166, 0.2));
  z-index: -1;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 1px;
}

/* ── Stripe-like dual-field input ── */
.stripe-input {
  display: flex;
  align-items: stretch;
  background: rgba(2, 6, 23, 0.9);
  border: 1.5px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.stripe-input:focus-within {
  border-color: rgba(56, 189, 248, 0.5);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
}

.stripe-input__field {
  flex: 1;
  padding: 12px 16px 10px;
  transition: background 200ms ease, flex 250ms cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;
}

/* Active field gets slight emphasis */
.stripe-input--name-active .stripe-input__name {
  flex: 1.4;
  background: rgba(56, 189, 248, 0.03);
}
.stripe-input--slug-active .stripe-input__slug {
  flex: 1.4;
  background: rgba(56, 189, 248, 0.03);
}

.stripe-input__label {
  display: block;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(148, 163, 184, 0.5);
  margin-bottom: 4px;
  font-weight: 600;
  transition: color 200ms ease;
}
.stripe-input--name-active .stripe-input__name .stripe-input__label,
.stripe-input--slug-active .stripe-input__slug .stripe-input__label {
  color: rgba(56, 189, 248, 0.7);
}

.stripe-input__input {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #e0f2fe;
  font-size: 0.95rem;
  line-height: 1.4;
  padding: 0;
}
.stripe-input__input::placeholder {
  color: rgba(148, 163, 184, 0.35);
}
.stripe-input__input--mono {
  font-family: 'DM Mono', monospace;
  font-size: 0.85rem;
  color: rgba(56, 189, 248, 0.8);
}

/* Separator */
.stripe-input__sep {
  display: flex;
  align-items: center;
  padding: 0 2px;
}
.stripe-input__sep-icon {
  font-size: 1.2rem;
  color: rgba(148, 163, 184, 0.2);
  font-weight: 300;
  user-select: none;
}

/* Keyboard hint */
.kbd {
  display: inline-block;
  padding: 1px 5px;
  font-size: 0.65rem;
  font-family: 'DM Mono', monospace;
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 4px;
  color: rgba(148, 163, 184, 0.6);
}
</style>
```

- [ ] **Step 2: Verify the component has no type errors**

Run: `pnpm --filter cloud exec tsc --noEmit`
Expected: PASS (or only pre-existing errors)

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/Onboarding/steps/NameLayoutStep.vue
git commit -m "feat(cloud): add Stripe-like NameLayoutStep with auto-advance dual-field input"
```

---

## Task 6: Add "Skip" option to PlanStep

**Files:**
- Modify: `apps/cloud/src/Onboarding/steps/PlanStep.vue`

The plan step now appears after layout naming. Users can skip it to use the free Hobbyist plan and decide on a paid plan later.

- [ ] **Step 1: Add skip button to the template**

In `apps/cloud/src/Onboarding/steps/PlanStep.vue`, add the skip option after the Compare CTA section (after the `</div>` that closes `text-center mt-8`):

Find:
```vue
    <!-- Compare CTA -->
    <div class="text-center mt-8">
      <button class="compare-cta" @click="showCompare = true">
        <v-icon size="small" class="mr-1">mdi-table</v-icon>
        View Full Feature Breakdown
      </button>
    </div>
```

Add immediately after:
```vue
    <!-- Skip — use free plan -->
    <div class="text-center mt-6">
      <button class="skip-btn" :disabled="loading" @click="selectPlan('hobbyist')">
        Use Free for Now — I'll decide later →
      </button>
    </div>
```

- [ ] **Step 2: Add skip button styles**

Add to the `<style scoped>` section, before the closing `</style>`:

```css
/* ── SKIP BUTTON ── */
.skip-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: rgba(148, 163, 184, 0.5);
  font-size: 0.8rem;
  cursor: pointer;
  transition: color 0.25s;
  padding: 8px 16px;
}
.skip-btn:hover:not(:disabled) {
  color: rgba(148, 163, 184, 0.8);
}
.skip-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/Onboarding/steps/PlanStep.vue
git commit -m "feat(cloud): add 'Use Free for Now' skip option to PlanStep"
```

---

## Task 7: Update InstallStep to create layout on mount

**Files:**
- Modify: `apps/cloud/src/Onboarding/steps/InstallStep.vue`

Currently InstallStep just shows install instructions. Now it also creates the layout in Firestore when the user arrives, making this the "official" start of their layout.

- [ ] **Step 1: Add layout creation props and logic**

In `apps/cloud/src/Onboarding/steps/InstallStep.vue`, update the `<script setup>` section.

Replace the props definition (around line 10):

```typescript
const props = defineProps<{
  uid?: string | null
  layoutId?: string
}>()
```

With:

```typescript
const props = defineProps<{
  uid?: string | null
  layoutId?: string
  layoutName?: string
}>()
```

Add imports at the top of the script (after existing imports):

```typescript
import { useLayout, useOnboarding as useOnboardingModule } from '@repo/modules'
```

After the existing `const { state: onboardingState } = useOnboarding()` line, add:

```typescript
const { createLayout } = useLayout()
const { setLayoutCreated, setInstallStarted } = useOnboardingModule()
const layoutCreating = ref(false)
const layoutCreateError = ref<string | null>(null)
```

Note: There are now two `useOnboarding` calls — the existing one (aliased as `onboardingState`) and the new one. Rename the new import to avoid collision, or destructure from the same call. Here's the cleaner approach — replace the existing onboarding import line:

Find:
```typescript
const { state: onboardingState } = useOnboarding()
```

Replace with:
```typescript
const { state: onboardingState, setLayoutCreated, setInstallStarted } = useOnboarding()
const { createLayout } = useLayout()
const layoutCreating = ref(false)
const layoutCreateError = ref<string | null>(null)
```

Remove the duplicate `useOnboarding as useOnboardingModule` import if added above — just destructure from the existing call.

- [ ] **Step 2: Add layout creation on mount**

After the existing `onMounted` block (tip interval), add a new `onMounted`:

```typescript
onMounted(async () => {
  // Create the layout in Firestore when user reaches install step
  const lid = props.layoutId || storedLayoutId.value
  const lname = props.layoutName || lid
  if (!lid) return

  // Skip if layout already created (e.g., user returned to this step)
  if (onboardingState.value.layoutCreated) return

  layoutCreating.value = true
  try {
    await createLayout(lid, { name: lname, id: lid })
    storedLayoutId.value = lid
    setLayoutCreated()  // 🔥 fire-and-forget — persist onboarding progress
    setInstallStarted() // 🔥 fire-and-forget — persist onboarding progress
  } catch (err: unknown) {
    const fbErr = err as { message?: string }
    layoutCreateError.value = fbErr.message || 'Failed to create layout'
  } finally {
    layoutCreating.value = false
  }
})
```

- [ ] **Step 3: Add error display in template**

In the template, at the top of the `<!-- ⏳ Waiting for Server -->` section (right after `<template v-else>`), add:

```vue
      <v-alert
        v-if="layoutCreateError"
        type="error"
        variant="tonal"
        class="mb-6"
        closable
        @click:close="layoutCreateError = null"
      >
        {{ layoutCreateError }}
      </v-alert>
```

- [ ] **Step 4: Commit**

```bash
git add apps/cloud/src/Onboarding/steps/InstallStep.vue
git commit -m "feat(cloud): create layout in Firestore when user reaches install step"
```

---

## Task 8: Rewrite OnboardingWizard step order

**Files:**
- Modify: `apps/cloud/src/Onboarding/OnboardingWizard.vue`

This is the main orchestrator. The new step order:
- Step 1: NameLayoutStep (collect name + slug)
- Step 2: PlanStep (select plan or skip)
- Step 3: PaymentStep (conditional, paid plans only)
- Step 4: InstallStep (creates layout + starts tracking)

- [ ] **Step 1: Replace the full OnboardingWizard.vue**

Replace `apps/cloud/src/Onboarding/OnboardingWizard.vue` with:

```vue
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCurrentUser, useCollection } from 'vuefire'
import { doc, setDoc, serverTimestamp, collection, query, where } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { Logo, DejaTracker } from '@repo/ui'
import NameLayoutStep from './steps/NameLayoutStep.vue'
import PlanStep from './steps/PlanStep.vue'
import PaymentStep from './steps/PaymentStep.vue'
import InstallStep from './steps/InstallStep.vue'
import { TIER_ORDER, useOnboarding } from '@repo/modules'
import type { PlanTier, BillingCycle } from '@repo/modules'

const router = useRouter()
const route = useRoute()
const user = useCurrentUser()
const currentStep = ref(1)
const { state: onboardingState, setLayoutNamed, setPlanSelected, setInstallStarted } = useOnboarding()

const userLayouts = useCollection(
  computed(() =>
    user.value?.email
      ? query(collection(db, 'layouts'), where('owner', '==', user.value.email))
      : null,
  ),
)
const primaryLayoutId = computed(() => userLayouts.value?.[0]?.id ?? '')

// Layout info collected in step 1, used in step 4 (install) to create the layout
const pendingLayoutName = ref('')
const pendingLayoutId = ref('')

const selectedPlan = ref<PlanTier>('hobbyist')
const selectedBillingCycle = ref<BillingCycle>('monthly')

// Restore state from Firestore if user returns mid-onboarding
onMounted(() => {
  const os = onboardingState.value
  if (os.layoutNamed && os.pendingLayoutName && os.pendingLayoutId) {
    pendingLayoutName.value = os.pendingLayoutName
    pendingLayoutId.value = os.pendingLayoutId

    if (os.planSelected) {
      // Already named + plan selected → go to install
      currentStep.value = 4
    } else {
      // Named but no plan yet → go to plan step
      currentStep.value = 2
    }
  }

  // Handle deep-link query params (e.g., /onboarding?plan=engineer)
  const planParam = route.query.plan as string | undefined
  const billingParam = route.query.billing as string | undefined
  if (planParam && TIER_ORDER.includes(planParam as PlanTier)) {
    selectedPlan.value = planParam as PlanTier
    if (billingParam === 'annual' || billingParam === 'monthly') {
      selectedBillingCycle.value = billingParam
    }
  }
})

// 🚀 Mark install step started when user reaches step 4
watch(currentStep, (step) => {
  if (step === 4) {
    setInstallStarted() // 🔥 fire-and-forget — persist onboarding progress
  }
})

// Step 1: Name Layout complete
function handleNameComplete(payload: { name: string; id: string }) {
  pendingLayoutName.value = payload.name
  pendingLayoutId.value = payload.id
  setLayoutNamed(payload.name, payload.id) // 🔥 fire-and-forget — persist
  currentStep.value = 2
}

// Step 2: Plan selection complete
function handlePlanComplete(payload: { plan: PlanTier; billingCycle: BillingCycle | null }) {
  selectedPlan.value = payload.plan
  selectedBillingCycle.value = payload.billingCycle ?? 'monthly'
  setPlanSelected() // 🔥 fire-and-forget — persist onboarding progress

  if (payload.plan === 'hobbyist') {
    // Free plan — skip payment, go to install
    if (user.value) {
      setDoc(doc(db, 'users', user.value.uid), {
        email: user.value.email ?? '',
        displayName: user.value.displayName ?? null,
        createdAt: serverTimestamp(),
        subscription: {
          plan: 'hobbyist',
          status: 'active',
          billingCycle: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          trialEndsAt: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          updatedAt: serverTimestamp(),
        },
      }, { merge: true })
    }
    currentStep.value = 4
  } else {
    currentStep.value = 3
  }
}

// Step 3: Payment complete
function handlePaymentComplete() {
  currentStep.value = 4
}

// Step 4: Install complete → go to dashboard
function handleInstallComplete() {
  router.push({ name: 'home' })
}

// Steps config for visual tracker
// Wizard steps: 1=NameLayout, 2=Plan, 3=Payment, 4=Install
// Tracker steps: 0=Account, 1=NameLayout, 2=Plan, 3=Install, 4=Drive
const steps = computed(() => [
  { value: 0, title: 'Create Account', icon: 'mdi-account-plus-outline', disabled: false },
  { value: 1, title: 'Name Layout', icon: 'mdi-map-marker-path', disabled: false },
  { value: 2, title: 'Choose Plan', icon: 'mdi-tag-outline', disabled: false },
  { value: 3, title: 'Payment', icon: 'mdi-credit-card-outline', disabled: selectedPlan.value === 'hobbyist' },
  { value: 4, title: 'Install', icon: 'mdi-download-outline', disabled: false },
])

// Map wizard currentStep to DejaTracker activeStep
const trackerStep = computed(() => {
  if (currentStep.value <= 1) return 1  // Name Layout
  if (currentStep.value === 2) return 2 // Plan
  if (currentStep.value === 3) return 2 // Payment = still on plan visually
  return 3                               // Install
})
</script>

<template>
  <v-container class="max-w-5xl mx-auto py-8">
    <div class="flex flex-col items-center mb-8">
      <Logo size="xl" :show-icon="true" variant="cloud" app-title="Cloud" class="mb-2" />
      <p class="opacity-60 text-sm">
        Time to put the "smart" in your choo-choos. Let's get you on the rails.
      </p>
    </div>

    <DejaTracker
      :active-step="trackerStep"
      :show-status="currentStep === 4"
      class="mb-8"
    />

    <div class="animate-deja-fade-in" :key="currentStep">
      <!-- Step 1: Name your layout -->
      <NameLayoutStep v-if="currentStep === 1" @complete="handleNameComplete" />

      <!-- Step 2: Choose a plan (or skip) -->
      <PlanStep v-else-if="currentStep === 2" @complete="handlePlanComplete" />

      <!-- Step 3: Payment (paid plans only) -->
      <template v-else-if="currentStep === 3">
        <PaymentStep
          v-if="selectedPlan !== 'hobbyist'"
          :plan="selectedPlan"
          :billing-cycle="selectedBillingCycle"
          @complete="handlePaymentComplete"
        />
        <div v-else class="text-center py-8 opacity-60">
          No payment required for the Hobbyist plan.
        </div>
      </template>

      <!-- Step 4: Install (creates layout + starts server detection) -->
      <InstallStep
        v-else-if="currentStep === 4"
        :uid="user?.uid"
        :layout-id="pendingLayoutId || primaryLayoutId"
        :layout-name="pendingLayoutName"
        @complete="handleInstallComplete"
      />
    </div>
  </v-container>
</template>
```

- [ ] **Step 2: Delete the old LayoutStep.vue**

```bash
rm apps/cloud/src/Onboarding/steps/LayoutStep.vue
```

- [ ] **Step 3: Verify no import references to LayoutStep remain**

```bash
grep -rn "LayoutStep" apps/cloud/src/ --include="*.vue" --include="*.ts"
```

Expected: No results (OnboardingWizard no longer imports it)

- [ ] **Step 4: Commit**

```bash
git add apps/cloud/src/Onboarding/OnboardingWizard.vue
git rm apps/cloud/src/Onboarding/steps/LayoutStep.vue
git commit -m "feat(cloud): reorder wizard — NameLayout → Plan → Payment → Install"
```

---

## Task 9: Update DejaTracker step labels

**Files:**
- Modify: `packages/ui/src/DejaTracker/DejaTracker.vue`

- [ ] **Step 1: Update step labels**

In `packages/ui/src/DejaTracker/DejaTracker.vue`, find line 30:

```typescript
const steps = ['Sign Up', 'Select Plan', 'Create Layout', 'Install', 'Drive Trains']
```

Replace with:

```typescript
const steps = ['Sign Up', 'Name Layout', 'Choose Plan', 'Install', 'Drive Trains']
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/DejaTracker/DejaTracker.vue
git commit -m "feat(ui): update DejaTracker labels for new onboarding order"
```

---

## Task 10: Update GettingStartedGuide

**Files:**
- Modify: `apps/dejajs-www/components/guides/GettingStartedGuide.tsx`

The public-facing getting started guide on the marketing site needs to reflect the new step order.

- [ ] **Step 1: Find the step descriptions in GettingStartedGuide.tsx**

Look for `<Step>` components and their `number` + `title` props. Update the order:
- Step 1: "Create Your Account" (unchanged)
- Step 2: "Name Your Layout" (was step 4 "Register Your Layout")
- Step 3: "Choose a Plan" (was step 2)
- Step 4: "Install the DEJA Server" (was step 5, content unchanged)
- Step 5: "Add Your Locomotives" (was step 6, content unchanged)
- Step 6: "Start Driving!" (was step 7, content unchanged)

Note: Exact step numbers may differ — read the file and renumber accordingly. The key change is that "Name Your Layout" now appears before "Choose a Plan". Update the Step `title` for the layout step from "Register Your Layout" to "Name Your Layout" and move it before the plan step.

- [ ] **Step 2: Update the descriptive text**

For the layout step, update the description to mention that naming happens early and creation happens at install:

> "Give your railroad a name and we'll generate a unique Layout ID. Your layout is officially created when you install the server — no commitment until then."

- [ ] **Step 3: Commit**

```bash
git add apps/dejajs-www/components/guides/GettingStartedGuide.tsx
git commit -m "docs(www): update getting started guide for new onboarding step order"
```

---

## Task 11: Verify end-to-end flow

- [ ] **Step 1: Start the cloud dev server**

```bash
cd /Users/jmcdannel/TTT/worktrees/streamline-onboarding
pnpm --filter cloud dev
```

- [ ] **Step 2: Test the full onboarding flow**

1. Open `http://localhost:3011` in browser
2. Sign in (or create new account)
3. Verify you see the **NameLayoutStep** first (not PlanStep)
4. Enter a layout name → verify slug auto-generates
5. Press Enter → verify focus advances to slug field
6. Press Enter → verify you advance to PlanStep
7. Verify "Use Free for Now" skip button appears on PlanStep
8. Click skip → verify you jump to InstallStep
9. Verify the layout was created in Firestore (check Firebase console)
10. Verify DejaTracker shows correct step highlights throughout

- [ ] **Step 3: Test deep-link plan params**

Navigate to `http://localhost:3011/onboarding?plan=engineer&billing=monthly`
Verify the plan is pre-selected when you reach PlanStep.

- [ ] **Step 4: Test session persistence**

1. Start onboarding, name a layout, then close the browser
2. Reopen → navigate to `/onboarding`
3. Verify you resume at the plan step (not name step)

- [ ] **Step 5: Test backspace navigation in stripe input**

1. In NameLayoutStep, enter a name
2. Auto-advance to slug field
3. Clear the slug with Backspace
4. Press Backspace once more on empty slug → verify focus returns to name field

---

## Task 12: Final cleanup

- [ ] **Step 1: Check for any remaining references to old step order**

```bash
grep -rn "Register Layout\|Register Your Layout" apps/ packages/ --include="*.vue" --include="*.ts" --include="*.tsx"
```

Fix any found references.

- [ ] **Step 2: Check for orphaned LayoutStep imports**

```bash
grep -rn "LayoutStep" apps/ packages/ --include="*.vue" --include="*.ts"
```

Should return nothing or only the new `NameLayoutStep`.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: cleanup old layout step references"
```
