# 🚩 Feature Flags

Stage-based feature flagging system for DEJA.js. Controls which features are visible to users based on their role and the feature's release stage.

## 📐 Architecture

```
types.ts          ← FeatureName union, FeatureStage, UserRole
flags.ts          ← FEATURE_FLAGS registry, STAGE_ACCESS map, isFeatureAccessible()
useFeatureFlags.ts ← Vue composable (reads user role from Firestore)
index.ts          ← barrel exports
```

**UI component:** `<FeatureGate>` lives in `@repo/ui` — wraps content in a slot that only renders when the flag is enabled.

## 🔑 Core Concepts

### Stages

Every feature sits at one of four stages:

| Stage | Who can see it | Purpose |
|-------|---------------|---------|
| `dev` | admins only (or `VITE_DEV_FEATURES=true`) | Active development, not ready for users |
| `alpha` | admins only | Internal testing |
| `beta` | admins only | Pre-release testing |
| `ga` | everyone | Generally available |

### Roles

| Role | Access |
|------|--------|
| `admin` | All stages (`dev`, `alpha`, `beta`, `ga`) |
| `user` | Only `ga` features |

Roles are stored in Firestore at `users/{uid}.role`. Defaults to `user` if not set.

### Dev Override

Set `VITE_DEV_FEATURES=true` in `.env` to unlock **all** features regardless of role or stage. Only works in dev mode.

## 🧑‍💻 How to Use

### In a Vue component (composable)

```ts
import { useFeatureFlags } from '@repo/modules'

const { isEnabled, enabledFeatures, isAdmin } = useFeatureFlags()

if (isEnabled('sounds')) {
  // show sounds UI
}
```

### In a template (`<FeatureGate>`)

```vue
<script setup lang="ts">
import { FeatureGate } from '@repo/ui'
</script>

<template>
  <FeatureGate feature="sounds">
    <SoundsPanel />
    <template #fallback>
      <p>This feature is coming soon!</p>
    </template>
  </FeatureGate>
</template>
```

### In a route guard (cloud app)

Add `requireFeature` to the route meta — the router guard checks it automatically:

```ts
{
  path: '/sounds',
  name: 'Sounds',
  component: () => import('./Sounds/Sounds.vue'),
  meta: { requireAuth: true, requireLayout: true, requireFeature: 'sounds' },
}
```

If the feature isn't accessible, the guard redirects the user away.

### In a menu (cloud app)

Add `feature` to a `MenuItem` — the menu composable filters it out when disabled:

```ts
const menuConfig: MenuItem[] = [
  { name: 'Sounds', icon: 'mdi-music', feature: 'sounds' },
]

// In useMenu.ts:
const menu = computed(() =>
  menuConfig.filter(item => !item.feature || isEnabled(item.feature))
)
```

### In a route guard (non-Vue / standalone)

Use `isFeatureAccessible()` directly — it's a pure function with no Vue dependency:

```ts
import { isFeatureAccessible } from '@repo/modules'

if (!isFeatureAccessible('tourApp', userRole, devFeaturesEnv)) {
  return { name: 'not-available' }
}
```

## ➕ Adding a New Feature Flag

### 1. Add the name to the `FeatureName` union

📄 `packages/modules/features/types.ts`

```ts
export type FeatureName = 'sounds' | 'trackDiagrams' | 'routes' | 'sensors' | 'tourApp' | 'myNewFeature'
```

### 2. Register the flag with its initial stage

📄 `packages/modules/features/flags.ts`

```ts
export const FEATURE_FLAGS: Record<FeatureName, FeatureStage> = {
  sounds: 'dev',
  trackDiagrams: 'dev',
  routes: 'dev',
  sensors: 'dev',
  tourApp: 'dev',
  myNewFeature: 'dev',  // ← start at 'dev'
}
```

TypeScript enforces that every `FeatureName` has an entry — you'll get a compile error if you forget.

### 3. Gate your feature

Pick any combination:
- **Route guard:** add `requireFeature: 'myNewFeature'` to route meta
- **Menu filtering:** add `feature: 'myNewFeature'` to the menu item
- **Component-level:** use `<FeatureGate feature="myNewFeature">` or `isEnabled('myNewFeature')`

### 4. Promote when ready

Move through stages as the feature matures:

```ts
myNewFeature: 'dev',    // 🔧 development
myNewFeature: 'alpha',  // 🧪 internal testing
myNewFeature: 'beta',   // 🚀 pre-release
myNewFeature: 'ga',     // ✅ available to all users
```

When a feature reaches `ga` and has been stable, you can optionally remove the flag and all its gates to reduce complexity.

## 📁 Files

| File | Purpose |
|------|---------|
| `types.ts` | `FeatureName`, `FeatureStage`, `UserRole` type definitions |
| `flags.ts` | `FEATURE_FLAGS` registry, `STAGE_ACCESS` map, `isFeatureAccessible()` |
| `useFeatureFlags.ts` | Vue composable — reads role from Firestore, exposes `isEnabled()` |
| `index.ts` | Barrel exports |
| `@repo/ui` → `FeatureGate.vue` | Template-level gate component with `#fallback` slot |
