# Onboarding Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the data layer, composable, server-side integration, and persistent UI prompts that form the foundation of the new DEJA.js getting-started experience.

**Architecture:** Add an `onboarding` module to `@repo/modules` with types, constants, and a `useOnboarding` composable that reads/writes onboarding state from Firestore `users/{uid}.onboarding`. The DEJA server writes `serverStarted` on first boot. Both Cloud and Throttle apps display persistent banners based on onboarding state. Plan limits config is extended with `devices` and `sensors` fields.

**Tech Stack:** Vue 3 (Composition API), Vuefire, Firebase Firestore, Firebase Admin SDK, TypeScript, Vuetify 3, Vitest

**Spec:** `docs/superpowers/specs/2026-03-23-mvp-getting-started-design.md`

**This is Plan 1 of 5** — see spec §9 for the full phase breakdown. This plan is a prerequisite for Plans 2 (Wizard Redesign) and 3 (Free Tier UX).

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `packages/modules/onboarding/types.ts` | OnboardingState interface |
| Create | `packages/modules/onboarding/constants.ts` | Onboarding step definitions, tips content |
| Create | `packages/modules/onboarding/useOnboarding.ts` | Composable: read/write onboarding state from Firestore |
| Create | `packages/modules/onboarding/index.ts` | Module barrel exports |
| Modify | `packages/modules/index.ts` | Add onboarding module exports |
| Modify | `packages/modules/plans/types.ts` | Add `devices` and `sensors` to PlanLimits |
| Modify | `packages/modules/plans/constants.ts` | Add `devices` and `sensors` values per tier |
| Create | `apps/server/src/lib/onboarding.ts` | Server-side: write `serverStarted` to Firestore on first boot |
| Modify | `apps/server/index.ts` | Call onboarding write after startup completes |
| Create | `packages/ui/src/OnboardingBanner/OnboardingBanner.vue` | Shared persistent prompt banner component |
| Create | `packages/ui/src/OnboardingBanner/index.ts` | Banner barrel export |
| Modify | `packages/ui/src/index.ts` | Export OnboardingBanner |
| Modify | `apps/cloud/src/App.vue` | Add OnboardingBanner below trial banner |
| Modify | `apps/throttle/src/views/HomeView.vue` | Add onboarding prompt below Quick Connect |

> **Note on tests:** The `@repo/modules` package has a vitest config but no existing test files. Unit tests for `useOnboarding` are deferred — composable testing requires Firebase mocking infrastructure that doesn't exist yet in this package. Verification is done via type checking, lint, and manual smoke testing in Task 9.

---

### Task 1: Onboarding Types & Constants

**Files:**
- Create: `packages/modules/onboarding/types.ts`
- Create: `packages/modules/onboarding/constants.ts`
- Create: `packages/modules/onboarding/index.ts`

- [ ] **Step 1: Create OnboardingState types**

```typescript
// packages/modules/onboarding/types.ts
import type { Timestamp } from 'firebase/firestore'

export interface OnboardingState {
  planSelected: boolean
  layoutCreated: boolean
  installStarted: boolean
  installStartedAt: Timestamp | null
  serverStarted: boolean
  serverStartedAt: Timestamp | null
}

export type OnboardingStep =
  | 'account'
  | 'plan'
  | 'layout'
  | 'install'
  | 'ready'

export interface OnboardingStepInfo {
  key: OnboardingStep
  label: string
  description: string
  icon: string
}
```

- [ ] **Step 2: Create onboarding constants**

