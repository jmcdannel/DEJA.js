# Feature Flags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate dev-only features (sounds, track diagrams, routes, sensors, tour app) behind user role + env var checks so the project owner can test on production while regular users only see GA features.

**Architecture:** New `features/` module in `@repo/modules` with a pure `isFeatureAccessible()` function shared by a Vue composable (`useFeatureFlags`) and a route guard (`checkRequireFeature`). Feature flags are hardcoded in a TypeScript config. Access is determined by Firestore `users/{uid}.role` field + `VITE_DEV_FEATURES` env var.

**Tech Stack:** Vue 3 Composition API, VueFire, Firebase Firestore, Vue Router, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-23-feature-flags-design.md`

---

## File Map

### New files
| File | Responsibility |
|------|---------------|
| `packages/modules/features/types.ts` | Pure type declarations: `FeatureStage`, `FeatureName`, `UserRole` |
| `packages/modules/features/flags.ts` | Flag registry, `STAGE_ACCESS` map, `isFeatureAccessible()` pure function |
| `packages/modules/features/useFeatureFlags.ts` | Vue composable: reads Firestore role + env var, exposes `isEnabled()` |
| `packages/modules/features/index.ts` | Barrel exports |
| `packages/auth/src/guards/requireFeature.ts` | Route guard: `checkRequireFeature()` |
| `packages/ui/src/FeatureGate.vue` | `<FeatureGate feature="x">` wrapper component |
| `apps/tour/src/views/NotAvailable.vue` | "Tour App coming soon" page |

### Modified files
| File | Change |
|------|--------|
| `packages/modules/plans/types.ts` | Add `role?: UserRole` to `UserDocument` |
| `packages/modules/package.json` | Add `"./features"` to exports map |
| `packages/modules/index.ts` | Add `export * from './features'` |
| `packages/ui/src/index.ts` | Export `FeatureGate` |
| `packages/ui/src/Menu/types.ts` | Add `feature?: FeatureName` to `MenuItem` |
| `packages/auth/src/guards/index.ts` | Export `checkRequireFeature` |
| `apps/cloud/src/router.ts` | Add `requireFeature` guard + meta, remove `requireApproval` |
| `apps/cloud/src/Core/Menu/useMenu.ts` | Filter menu by feature flags |
| `apps/tour/src/router/index.ts` | Add `beforeEach` guard for `tourApp` flag |
| `.env.example` | Document `VITE_DEV_FEATURES` |

---

## Task 1: Core types and flag registry

**Files:**
- Create: `packages/modules/features/types.ts`
- Create: `packages/modules/features/flags.ts`
- Create: `packages/modules/features/index.ts`

- [ ] **Step 1: Create types file**

Create `packages/modules/features/types.ts`:

```typescript
// No imports from other feature files — this is the base type module.

export type FeatureStage = 'dev' | 'alpha' | 'beta' | 'ga'

/** Explicit union of all feature flag keys. Update when adding new flags. */
export type FeatureName = 'sounds' | 'trackDiagrams' | 'routes' | 'sensors' | 'tourApp'

export type UserRole = 'admin' | 'user'
```

- [ ] **Step 2: Create flags file with registry and pure function**

Create `packages/modules/features/flags.ts`:

```typescript
import type { FeatureStage, FeatureName, UserRole } from './types'

/** Stage access hierarchy — each role can see stages at or above its access level. */
export const STAGE_ACCESS: Record<UserRole, FeatureStage[]> = {
  admin: ['dev', 'alpha', 'beta', 'ga'],
  user: ['ga'],
}

/**
 * Feature flag registry — maps feature names to their current release stage.
 * Typed as Record<FeatureName, FeatureStage> so TypeScript catches mismatches
 * when the FeatureName union is updated.
 */
export const FEATURE_FLAGS: Record<FeatureName, FeatureStage> = {
  sounds: 'dev',
  trackDiagrams: 'dev',
  routes: 'dev',
  sensors: 'dev',
  tourApp: 'dev',
}

/**
 * Pure function to check feature accessibility.
 * Shared by both the Vue composable and the route guard.
 */
