# Feature Flags — Design Spec

**Date:** 2026-03-23
**Status:** Approved
**Scope:** `packages/modules`, `packages/ui`, `packages/auth`, `apps/cloud`, `apps/tour`
**Spec path:** `docs/superpowers/specs/2026-03-23-feature-flags-design.md`

---

## Context

DEJA.js has features at various stages of readiness — some are built and working but not ready for public release in the MVP launch. The project owner needs to continue using and testing these features (on preview and production deployments) while hiding them from regular users.

Separately, the existing subscription/plan system gates features by payment tier (Hobbyist → Engineer → Conductor). Feature flags address a different concern: **is this feature ready for release?** The two systems are independent and composable — a feature must be both released (GA) AND available on the user's plan to be accessible.

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Gating mechanism | Firestore `users/{uid}.role` + `VITE_DEV_FEATURES` env var | Role works across all environments (local, preview, production); env var is a fast local dev override |
| Flag storage | Hardcoded TypeScript config file | Simple, version-controlled, no infra needed. YAGNI — Firestore-based flags can be added later |
| Separation from plans | New `features/` module in `@repo/modules` | Feature readiness ≠ payment entitlement. Clean separation allows independent evolution |
| Component gating | `<FeatureGate>` component in `@repo/ui` | Declarative, consistent fallback pattern, reusable across apps |
| Route gating | `requireFeature` meta field + guard in Cloud app's `beforeEach` chain | Follows existing meta-based guard pattern in Cloud router |
| Dead code cleanup | Remove unused `requireApproval` meta | Replaced by `requireFeature` — same intent, actually implemented |
| Tour app gating | Router-level `beforeEach` guard | Consistent with route gating pattern; gates entire app |

---

## Feature Stages

```
dev → alpha → beta → ga
```

| Stage | Who can see it |
|-------|---------------|
| `dev` | Admin users (`role: 'admin'`) or `VITE_DEV_FEATURES=true` |
| `alpha` | Future: admin + alpha testers (not implemented yet) |
| `beta` | Future: admin + alpha + beta testers (not implemented yet) |
| `ga` | Everyone |

For MVP, only `dev` and `ga` are meaningful. Alpha/beta stages are defined in the type system but behave identically to `dev` until tester enrollment is built.

---

## Initial Feature Flags

| Feature key | Stage | Where gated | Notes |
|-------------|-------|-------------|-------|
| `sounds` | `dev` | Cloud routes + nav | `/sounds`, `/sounds/new` (replaces `requireApproval`) |
| `trackDiagrams` | `dev` | Cloud routes + nav | `/track-diagrams`, `/track-diagrams/new`, `/track-diagrams/:diagramId` (replaces `requireApproval`) |
| `routes` | `dev` | Cloud routes + nav | `/routes`, `/routes/new`, `/routes/:routeId` (**newly restricted** — currently visible to all users) |
| `sensors` | `dev` | Cloud routes + nav | `/sensors`, `/sensors/new`, `/sensors/:sensorId`, `/sensors/automations/*` (**newly restricted** — currently visible to all users) |
| `tourApp` | `dev` | Tour app router | Entire app gated at router level |

---

## Firestore Data Model

### Addition to `users/{uid}`

```typescript
// Added to existing UserDocument interface
{
  role?: 'admin' | 'user'  // Optional, defaults to 'user' when missing
}
```

**Setup:** Manually set `role: 'admin'` on the project owner's user doc in Firestore. No migration needed — the composable defaults to `'user'` when the field is absent. No Firestore security rule changes needed — this is UI-level gating, not a security boundary.

---

## New Files

### `packages/modules/features/types.ts`

Pure type declarations — no runtime imports to avoid circular dependencies.

```typescript
// No imports from other feature files — this is the base type module.

export type FeatureStage = 'dev' | 'alpha' | 'beta' | 'ga'

/** Explicit union of all feature flag keys. Update when adding new flags. */
export type FeatureName = 'sounds' | 'trackDiagrams' | 'routes' | 'sensors' | 'tourApp'

export type UserRole = 'admin' | 'user'
```

### `packages/modules/features/flags.ts`

Contains all runtime values: the flag registry, stage access map, and the pure accessibility check function.

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

### `packages/modules/features/useFeatureFlags.ts`