```typescript
// packages/modules/onboarding/constants.ts
import type { OnboardingState, OnboardingStepInfo } from './types'

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
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
    key: 'plan',
    label: 'Choose Plan',
    description: 'Pick the right plan for your railroad',
    icon: 'mdi-star',
  },
  {
    key: 'layout',
    label: 'Register Layout',
    description: 'Name your layout and get your Layout ID',
    icon: 'mdi-map-marker',
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

- [ ] **Step 3: Create barrel export**

```typescript
// packages/modules/onboarding/index.ts
export * from './types'
export * from './constants'
// Note: useOnboarding export will be added in Task 3 when the file is created.
// Do NOT add it here yet — it would cause a build-breaking import error.
```

- [ ] **Step 4: Commit**

```bash
git add packages/modules/onboarding/
git commit -m "feat(modules): add onboarding types and constants"
```

---

### Task 2: Update PlanLimits with devices & sensors

**Files:**
- Modify: `packages/modules/plans/types.ts`
- Modify: `packages/modules/plans/constants.ts`

- [ ] **Step 1: Add devices and sensors to PlanLimits interface**

In `packages/modules/plans/types.ts`, add two fields to `PlanLimits`:

```typescript
export interface PlanLimits {
  locos: number
  turnouts: number
  signals: number
  effects: number
  sounds: number
  routes: number
  layouts: number
  devices: number      // ← ADD
  sensors: number      // ← ADD
  tourApp: boolean
  remoteMonitoring: boolean
}
```

- [ ] **Step 2: Add values to PLAN_LIMITS in constants**

In `packages/modules/plans/constants.ts`, add `devices` and `sensors` to each tier:

```typescript
hobbyist: {
  // ... existing fields ...
  devices: 1,    // default DCC-EX only
  sensors: 0,
},
engineer: {
  // ... existing fields ...
  devices: 5,
  sensors: 15,
},
conductor: {
  // ... existing fields ...
  devices: Infinity,
  sensors: Infinity,
},
```

- [ ] **Step 3: Verify types compile**

Run: `pnpm --filter=@repo/modules check-types`
Expected: no type errors. Steps 1 and 2 must both be completed before running this — the `PLAN_LIMITS` object (which is typed as `Record<PlanTier, PlanLimits>`) will fail until all three tiers include the new fields.

- [ ] **Step 4: Commit**

```bash
git add packages/modules/plans/types.ts packages/modules/plans/constants.ts
git commit -m "feat(plans): add devices and sensors to plan limits"
```

---

### Task 3: Create useOnboarding Composable

**Files:**
- Create: `packages/modules/onboarding/useOnboarding.ts`
- Modify: `packages/modules/index.ts`

**Context:** Follow the pattern of the existing `useSubscription` composable (`packages/modules/plans/useSubscription.ts`). It reads from Firestore `users/{uid}` via Vuefire's `useDocument`, returns reactive computed properties. The `useLocos` composable (`packages/modules/locos/useLocos.ts`) shows the pattern for accessing layout-scoped collections.

- [ ] **Step 1: Create the composable**

```typescript
// packages/modules/onboarding/useOnboarding.ts
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
  // Starts at 1 (plan step), not 0 (account step), because useOnboarding
  // requires an authenticated user — the account step is always complete.
  const currentStepIndex = computed(() => {
    if (!state.value.planSelected) return 1 // plan step
    if (!state.value.layoutCreated) return 2 // layout step
    if (!state.value.serverStarted) return 3 // install step
    return 4 // ready
  })

  // Write helpers — each is write-once (only writes if field is not already true)
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
    setPlanSelected,
    setLayoutCreated,
    setInstallStarted,
  }
}
```

- [ ] **Step 2: Add useOnboarding export to barrel**

Now that the file exists, update `packages/modules/onboarding/index.ts` to add the export:

```typescript
// packages/modules/onboarding/index.ts
export * from './types'
export * from './constants'
export { useOnboarding } from './useOnboarding'
```

- [ ] **Step 3: Add onboarding exports to modules index**

In `packages/modules/index.ts`, add after the Plans section:

```typescript
// Onboarding
export * from './onboarding'
```

- [ ] **Step 4: Verify types compile**

Run: `pnpm --filter=@repo/modules check-types`
Expected: passes (Vuefire and Firebase types should resolve)

- [ ] **Step 5: Commit**

```bash
git add packages/modules/onboarding/useOnboarding.ts packages/modules/onboarding/index.ts packages/modules/index.ts
git commit -m "feat(modules): add useOnboarding composable"
```

---

### Task 4: Server-Side serverStarted Write

**Files:**
- Create: `apps/server/src/lib/onboarding.ts`
- Modify: `apps/server/index.ts`

**Context:** The server entry point (`apps/server/index.ts`) runs `validateSubscription()` first, then `readConfig()` to get `uid` and `layoutId`. After all subsystems initialize, it logs "DEJA.js Server is running!". We insert the onboarding write just before that log line.

The server uses Firebase Admin SDK via `@repo/firebase-config/firebase-admin-node`. The existing write pattern is `db.collection('layouts').doc(layoutId).set({...}, { merge: true })` (see `apps/server/src/dejaCloud.ts` line 95-110 for `serverStatus` writes).

- [ ] **Step 1: Create server onboarding module**

```typescript
// apps/server/src/lib/onboarding.ts
import { db } from '@repo/firebase-config/firebase-admin-node'
import { FieldValue } from 'firebase-admin/firestore'
import { log } from '../utils/logger.js'