export function isFeatureAccessible(
  feature: FeatureName,
  userRole: UserRole,
  devFeaturesEnv = false,
): boolean {
  if (devFeaturesEnv) return true
  const stage = FEATURE_FLAGS[feature]
  return STAGE_ACCESS[userRole].includes(stage)
}
```

- [ ] **Step 3: Create barrel export (without composable — added in Task 2)**

Create `packages/modules/features/index.ts`:

```typescript
export { FEATURE_FLAGS, STAGE_ACCESS, isFeatureAccessible } from './flags'
export * from './types'
```

Note: `useFeatureFlags` is NOT exported yet — the file doesn't exist until Task 2. We add that export line in Task 2.

- [ ] **Step 4: Add Vite client types to `@repo/modules` tsconfig**

The composable (Task 2) uses `import.meta.env.VITE_DEV_FEATURES`. The `@repo/modules` tsconfig does not include Vite client types — `import.meta.env` would cause a TS error.

Modify `packages/modules/tsconfig.json`. Add `"types": ["vite/client"]` to `compilerOptions`:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "include": ["./**/*"],
  "exclude": ["dist", "build", "node_modules"],
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "noEmit": false,
    "outDir": "./dist",
    "rootDir": ".",
    "allowImportingTsExtensions": false,
    "types": ["vite/client"]
  }
}
```

- [ ] **Step 5: Add `"./features"` to `@repo/modules` package.json exports**

Modify `packages/modules/package.json`. Add to the `"exports"` map (after `"./feedback"`):

```json
    "./features": "./features/index.ts"
```

- [ ] **Step 6: Add `role` to `UserDocument` type**

Modify `packages/modules/plans/types.ts`. Add import at top of file:

```typescript
import type { UserRole } from '../features/types'
```

Add `role` field to the `UserDocument` interface (after `subscription`):

```typescript
  role?: UserRole
```

The full interface becomes:
```typescript
export interface UserDocument {
  email: string
  displayName: string | null
  createdAt: Timestamp
  subscription: UserSubscription
  role?: UserRole
}
```

- [ ] **Step 7: Export features module from `@repo/modules`**

Modify `packages/modules/index.ts`. Add at the end of the file:

```typescript
// Features
export * from './features'
```

- [ ] **Step 8: Verify types compile**

Run: `pnpm --filter=@repo/modules exec tsc --noEmit`

Expected: No errors.

- [ ] **Step 9: Commit**

```bash
git add packages/modules/features/ packages/modules/plans/types.ts packages/modules/index.ts packages/modules/tsconfig.json packages/modules/package.json
git commit -m "feat: add feature flags types, registry, and isFeatureAccessible()"
```

---

## Task 2: `useFeatureFlags()` composable

**Files:**
- Create: `packages/modules/features/useFeatureFlags.ts`

- [ ] **Step 1: Create the composable**

Create `packages/modules/features/useFeatureFlags.ts`:

```typescript
import { computed } from 'vue'
import { useCurrentUser, useFirestore, useDocument } from 'vuefire'
import { doc } from 'firebase/firestore'
import { isFeatureAccessible, FEATURE_FLAGS } from './flags'
import type { FeatureName, UserRole } from './types'

export function useFeatureFlags() {
  const user = useCurrentUser()
  const db = useFirestore()

  const userDocRef = computed(() => {
    if (!user.value) return null
    return doc(db, 'users', user.value.uid)
  })
  const userDoc = useDocument(userDocRef)

  const devFeaturesEnv = import.meta.env.VITE_DEV_FEATURES === 'true'

  const userRole = computed<UserRole>(() => userDoc.value?.role ?? 'user')

  const isAdmin = computed(() => userRole.value === 'admin' || devFeaturesEnv)

  function isEnabled(feature: FeatureName): boolean {
    return isFeatureAccessible(feature, userRole.value, devFeaturesEnv)
  }

  const enabledFeatures = computed<FeatureName[]>(() =>
    (Object.keys(FEATURE_FLAGS) as FeatureName[]).filter(f => isEnabled(f))
  )

  return { isEnabled, enabledFeatures, userRole, isAdmin }
}
```

