# 🚩 Feature Flags

Stage-based feature flagging system for DEJA.js. Controls which features are visible to users based on their role and the feature's release stage.

## 📐 Architecture

```
types.ts          ← FeatureName union, FeatureStage, UserRole
flags.ts          ← FEATURE_FLAGS registry, STAGE_ACCESS map, isFeatureAccessible()
useFeatureFlags.ts ← Vue composable (reads user role from Firestore)
index.ts          ← barrel exports
```

**UI components** in `@repo/ui`:
- `<FeatureGate>` — wraps content in a slot that renders based on flag + mode
- `<ComingSoonBadge>` — reusable "Coming Soon" chip for labeling gated features

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
| `demo` | All stages (same as admin, for demo accounts) |

Roles are stored in Firestore at `users/{uid}.role`. Defaults to `user` if not set.

### Dev Override

Set `VITE_DEV_FEATURES=true` in `.env` to unlock **all** features regardless of role or stage. Only works in dev mode.

## 🏷️ Current Flag Registry

| Flag | Stage | Description |
|------|-------|-------------|
| `sounds` | `ga` | 🔊 Sound effects management |
| `sensors` | `ga` | 📡 Sensor hardware + automations |
| `trackDiagrams` | `dev` | 🗺️ Track diagram editor |
| `routes` | `dev` | 🛤️ Route management |
| `tourApp` | `dev` | 🎢 Interactive tour app |
| `quickMenuFavorites` | `dev` | ⭐ Quick menu favorites customization |
| `cvProgramming` | `dev` | 🔧 CV read/write programming |
| `throttleConnectionConfig` | `dev` | 🔌 WiThrottle + DEJA server connection settings |
| `powerDistricts` | `dev` | ⚡ Power district management |

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
  <!-- Hide (default) — content not rendered when gated -->
  <FeatureGate feature="sounds">
    <SoundsPanel />
  </FeatureGate>

  <!-- Disable — visible but greyed out with "Coming Soon" badge overlay -->
  <FeatureGate feature="routes" mode="disable">
    <RoutesPanel />
  </FeatureGate>

  <!-- Tease — same as disable but still clickable (for tooltips/dialogs) -->
  <FeatureGate feature="trackDiagrams" mode="tease">
    <DiagramPreview />
  </FeatureGate>

  <!-- Fallback slot (hide mode only) -->
  <FeatureGate feature="sounds">
    <SoundsPanel />
    <template #fallback>
      <p>This feature is coming soon!</p>
    </template>
  </FeatureGate>
</template>
```

#### `<FeatureGate>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `feature` | `FeatureName` | required | Which flag to check |
| `mode` | `'hide' \| 'disable' \| 'tease'` | `'hide'` | How to render when gated |
| `badgeLabel` | `string` | `'Coming Soon'` | Override the badge text |

- **`hide`** — default slot hidden, `#fallback` slot rendered (current v1 behavior)
- **`disable`** — content visible but dimmed (`opacity: 0.55`, grayscale), `pointer-events: none`, `<ComingSoonBadge>` overlay in top-right
- **`tease`** — same visual as disable but remains clickable

### `<ComingSoonBadge>` standalone

```vue
<script setup lang="ts">
import { ComingSoonBadge } from '@repo/ui'
</script>

<template>
  <!-- Defaults -->
  <ComingSoonBadge />

  <!-- Customized -->
  <ComingSoonBadge label="Beta" icon="mdi-flask-outline" size="x-small" variant="outlined" />
</template>
```

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | `'Coming Soon'` |
| `icon` | `string` | `'mdi-rocket-launch-outline'` |
| `size` | `'x-small' \| 'small' \| 'default' \| 'large'` | `'small'` |
| `variant` | Vuetify chip variant | `'tonal'` |
| `color` | `string` | `'primary'` |

### In a route guard

Add `requireFeature` to the route meta — the router guard checks it automatically:

```ts
{
  path: '/sounds',
  name: 'Sounds',
  component: () => import('./Sounds/Sounds.vue'),
  meta: { requireAuth: true, requireLayout: true, requireFeature: 'sounds' },
}
```

If the feature isn't accessible, the guard redirects to `/`. Both the **cloud** and **throttle** routers support `requireFeature`.

### In a menu

Add `feature` to a `MenuItem` — the menu composable marks it as `gated` at runtime:

```ts
const menuConfig: MenuItem[] = [
  { name: 'Sounds', icon: 'mdi-music', feature: 'sounds' },
]
```

- **Nav drawer** (Menu.vue): gated items render dimmed with `<ComingSoonBadge size="x-small">` next to the label
- **Footer menu** (icon-only): gated items excluded entirely (no room for badges)
- **Select Favorites**: gated items shown disabled, can't be starred

### In a standalone context (non-Vue / server-side)

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
export type FeatureName = 'sounds' | 'trackDiagrams' | ... | 'myNewFeature'
```

### 2. Register the flag with its initial stage

📄 `packages/modules/features/flags.ts`

```ts
export const FEATURE_FLAGS: Record<FeatureName, FeatureStage> = {
  ...
  myNewFeature: 'dev',  // ← start at 'dev'
}
```

TypeScript enforces that every `FeatureName` has an entry — you'll get a compile error if you forget.

### 3. Gate your feature

Pick any combination:
- **Route guard:** add `requireFeature: 'myNewFeature'` to route meta (cloud + throttle routers)
- **Menu item:** add `feature: 'myNewFeature'` to the menu item config
- **Component-level:** use `<FeatureGate feature="myNewFeature">` or `<FeatureGate feature="myNewFeature" mode="disable">` or `isEnabled('myNewFeature')`
- **Settings section:** wrap with `<FeatureGate feature="myNewFeature" mode="disable">`

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
| `@repo/ui` → `FeatureGate.vue` | Template-level gate component with `mode` prop |
| `@repo/ui` → `ComingSoonBadge.vue` | Standalone "Coming Soon" badge chip |
| `@repo/ui` → `Menu/types.ts` | `MenuItem.feature` + `MenuItem.gated` fields |
| `@repo/ui` → `Menu/Menu.vue` | Nav drawer renders gated items with badge |
| `@repo/auth` → `guards/requireFeature.ts` | `checkRequireFeature()` route guard helper |

## 🔗 Where Gates Are Applied

### Throttle App
- **Router:** `/routes` → `routes`, `/programming` → `cvProgramming`
- **Menu:** Routes, Programming, Connections items tagged with feature flags
- **Settings:** Connection section wrapped in `<FeatureGate mode="disable">`

### Cloud App
- **Router:** `/sounds/*` → `sounds`, `/routes/*` → `routes`, `/sensors/*` → `sensors`, `/track-diagrams/*` → `trackDiagrams`, `/power-districts` → `powerDistricts`
- **Menu:** All flagged items shown with badge when gated