/**
 * Mark that the server has started for the first time.
 * This is a write-once operation — if serverStarted is already true, it's a no-op.
 */
export async function markServerStarted(uid: string): Promise<void> {
  try {
    const userRef = db.collection('users').doc(uid)
    const userDoc = await userRef.get()
    const onboarding = userDoc.data()?.onboarding

    if (onboarding?.serverStarted) {
      log.info('Server already marked as started, skipping')
      return
    }

    await userRef.set(
      {
        onboarding: {
          serverStarted: true,
          serverStartedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    )
    log.success('Marked server as started for first time')
  } catch (error) {
    // Non-fatal — don't prevent server startup if this fails
    log.warn('Failed to mark server as started:', error)
  }
}
```

**Important:** The server uses a signale-based logger at `apps/server/src/utils/logger.js`, NOT `@repo/utils` `createLogger`. The signale logger has methods: `start`, `success`, `error`, `fatal`, `warn`, `note`, `info` (no `debug`).

- [ ] **Step 2: Call markServerStarted in server startup**

In `apps/server/index.ts`, add the import at the top with other imports:

```typescript
import { markServerStarted } from './src/lib/onboarding.js'
```

**Important scoping issue:** In `index.ts`, `const config = await readConfig()` is declared inside an inner `try` block (~line 33-43) and is NOT accessible outside that block. You must:

1. First, export the `DejaConfig` interface in `apps/server/src/lib/subscription.ts` — find the line `interface DejaConfig {` and add `export` in front of it: `export interface DejaConfig {`
2. In `index.ts`, import it: `import type { DejaConfig } from './src/lib/subscription.js'`
3. Add `let config: DejaConfig` before the inner `try` block
4. Change `const config = await readConfig()` to `config = await readConfig()` inside the `try`

Then add the call after all subsystems initialize but before the "running" log. Find the line that logs "DEJA.js Server is running!" and add just before it:

```typescript
  // Mark onboarding serverStarted (write-once, non-blocking)
  await markServerStarted(config.uid)
```

- [ ] **Step 3: Verify server compiles**

Run: `pnpm --filter=deja-serverts build`
Expected: builds successfully

- [ ] **Step 4: Commit**

```bash
git add apps/server/src/lib/onboarding.ts apps/server/index.ts
git commit -m "feat(server): write onboarding serverStarted flag on first boot"
```

---

### Task 5: OnboardingBanner Shared Component

**Files:**
- Create: `packages/ui/src/OnboardingBanner/OnboardingBanner.vue`
- Create: `packages/ui/src/OnboardingBanner/index.ts`
- Modify: `packages/ui/src/index.ts`

**Context:** The Cloud app already has a trial banner using Vuetify's `v-banner` component (see `apps/cloud/src/App.vue` lines 108-121). The onboarding banner follows the same pattern but with different content based on onboarding state. This is a shared component because both Cloud and Throttle need it.

The component receives onboarding state and loco count as props — it does NOT call `useOnboarding()` itself. This keeps it decoupled and testable. The parent app calls the composable and passes data down.

- [ ] **Step 1: Create the OnboardingBanner component**

```vue
<!-- packages/ui/src/OnboardingBanner/OnboardingBanner.vue -->
<script setup lang="ts">
import type { OnboardingState } from '@repo/modules'

interface Props {
  state: OnboardingState
  locoCount: number
  variant?: 'cloud' | 'throttle'
  installCommand?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'cloud',
  installCommand: 'curl -fsSL https://install.dejajs.com | bash',
})

const emit = defineEmits<{
  'add-loco': []
  'open-throttle': []
  'open-cloud-setup': []
  'dismiss': []
}>()
</script>

<template>
  <!-- State 1: Server never started — prompt to install -->
  <v-banner
    v-if="!state.serverStarted"
    lines="two"
    color="info"
    density="comfortable"
    class="text-body-2"
    icon="mdi-download"
  >
    <template #text>
      <template v-if="variant === 'cloud'">
        <strong>🚂 Install & start your server</strong> to connect your railroad.
        <span class="text-medium-emphasis ml-1">
          Run the install command on the machine connected to your CommandStation.
        </span>
      </template>
      <template v-else>
        <strong>🚂 Connect your server</strong> to start driving.
        <span class="text-medium-emphasis ml-1">
          Set up your server in DEJA Cloud to get started.
        </span>
      </template>
    </template>
    <template #actions>
      <v-btn
        v-if="variant === 'throttle'"
        variant="tonal"
        size="small"
        color="info"
        @click="emit('open-cloud-setup')"
      >
        Open Cloud Setup
      </v-btn>
    </template>
  </v-banner>

  <!-- State 2: Server started but no locos — prompt to add -->
  <v-banner
    v-else-if="locoCount === 0"
    lines="one"
    color="warning"
    density="comfortable"
    class="text-body-2"
    icon="mdi-train"
  >
    <template #text>
      <strong>Add your first locomotive</strong> to get started.
      <span class="text-medium-emphasis ml-1">
        You just need a DCC address and a name.
      </span>
    </template>
    <template #actions>
      <v-btn
        variant="tonal"
        size="small"
        color="warning"
        @click="emit('add-loco')"
      >
        Add Loco
      </v-btn>
    </template>
  </v-banner>

  <!-- State 3: Server started + locos exist — ready to drive! -->
  <v-banner
    v-else-if="variant === 'cloud'"
    lines="one"
    color="success"
    density="comfortable"
    class="text-body-2"
    icon="mdi-check-circle"
  >
    <template #text>
      🎉 <strong>Your railroad is ready!</strong> Open the Throttle to start driving.
    </template>
    <template #actions>
      <v-btn
        variant="tonal"
        size="small"
        color="success"
        @click="emit('open-throttle')"
      >
        Open Throttle
      </v-btn>
      <v-btn
        variant="text"
        size="small"
        @click="emit('dismiss')"
      >
        Dismiss
      </v-btn>
    </template>
  </v-banner>
</template>
```

- [ ] **Step 2: Create barrel export**

```typescript
// packages/ui/src/OnboardingBanner/index.ts
export { default as OnboardingBanner } from './OnboardingBanner.vue'
```

- [ ] **Step 3: Add export to @repo/ui index**

In `packages/ui/src/index.ts`, add:

```typescript
export { OnboardingBanner } from './OnboardingBanner/index'
```

Look at the existing exports in the file to place it alphabetically or with other component exports.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/OnboardingBanner/ packages/ui/src/index.ts
git commit -m "feat(ui): add OnboardingBanner shared component"
```

---

### Task 6: Integrate OnboardingBanner in Cloud App

**Files:**
- Modify: `apps/cloud/src/App.vue`

**Context:** The Cloud `App.vue` already imports `useSubscription` and renders a trial `v-banner` (lines 108-121). We add `useOnboarding` and `useLocos` alongside it, then render the `OnboardingBanner` component right below the trial banner. The banner only shows when onboarding is not complete and the user is not on a fullscreen page (like the onboarding wizard itself).

- [ ] **Step 1: Add imports to Cloud App.vue script**

In `apps/cloud/src/App.vue`, add these imports alongside the existing ones:

```typescript
import { useOnboarding } from '@repo/modules'
import { OnboardingBanner } from '@repo/ui'
```

Then add the composable call after the existing `useSubscription()` call (~line 79):

```typescript
const { state: onboardingState, isComplete: onboardingComplete } = useOnboarding()
```

We need the loco count. The Cloud app's roster page uses `useLocos()` but `App.vue` doesn't currently import it. Add:

```typescript
import { useLocos } from '@repo/modules'
```

And call it:

```typescript
const { getLocos } = useLocos()
const locos = getLocos()
const locoCount = computed(() => locos.value?.length ?? 0)
```

**Important:** `useLocos()` returns `getLocos` (a function), not `locos` directly. You must call `getLocos()` to get the reactive Vuefire collection.

Also add a `dismissedOnboarding` ref for the "dismiss" action. Note: `useStorage` is already imported in `App.vue` (line 3) — do NOT add a duplicate import:

```typescript
const dismissedOnboarding = useStorage('@DEJA/dismissedOnboardingBanner', false)
```

Add handler functions for template actions (avoid `window.open` directly in templates):

```typescript
function openThrottle() {
  window.open('https://throttle.dejajs.com', '_blank')
}
```

- [ ] **Step 2: Add the banner to the template**

In `apps/cloud/src/App.vue`, find the trial banner (the `v-banner` with `v-if="!isFullscreen && isTrialing"` around line 108). Add the onboarding banner right after it:

```vue
<OnboardingBanner
  v-if="!isFullscreen && !onboardingComplete && !dismissedOnboarding"
  :state="onboardingState"
  :loco-count="locoCount"
  variant="cloud"
  @add-loco="router.push({ name: 'Roster' })"
  @open-throttle="openThrottle"
  @dismiss="dismissedOnboarding = true"
/>
```

**Note:** Cloud app route name is `'Roster'` (PascalCase), not `'roster'` (lowercase). Check `apps/cloud/src/router.ts` for exact route names.

- [ ] **Step 3: Verify the Cloud app builds**

Run: `pnpm --filter=deja-cloud build`
Expected: builds successfully

- [ ] **Step 4: Commit**

```bash
git add apps/cloud/src/App.vue
git commit -m "feat(cloud): add persistent onboarding banner"
```

---

### Task 7: Integrate Onboarding Prompt in Throttle App

**Files:**
- Modify: `apps/throttle/src/views/HomeView.vue`

**Context:** The Throttle `HomeView.vue` currently shows a `DeviceStatusList` when authenticated with a layout. The onboarding prompt should appear above the throttle list when onboarding is incomplete. The Throttle app already uses `@repo/modules` for other composables.

- [ ] **Step 1: Add imports and composable calls**

In `apps/throttle/src/views/HomeView.vue`, add these imports:

```typescript
import { useOnboarding } from '@repo/modules'
import { OnboardingBanner } from '@repo/ui'
```

Add the composable call in the script setup:

```typescript
const { state: onboardingState, isComplete: onboardingComplete } = useOnboarding()
```

The Throttle HomeView needs the loco count. Check if `useLocos` is already imported — if not, add:

```typescript
import { useLocos } from '@repo/modules'
const { getLocos } = useLocos()
const locos = getLocos()
const locoCount = computed(() => locos.value?.length ?? 0)
```

**Important:** `useLocos()` returns `getLocos` (a function), not `locos` directly. Call `getLocos()` to get the reactive collection.

Add a handler function for the cloud setup link:

```typescript
function openCloudSetup() {
  window.open('https://cloud.dejajs.com', '_blank')
}
```

- [ ] **Step 2: Add the banner to the template**

In the authenticated+layout-selected section of the template (the section that currently renders `DeviceStatusList`), add the banner just above the existing content:

```vue
<OnboardingBanner
  v-if="!onboardingComplete"
  :state="onboardingState"
  :loco-count="locoCount"
  variant="throttle"
  @add-loco="router.push({ name: 'roster' })"
  @open-cloud-setup="openCloudSetup"
  class="mb-4"
/>
```

**Note:** Throttle app route name is `'roster'` (lowercase). This is correct — the Throttle app uses lowercase route names, unlike Cloud which uses PascalCase.

- [ ] **Step 3: Verify the Throttle app builds**

Run: `pnpm --filter=deja-throttle build`
Expected: builds successfully

- [ ] **Step 4: Commit**

```bash
git add apps/throttle/src/views/HomeView.vue
git commit -m "feat(throttle): add persistent onboarding prompt on homepage"
```

---

### Task 8: Wire Onboarding Writes into Existing Wizard Steps

**Files:**
- Modify: `apps/cloud/src/Onboarding/OnboardingWizard.vue`

**Context:** The existing onboarding wizard (`OnboardingWizard.vue`) already handles step progression. We need to wire `useOnboarding()` write helpers into the step completion handlers so the onboarding state gets persisted to Firestore as the user completes each step.

Currently the wizard tracks steps with `currentStep = ref(1)`. When a step emits `complete`, the wizard increments `currentStep`. We add onboarding state writes at these same points.

- [ ] **Step 1: Add useOnboarding to the wizard**

In `apps/cloud/src/Onboarding/OnboardingWizard.vue`, import and call the composable:

```typescript
import { useOnboarding } from '@repo/modules'
const { setPlanSelected, setLayoutCreated, setInstallStarted } = useOnboarding()
```

- [ ] **Step 2: Wire setPlanSelected to plan step completion**

Find where PlanStep emits `complete` and the wizard advances. Add the onboarding write:

```typescript
// In the handler where PlanStep completes (look for @complete on PlanStep)
async function handlePlanComplete(payload: { plan: PlanTier; billingCycle: BillingCycle | null }) {
  await setPlanSelected()
  // ... existing logic to advance step ...
}
```

If the existing code uses an inline `@complete` handler, extract it to a named function and add the write.

- [ ] **Step 3: Wire setLayoutCreated to layout step completion**

Same pattern — find where LayoutStep emits `complete`:

```typescript
async function handleLayoutComplete() {
  await setLayoutCreated()
  // ... existing logic to advance step ...
}
```

- [ ] **Step 4: Wire setInstallStarted when user reaches install step**

The install step should mark `installStarted` when the user enters Step 4. Use a watcher:

```typescript
watch(currentStep, (step) => {
  // Step 4 is the install step (0-indexed: step 4 in the stepper)
  if (step === 4) {
    setInstallStarted()
  }
})
```

Alternatively, mark it when the step transition happens rather than with a watcher — depends on the existing step logic. Check the wizard to see how `currentStep` advances and pick the cleanest integration point.

- [ ] **Step 5: Verify the Cloud app builds**

Run: `pnpm --filter=deja-cloud build`
Expected: builds successfully

- [ ] **Step 6: Commit**

```bash
git add apps/cloud/src/Onboarding/OnboardingWizard.vue
git commit -m "feat(cloud): persist onboarding state during wizard steps"
```

---

### Task 9: Lint, Type-Check, and Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run full lint**

```bash
pnpm lint
```

Expected: passes with no new errors. Fix any lint issues introduced by previous tasks.

- [ ] **Step 2: Run full type check**

```bash
pnpm check-types
```

Expected: passes. All new types should be consistent across packages.

- [ ] **Step 3: Run throttle unit tests**

```bash
pnpm --filter=deja-throttle test:unit
```

Expected: existing tests still pass (our changes are additive).

- [ ] **Step 4: Manual smoke test checklist**

If dev servers are available, verify:
- [ ] Cloud app loads without errors
- [ ] Trial banner still appears for trial users
- [ ] Onboarding banner appears for users without `serverStarted`
- [ ] Throttle app loads without errors
- [ ] Onboarding prompt appears on Throttle homepage

- [ ] **Step 5: Final commit (if any lint/type fixes were needed)**

```bash
git add -A
git commit -m "fix: lint and type-check fixes for onboarding foundation"
```

---

## Summary

After completing all 9 tasks, you will have:

1. ✅ `OnboardingState` types and constants in `@repo/modules/onboarding`
2. ✅ `useOnboarding()` composable reading/writing Firestore `users/{uid}.onboarding`
3. ✅ `PlanLimits` extended with `devices` and `sensors`
4. ✅ Server writes `serverStarted` flag on first boot
5. ✅ `OnboardingBanner` shared component in `@repo/ui`
6. ✅ Persistent onboarding banner in Cloud app
7. ✅ Persistent onboarding prompt in Throttle app
8. ✅ Wizard steps persist onboarding state to Firestore
9. ✅ All lint, type checks, and existing tests passing

**Scope notes:**
- The "pizza tracker" progress bar component is deferred to **Plan 2** (Wizard Redesign). The `OnboardingBanner` in this plan uses simple `v-banner` components, not the animated tracker.
- Both `useOnboarding()` and `useSubscription()` independently read from the same `users/{uid}` Firestore document. Vuefire may deduplicate these listeners, but if performance is a concern in Plan 2, consider sharing the document reference between composables.

**Next plan:** Plan 2 (Onboarding Wizard + Pizza Tracker) builds on this foundation to redesign the install step with the productive wait experience.