- [ ] **Step 2: Add composable export to barrel**

Modify `packages/modules/features/index.ts`. Add the composable export:

```typescript
export { FEATURE_FLAGS, STAGE_ACCESS, isFeatureAccessible } from './flags'
export { useFeatureFlags } from './useFeatureFlags'
export * from './types'
```

- [ ] **Step 3: Verify types compile**

Run: `pnpm --filter=@repo/modules exec tsc --noEmit`

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add packages/modules/features/useFeatureFlags.ts packages/modules/features/index.ts
git commit -m "feat: add useFeatureFlags() composable"
```

---

## Task 3: Route guard and `FeatureGate` component

**Files:**
- Create: `packages/auth/src/guards/requireFeature.ts`
- Modify: `packages/auth/src/guards/index.ts`
- Create: `packages/ui/src/FeatureGate.vue`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/Menu/types.ts`

- [ ] **Step 1: Create the route guard**

Create `packages/auth/src/guards/requireFeature.ts`:

```typescript
import type { RouteLocationRaw } from 'vue-router'
import type { FeatureName, UserRole } from '@repo/modules'
import { isFeatureAccessible } from '@repo/modules'

/**
 * Route guard that checks if a feature is accessible to the current user.
 * Used in the Cloud app's beforeEach chain via route meta.
 */
export function checkRequireFeature(
  featureName: FeatureName,
  userRole: UserRole,
  devFeaturesEnv: boolean,
): RouteLocationRaw | undefined {
  if (!isFeatureAccessible(featureName, userRole, devFeaturesEnv)) {
    return { path: '/' }
  }
}
```

- [ ] **Step 2: Export the guard**

Modify `packages/auth/src/guards/index.ts`. Add at end:

```typescript
export * from './requireFeature'
```

- [ ] **Step 3: Create `FeatureGate` component**

Create `packages/ui/src/FeatureGate.vue`:

```vue
<script setup lang="ts">
import { useFeatureFlags } from '@repo/modules'
import type { FeatureName } from '@repo/modules'

const props = defineProps<{
  feature: FeatureName
}>()

const { isEnabled } = useFeatureFlags()
</script>

<template>
  <slot v-if="isEnabled(props.feature)" />
  <slot v-else name="fallback" />
</template>
```

- [ ] **Step 4: Export `FeatureGate` from `@repo/ui`**

Modify `packages/ui/src/index.ts`. Add after the last component export (before the `// Themes` comment at line 71):

```typescript
export { default as FeatureGate } from './FeatureGate.vue'
```

- [ ] **Step 5: Add `feature` field to `MenuItem` type**

Modify `packages/ui/src/Menu/types.ts`. Add import at top:

```typescript
import type { FeatureName } from '@repo/modules'
```

Add to the `MenuItem` interface (after `isFavorite`):

```typescript
  feature?: FeatureName
```

Full file becomes:
```typescript
import type { FeatureName } from '@repo/modules'

export interface MenuItem {
  color: string;
  icon: string;
  label: string;
  name: string;
  section?: 'modules' | 'hardware' | 'system';
  isFavorite?: boolean;
  feature?: FeatureName;
}

export interface SuiteApp {
  label: string;
  icon: string;
  href: string;
}
```

- [ ] **Step 6: Verify types compile**

Run: `pnpm check-types`

Expected: No errors across all packages.

- [ ] **Step 7: Commit**

```bash
git add packages/auth/src/guards/requireFeature.ts packages/auth/src/guards/index.ts packages/ui/src/FeatureGate.vue packages/ui/src/index.ts packages/ui/src/Menu/types.ts
git commit -m "feat: add checkRequireFeature guard, FeatureGate component, MenuItem.feature field"
```

---

## Task 4: Cloud app — route gating

**Files:**
- Modify: `apps/cloud/src/router.ts`

- [ ] **Step 1: Add imports**

In `apps/cloud/src/router.ts`, modify the Firestore import at line 7:

```typescript
// Before:
import { collection, query, where, getDocs } from 'firebase/firestore'
// After:
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore'
```