```typescript
import { computed } from 'vue'
import { useCurrentUser, useFirestore, useDocument } from 'vuefire'
import { doc } from 'firebase/firestore'
import { isFeatureAccessible, FEATURE_FLAGS } from './flags'
import type { FeatureName, UserRole } from './types'

export function useFeatureFlags() {
  const user = useCurrentUser()
  const db = useFirestore()

  // Read user doc (same pattern as useSubscription)
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

### `packages/modules/features/index.ts`

```typescript
export { FEATURE_FLAGS, isFeatureAccessible } from './flags'
export { useFeatureFlags } from './useFeatureFlags'
export * from './types'
```

### `packages/ui/src/FeatureGate.vue`

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

### `packages/auth/src/guards/requireFeature.ts`

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

---

## Modified Files

### `packages/modules/plans/types.ts`

Add `role` to `UserDocument`. Import `UserRole` from the features module:

```typescript
import type { UserRole } from '../features/types'

export interface UserDocument {
  email: string
  displayName: string | null
  createdAt: Timestamp
  subscription: UserSubscription
  role?: UserRole  // ← add
}
```

Note: `UserRole` is defined in `features/types.ts` since it's part of the feature flags domain. The `plans` module imports it because `UserDocument` represents the full Firestore document shape. This is a one-way dependency (`plans` → `features/types`), not circular.

### `packages/modules/index.ts`

Add features module exports:

```typescript
// Features
export * from './features'
```

### `packages/ui/src/index.ts`

Export `FeatureGate`:

```typescript
export { default as FeatureGate } from './FeatureGate.vue'
```

### `packages/auth/src/guards/index.ts`

Export `checkRequireFeature`:

```typescript
export { checkRequireFeature } from './requireFeature'
```

### `apps/cloud/src/router.ts`

**Route meta type** — add `requireFeature`:

```typescript
interface RouteMeta {
  // ... existing fields ...
  requireFeature?: FeatureName  // ← add
}
```

**Remove** `requireApproval` from the `RouteMeta` type declaration AND from all route definitions. Also update the `getUserLayouts` JSDoc comment (currently references "approval guards" — change to just "onboarding guard").

**Add new imports** to the existing Firestore import line:

```typescript
// Before: import { collection, query, where, getDocs } from 'firebase/firestore'
// After:
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore'
```

Also add:

```typescript
import { checkRequireFeature } from '@repo/auth'
import type { FeatureName, UserRole } from '@repo/modules'
```

**Add `requireFeature` meta** to gated routes:

- `/sounds`, `/sounds/new` → `requireFeature: 'sounds'`
- `/track-diagrams`, `/track-diagrams/new`, `/track-diagrams/:diagramId` → `requireFeature: 'trackDiagrams'`
- `/routes`, `/routes/new`, `/routes/:routeId` → `requireFeature: 'routes'`
- `/sensors`, `/sensors/new`, `/sensors/:sensorId`, `/sensors/automations/*` → `requireFeature: 'sensors'`
- `/upgrade` → remove `requireApproval` (upgrade page should be accessible to all authenticated users)

**Add guard step 6** in the `beforeEach` chain (after `requireDccEx`):

```typescript
// 6. Require feature flag
if (meta.requireFeature) {
  // Cache user role per-session to avoid Firestore fetch on every gated navigation.
  // Role changes are rare (admin set manually); a page refresh clears the cache.
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

Add module-level cache variables near the top of the file:

```typescript
let cachedUserRole: UserRole | null = null
let cachedUserId: string | null = null
```

### `apps/cloud/src/Core/Menu/useMenu.ts`

Filter menu items based on feature flags. Add a `feature` field to `MenuItem` and filter:

```typescript
import { useFeatureFlags } from '@repo/modules'
import type { FeatureName } from '@repo/modules'

// Add to menu items that need gating:
{ ..., label: 'Sounds', ..., feature: 'sounds' as FeatureName },
{ ..., label: 'Track Diagrams', ..., feature: 'trackDiagrams' as FeatureName },
{ ..., label: 'Routes', ..., feature: 'routes' as FeatureName },
{ ..., label: 'Sensors', ..., feature: 'sensors' as FeatureName },

// Filter the menu:
const { isEnabled } = useFeatureFlags()
const menu = computed(() =>
  menuConfig.filter(item => !item.feature || isEnabled(item.feature))
)
```

### `packages/ui/src/Menu/types.ts`

Add optional `feature` field to `MenuItem`:

```typescript
import type { FeatureName } from '@repo/modules'

export interface MenuItem {
  color: string
  icon: string
  label: string
  name: string
  section?: 'modules' | 'hardware' | 'system'
  isFavorite?: boolean
  feature?: FeatureName  // ← add
}
```

### `apps/tour/src/router/index.ts`

Add a `beforeEach` guard that checks the `tourApp` feature flag. Since the Tour app uses `beforeEnter` guards (not a centralized `beforeEach`), add a top-level `beforeEach`.

**New imports needed** (Tour app router currently has no Firestore imports):

```typescript
import { getCurrentUser } from 'vuefire'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { isFeatureAccessible } from '@repo/modules'
import type { UserRole } from '@repo/modules'
```

**Guard implementation:**

```typescript
const devFeaturesEnv = import.meta.env.VITE_DEV_FEATURES === 'true'

router.beforeEach(async (to) => {
  // Skip pages that don't need feature checks to avoid unnecessary Firestore calls
  if (to.name === 'not-available' || to.name === 'login') return

  // In demo mode, skip feature check
  if (isDemoMode) return

  // Resolve user role from Firestore
  const currentUser = await getCurrentUser()
  if (!currentUser) return // let per-route beforeEnter auth guards handle this

  const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
  const userRole: UserRole = (userDoc.data()?.role as UserRole) ?? 'user'

  if (!isFeatureAccessible('tourApp', userRole, devFeaturesEnv)) {
    return { name: 'not-available' }
  }
})
```

Note: Vue Router runs `beforeEach` hooks before `beforeEnter` hooks. The guard returns early for unauthenticated users (`!currentUser`), letting the existing per-route `requireGuestOrAuth` guards handle auth redirects.

**Add a "not-available" route + view:**

```typescript
{
  path: '/not-available',
  name: 'not-available',
  component: () => import('../views/NotAvailable.vue'),
}
```

Create `apps/tour/src/views/NotAvailable.vue` — a simple page saying "Tour App is coming soon."

### `.env.example`

Document the new env var:

```bash
# Feature flags — set to 'true' to unlock all dev features locally
VITE_DEV_FEATURES=
```

---

## Known Trade-offs

1. **Duplicate Firestore listener:** Both `useSubscription()` and `useFeatureFlags()` open a `useDocument` listener on `users/{uid}`. VueFire does not deduplicate across composable invocations. This is acceptable for MVP — the user doc is tiny and listeners are lightweight. A shared `useUserDoc()` composable can deduplicate later if needed.

2. **`isEnabled()` requires reactive context:** The function reads `userRole.value` internally. It works correctly in templates, `computed`, and `watch` (Vue tracks the `.value` access). If called in a non-reactive context (e.g., plain function at setup time), it returns a snapshot that won't update. This is fine since `role` rarely changes.

3. **`FeatureGate` creates a listener per instance:** Each `<FeatureGate>` component calls `useFeatureFlags()` internally. If a page uses many gates, consider calling `useFeatureFlags()` once in the parent and passing `isEnabled` down via provide/inject.

---

## What Stays Untouched

- 💳 `useSubscription()` / `PlanGate` / `UpgradeBanner` — plan gating is a separate concern
- 🔒 Firestore security rules — feature flags are UI-level visibility, not a security boundary
- 🖥️ Server app — no server-side feature gating needed
- 📱 Throttle and Monitor apps — no features to gate there currently

---

## Future Extensions

When alpha/beta tester programs are added:

1. Add `'alpha_tester' | 'beta_tester'` to `UserRole`
2. Update `STAGE_ACCESS` to grant appropriate stage visibility
3. Build an enrollment UI (Cloud settings → "Join Beta Program")
4. Store enrollment in `users/{uid}.role` or a separate `users/{uid}.programs` array

When Firestore-based overrides are needed:

1. Add a `config/featureFlags` Firestore document
2. `useFeatureFlags()` reads both hardcoded defaults and Firestore overrides
3. Firestore values take precedence over hardcoded values