Add new imports after the existing imports (after line 9):

```typescript
import { checkRequireFeature } from '@repo/auth'
import type { FeatureName, UserRole } from '@repo/modules'
```

- [ ] **Step 2: Add cache variables and update RouteMeta type**

Add module-level cache variables after the `log` declaration (after line 13):

```typescript
let cachedUserRole: UserRole | null = null
let cachedUserId: string | null = null
```

Update the `RouteMeta` interface declaration (lines 21-34). Remove `requireApproval` if present. Add `requireFeature`:

```typescript
declare module 'vue-router' {
  interface RouteMeta {
    /** Redirect away if the user is already authenticated (login/signup pages) */
    redirectIfAuthenticated?: boolean
    /** Require an authenticated user – redirect to /login if missing */
    requireAuth?: boolean
    /** Require that the user has completed onboarding (has at least one layout) */
    requireOnboarding?: boolean
    /** Require that a layout is selected in localStorage */
    requireLayout?: boolean
    /** Require a DCC-EX device on the selected layout */
    requireDccEx?: boolean
    /** Require a feature flag to be enabled for the current user */
    requireFeature?: FeatureName
  }
}
```

- [ ] **Step 3: Remove all `requireApproval` and add `requireFeature` meta**

**First: remove `requireApproval: true` from all 6 routes that have it** (consolidated checklist):

1. `/sounds` (line 112) — remove `requireApproval: true`
2. `/sounds/new` (line 118) — remove `requireApproval: true`
3. `/track-diagrams` (line 238) — remove `requireApproval: true`
4. `/track-diagrams/new` (line 244) — remove `requireApproval: true`
5. `/track-diagrams/:diagramId` (line 250) — remove `requireApproval: true`
6. `/upgrade` (line 274) — remove `requireApproval: true` (do NOT add `requireFeature` — upgrade page should be accessible to all users)

**Then: add `requireFeature` to gated routes:**

Sounds (2 routes):
- `/sounds` → add `requireFeature: 'sounds'`
- `/sounds/new` → add `requireFeature: 'sounds'`

Track Diagrams (3 routes):
- `/track-diagrams` → add `requireFeature: 'trackDiagrams'`
- `/track-diagrams/new` → add `requireFeature: 'trackDiagrams'`
- `/track-diagrams/:diagramId` → add `requireFeature: 'trackDiagrams'`

Routes (3 routes — **newly restricted**, not previously gated):
- `/routes` → add `requireFeature: 'routes'`
- `/routes/new` → add `requireFeature: 'routes'`
- `/routes/:routeId` → add `requireFeature: 'routes'`

Sensors (6 routes — **newly restricted**, not previously gated):
- `/sensors` → add `requireFeature: 'sensors'`
- `/sensors/new` → add `requireFeature: 'sensors'`
- `/sensors/automations` → add `requireFeature: 'sensors'`
- `/sensors/automations/new` → add `requireFeature: 'sensors'`
- `/sensors/automations/:automationId` → add `requireFeature: 'sensors'`
- `/sensors/:sensorId` → add `requireFeature: 'sensors'`

- [ ] **Step 4: Add feature flag guard to `beforeEach` chain**

In the `beforeEach` callback, add step 6 after the `requireDccEx` check (after line ~432, before the "All guards passed" comment):

```typescript
    // 6. Require feature flag
    if (meta.requireFeature) {
      if (!cachedUserRole || cachedUserId !== user.uid) {
        const userSnap = await getDoc(doc(db, 'users', user.uid))
        cachedUserRole = (userSnap.data()?.role as UserRole) ?? 'user'
        cachedUserId = user.uid
      }
      const devFeaturesEnv = import.meta.env.VITE_DEV_FEATURES === 'true'
      const redirect = checkRequireFeature(meta.requireFeature, cachedUserRole, devFeaturesEnv)
      if (redirect) {
        log.debug('requireFeature → redirecting (feature not enabled)')
        return redirect
      }
    }
```

- [ ] **Step 5: Update stale JSDoc comment**

Update the `getUserLayouts` function's JSDoc (line ~320):

```typescript
// Before:
/** Fetch the user's layouts once — shared by onboarding & approval guards. */
// After:
/** Fetch the user's layouts once for the onboarding guard. */
```

- [ ] **Step 6: Verify types compile**

Run: `pnpm --filter=deja-cloud exec tsc --noEmit`

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add apps/cloud/src/router.ts
git commit -m "feat: add requireFeature route guard to Cloud app, remove requireApproval"
```

---

## Task 5: Cloud app — nav menu filtering

**Files:**
- Modify: `apps/cloud/src/Core/Menu/useMenu.ts`

- [ ] **Step 1: Add feature flags to menu items and filter**

Modify `apps/cloud/src/Core/Menu/useMenu.ts`. The full file replacement:

```typescript
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { MenuItem } from '@repo/ui/src/Menu/types'
import { useFeatureFlags } from '@repo/modules'


export function useMenu() {
  const router = useRouter()
  const { isEnabled } = useFeatureFlags()

  const menuConfig: MenuItem[] = [
    // Dashboard commented out — leave as-is
    // { label: 'Dashboard', icon: 'mdi-view-dashboard', color: 'violet' },

    // Modules
    { color: 'pink',    icon: 'mdi-train',           label: 'Roster',         name: 'roster',         section: 'modules' },
    { color: 'amber',   icon: 'mdi-call-split',      label: 'Turnouts',       name: 'turnouts',       section: 'modules' },
    { color: 'purple',  icon: 'mdi-map',             label: 'Routes',         name: 'routes',         section: 'modules', feature: 'routes' },
    { color: 'indigo',  icon: 'mdi-rocket-launch',   label: 'Effects',        name: 'effects',        section: 'modules' },
    { color: 'emerald', icon: 'mdi-traffic-light',   label: 'Signals',        name: 'signals',        section: 'modules' },
    { color: 'sky',     icon: 'mdi-volume-high',     label: 'Sounds',         name: 'sounds',         section: 'modules', feature: 'sounds' },
    { color: 'violet',  icon: 'mdi-map-marker-path', label: 'Track Diagrams', name: 'track-diagrams', section: 'modules', feature: 'trackDiagrams' },

    // Hardware
    { color: 'teal',    icon: 'mdi-access-point',    label: 'Sensors',        name: 'sensors',        section: 'hardware', feature: 'sensors' },
    { color: 'cyan',    icon: 'mdi-developer-board', label: 'Devices',        name: 'devices',        section: 'hardware' },
    { color: 'lime',    icon: 'mdi-cpu-64-bit',      label: 'DCC-EX',         name: 'dcc-ex',         section: 'hardware' },

    // System
    { color: 'blue',    icon: 'mdi-cog',             label: 'Settings',       name: 'settings',       section: 'system' },
    { color: 'rose',    icon: 'mdi-console',         label: 'Emulator',       name: 'emulator',       section: 'system' },
  ]

  const menu = computed(() =>
    menuConfig.filter(item => !item.feature || isEnabled(item.feature))
  )

  function handleMenu(item: MenuItem) {
    router.push({ name: item.label })
  }

  function getMenuItem(label: string) {
    return menuConfig.find((item) => item.label === label)
  }

  return {
    getMenuItem,
    handleMenu,
    menu,
  }
}

export default useMenu
```

Key changes:
- Import `computed` from vue, `useFeatureFlags` from `@repo/modules`
- Add `feature` property to Sounds, Track Diagrams, Routes, Sensors menu items (no `as FeatureName` cast needed — `MenuItem.feature` is typed as `FeatureName | undefined`)
- Preserve the commented-out Dashboard entry
- Change `menu` from a plain array to a `computed` that filters by `isEnabled`

- [ ] **Step 2: Verify the Cloud app still type-checks**

Run: `pnpm --filter=deja-cloud exec tsc --noEmit`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/Core/Menu/useMenu.ts
git commit -m "feat: filter Cloud nav menu by feature flags"
```

---

## Task 6: Tour app gating

**Files:**
- Create: `apps/tour/src/views/NotAvailable.vue`
- Modify: `apps/tour/src/router/index.ts`

- [ ] **Step 1: Create NotAvailable view**

Create `apps/tour/src/views/NotAvailable.vue`:

```vue
<script setup lang="ts">
</script>

<template>
  <v-container class="d-flex align-center justify-center min-h-screen">
    <v-card class="text-center pa-8" max-width="480">
      <v-icon size="64" color="primary" class="mb-4">mdi-lock-outline</v-icon>
      <h1 class="text-h5 mb-2">Tour App</h1>
      <p class="text-body-1 text-medium-emphasis">
        This app is not yet available. Check back soon!
      </p>
    </v-card>
  </v-container>
</template>
```

- [ ] **Step 2: Add imports and `beforeEach` guard to Tour router**

Modify `apps/tour/src/router/index.ts`.

**Add new imports** after the existing imports (after line 8, after `import TourLogin from '../views/TourLogin.vue'`):

```typescript
import { getCurrentUser } from 'vuefire'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { isFeatureAccessible } from '@repo/modules'
import type { UserRole } from '@repo/modules'
```

**Add the not-available route** inside the `routes` array, before the 404 catch-all at line 62 (`path: '/:pathMatch(.*)*'`):

```typescript
    {
      path: '/not-available',
      name: 'not-available',
      component: () => import('../views/NotAvailable.vue'),
    },
```

**Add the `beforeEach` guard** between the router creation closing `})` (line 68) and `export default router` (line 70). Uses caching to avoid Firestore fetch on every navigation:

```typescript
const devFeaturesEnv = import.meta.env.VITE_DEV_FEATURES === 'true'
let cachedTourUserRole: UserRole | null = null
let cachedTourUserId: string | null = null

router.beforeEach(async (to) => {
  // Skip pages that don't need feature checks
  if (to.name === 'not-available' || to.name === 'login') return

  // In demo mode, skip feature check
  if (isDemoMode) return

  // Resolve user role from Firestore (cached per session)
  const currentUser = await getCurrentUser()
  if (!currentUser) return // let per-route beforeEnter auth guards handle this

  if (!cachedTourUserRole || cachedTourUserId !== currentUser.uid) {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
    cachedTourUserRole = (userDoc.data()?.role as UserRole) ?? 'user'
    cachedTourUserId = currentUser.uid
  }

  if (!isFeatureAccessible('tourApp', cachedTourUserRole, devFeaturesEnv)) {
    return { name: 'not-available' }
  }
})
```

- [ ] **Step 3: Verify types compile**

Run: `pnpm --filter=deja-tour exec tsc --noEmit`

If that fails (package may not have a tsc script), run: `pnpm check-types`

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add apps/tour/src/views/NotAvailable.vue apps/tour/src/router/index.ts
git commit -m "feat: gate Tour app behind tourApp feature flag"
```

---

## Task 7: Environment variable documentation

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Add `VITE_DEV_FEATURES` to `.env.example`**

Modify `.env.example`. Add after the `CLAUDE_TEST_PASSWORD` line (after line 26):

```bash

# Feature flags — set to 'true' to unlock all dev features locally
VITE_DEV_FEATURES=
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add VITE_DEV_FEATURES to .env.example"
```

---

## Task 8: Full verification

- [ ] **Step 1: Run full type check**

Run: `pnpm check-types`

Expected: No errors across all packages and apps.

- [ ] **Step 2: Run linter**

Run: `pnpm lint`

Expected: No errors (fix any auto-fixable issues).

- [ ] **Step 3: Verify Cloud app builds**

Run: `pnpm --filter=deja-cloud build`

Expected: Build succeeds.

- [ ] **Step 4: Commit any lint fixes**

If lint made changes, stage only the modified files (check `git status` first):
```bash
git status
# Then add specific changed files, e.g.:
# git add packages/modules/features/flags.ts apps/cloud/src/router.ts
git commit -m "style: lint fixes for feature flags"
```

---

## Post-implementation: Manual Firestore setup

After deploying, manually set `role: 'admin'` on the project owner's Firestore `users/{uid}` document. This is a one-time manual step — no migration script needed.
