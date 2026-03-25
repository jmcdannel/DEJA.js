# User Preferences System & Configurable Page Backgrounds

**Date:** 2026-03-10
**Status:** Draft

---

## Context

The throttle app has 5 hardcoded page backgrounds (CSS classes in `base.css` mapping to image files, plus a `sky-background` alias for `northernlights-background`), plus decorative blur effects (`BackgroundDecor`, `BackgroundFallingStars` in `@repo/ui`). These backgrounds are locked to the throttle app and cannot be changed by users. The other apps (cloud, monitor, tour) have their own ad-hoc background approaches with no configurability.

**Goal:** Create a shared, user-configurable background system available to all apps, backed by a general-purpose Firebase user preferences system that can be extended for future settings.

---

## Data Model

### Firestore: `users/{uid}`

A single document per authenticated user storing all preferences:

```typescript
interface UserPreferences {
  backgrounds: {
    [appName: string]: AppBackgroundPrefs
  }
  // Future preference categories added as top-level keys:
  // theme?: ThemeMode
  // notifications?: NotificationPrefs
  // accessibility?: AccessibilityPrefs
}

interface AppBackgroundPrefs {
  default: string                    // Background ID for app-wide default
  pages: Record<string, string>      // Route path → background ID overrides
}
```

**Resolution order:** `pages[route.path]` → `default` → `'none'`

**Route path format:** Keys in `pages` use `route.path` — the static path pattern (e.g., `/turnouts`, `/throttle`), not `route.name` or `route.fullPath`. Dynamic segments are not used as keys.

**Write pattern:** `setDoc(doc(db, 'users', uid), { ... }, { merge: true })` — matches all existing Firestore writes in the codebase. Timestamp is added at the call site via `serverTimestamp()`, not typed in the interface (consistent with existing composables like `useLocos`, `useTurnouts`).

### Firestore Security Rules

The new `users/{uid}` collection requires a security rule:

```
match /users/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

This must be deployed to Firestore before the feature goes live.

### localStorage cache: `@DEJA/userPreferences`

JSON-serialized copy of the Firestore document. Updated on every write and used for instant hydration before Firebase responds. Firebase is authoritative — when the reactive `useDocument()` binding resolves, it overwrites the local cache.

---

## Background Registry

### `packages/ui/src/backgrounds/registry.ts`

A typed catalog of all available backgrounds:

```typescript
import type { CSSProperties, Component } from 'vue'

interface BackgroundDefinition {
  id: string
  name: string
  type: 'image' | 'effect' | 'gradient'
  category: 'photo' | 'animated' | 'abstract'
  // For 'image': imported asset URL
  asset?: string
  // For 'effect': Vue component
  component?: Component
  // For 'gradient': CSS gradient value
  gradient?: string
  // CSS properties applied to the container
  css?: CSSProperties
  // Static preview image for thumbnails (required for 'effect' type)
  thumbnail?: string
}
```

**`'none'` handling:** `'none'` is not a registry entry. It's a sentinel value handled by `PageBackground` — when the resolved background ID is `'none'` or not found in the registry, no background is rendered and the app's default theme background shows through.

**Thumbnail strategy:**
- `type: 'image'` — the image itself, rendered small via CSS
- `type: 'effect'` — a static preview screenshot stored as a small `.jpg` in the assets
- `type: 'gradient'` — a small `div` rendered with the gradient CSS

### Initial backgrounds

| ID | Name | Type | Source |
|---|---|---|---|
| `northernlights` | Northern Lights | image | `northernlights.jpg` (from throttle) |
| `tracks` | Railroad Tracks | image | `tracks1.jpg` (from throttle) |
| `forest` | Forest Tracks | image | `foresttracks.jpg` (from throttle) |
| `waves` | Vertical Waves | image | `vertwaves.jpg` (from throttle) |
| `viaduct` | Viaduct Bridge | image | `viaduct.jpg` (from throttle) |
| `decor` | Ambient Glow | effect | `BackgroundDecor.vue` (already in `@repo/ui`) |
| `stars` | Falling Stars | effect | `BackgroundFallingStars.vue` (already in `@repo/ui`) |

### Image loading strategy

Images are loaded via dynamic `import()` or Vite's `new URL(..., import.meta.url)` pattern so they are only fetched when actually needed — not bundled upfront into every app. The registry stores the import path, not the resolved URL.

---

## Components

### 1. `useUserPreferences()` composable — `packages/modules/preferences/`

**Responsibilities:**
- Reactive binding to `users/{uid}` via VueFire `useDocument()`
- Dual-write to Firebase + localStorage
- Generic getters/setters for any preference category
- Background-specific convenience methods

**API:**

```typescript
function useUserPreferences() {
  // Core
  const preferences: Ref<UserPreferences | null>
  const isLoaded: Ref<boolean>

  // Generic preference access
  function getPreference<T>(key: string, defaultValue: T): ComputedRef<T>
  async function setPreference(key: string, value: unknown): Promise<void>

  // Background-specific
  function getBackground(appName: string, routePath: string): ComputedRef<string>
  async function setAppBackground(appName: string, backgroundId: string): Promise<void>
  async function setPageBackground(appName: string, routePath: string, backgroundId: string): Promise<void>
  async function clearPageBackground(appName: string, routePath: string): Promise<void>
}
```

**Dependencies:** `@repo/firebase-config` (db), `vuefire` (useDocument, useCurrentUser), `@vueuse/core` (useStorage)

### 2. `PageBackground` component — `packages/ui/src/backgrounds/`

**Responsibilities:**
- Reads current route + user preferences to resolve the active background
- Renders the appropriate background (image CSS, effect component, or gradient)
- Applies consistent overlay opacity (matching current `bg-opacity-50` pattern)

**Usage in App.vue:**

```vue
<v-app :theme="isDark ? 'dark' : 'light'">
  <PageBackground app-name="throttle">
    <AppBar />
    <v-main>
      <router-view />
    </v-main>
  </PageBackground>
</v-app>
```

**Props:**
- `appName: string` — which app (for preference lookup)
- `backgroundId?: string` — optional override (bypasses preferences)
- `opacity?: number` — overlay opacity (default: 0.5)

**Rendering logic:**
- `type: 'image'` → `position: fixed` full-viewport `div` with `background-image`, `background-size: cover` (uses `position: fixed` container instead of `background-attachment: fixed` to avoid iOS Safari issues)
- `type: 'effect'` → renders the effect component (e.g., `<BackgroundDecor />`) in a fixed-position container
- `type: 'gradient'` → fixed-position `div` with CSS gradient
- Unresolved/missing ID → renders nothing, app's default theme background shows through
- Dark overlay `div` at specified opacity on top of the background layer
- Content rendered via `<slot>` on top with `position: relative; z-index: 1`

### 3. `BackgroundSettings` component — `packages/ui/src/backgrounds/`

**Responsibilities:**
- Thumbnail grid for selecting backgrounds
- App-wide default selector
- Per-page override selectors (expandable sections)

**Props:**
- `appName: string` — which app
- `pages: Array<{ path: string, label: string, icon?: string }>` — available pages for per-page overrides

**UI Structure:**

```
┌─────────────────────────────────────────┐
│ Page Backgrounds                        │
│                                         │
│ App Default                             │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│ │ None │ │ N.L. │ │Tracks│ │Forest│   │
│ │  ✓   │ │      │ │      │ │      │   │
│ └──────┘ └──────┘ └──────┘ └──────┘   │
│ ┌──────┐ ┌──────┐ ┌──────┐            │
│ │Waves │ │Viaduc│ │ Glow │            │
│ │      │ │      │ │      │            │
│ └──────┘ └──────┘ └──────┘            │
│                                         │
│ ▸ Page-Specific Overrides               │
│   ┌─ Home ──────────────────────────┐   │
│   │ ○ Use App Default  ● Viaduct    │   │
│   └─────────────────────────────────┘   │
│   ┌─ Turnouts ──────────────────────┐   │
│   │ ● Use App Default  ○ Forest     │   │
│   └─────────────────────────────────┘   │
│   ...                                   │
└─────────────────────────────────────────┘
```

- Selected background has a highlight ring (Vuetify `v-item-group` or similar)
- Changes save immediately (no "Save" button — writes on selection)
- Uses Vuetify components: `v-card`, `v-item-group`, `v-expansion-panels`

---

## Migration Defaults

When no user preferences exist (first load), the throttle app should match its current hardcoded behavior. `PageBackground` accepts a `defaults` prop for this:

```typescript
// Throttle App.vue
const throttleDefaults: AppBackgroundPrefs = {
  default: 'none',
  pages: {
    '/': 'viaduct',
    '/turnouts': 'forest',
    '/roster': 'forest',
    '/routes': 'forest',
    '/signals': 'forest',
    '/effects': 'viaduct',
    '/conductor': 'viaduct',
    '/connect': 'viaduct',
  }
}
```

These defaults apply only when the user has no saved preferences. Once they save any background preference for the app, the defaults are no longer used.

---

## File Changes

### New Files

| File | Purpose |
|---|---|
| `packages/modules/preferences/useUserPreferences.ts` | Core preferences composable |
| `packages/modules/preferences/types.ts` | TypeScript interfaces |
| `packages/modules/preferences/index.ts` | Barrel export |
| `packages/ui/src/backgrounds/registry.ts` | Background definitions catalog |
| `packages/ui/src/backgrounds/PageBackground.vue` | Background renderer component |
| `packages/ui/src/backgrounds/BackgroundSettings.vue` | Settings UI component |
| `packages/ui/src/backgrounds/BackgroundThumbnail.vue` | Thumbnail preview component |
| `packages/ui/src/backgrounds/index.ts` | Barrel export |
| `packages/ui/src/assets/backgrounds/*.jpg` | Moved from throttle app |
| `packages/ui/src/assets/backgrounds/thumbnails/*.jpg` | Preview thumbnails for effect-type backgrounds |

### Modified Files

| File | Change |
|---|---|
| `packages/modules/index.ts` | Export `preferences` module |
| `packages/modules/package.json` | Move `@vueuse/core` from `devDependencies` to `dependencies` (needed for `useStorage` at runtime) |
| `packages/modules/package.json` | Add `./preferences` to `exports` map |
| `packages/ui/src/index.ts` | Export background components |
| `apps/throttle/src/App.vue` | Wrap with `<PageBackground>` with migration defaults |
| `apps/throttle/src/views/*.vue` | Remove hardcoded background classes (6 views + Connect.vue) |
| `apps/throttle/src/views/SettingsView.vue` | Add `<BackgroundSettings>` |
| `apps/throttle/src/assets/base.css` | Remove `sky-background`, `northernlights-background`, `tracks1-background`, `forest-background`, `vertwaves-background`, `viaduct-background` CSS classes |
| `apps/cloud/src/App.vue` | Wrap with `<PageBackground>` |
| `apps/cloud/src/Settings/Settings.vue` | Add `<BackgroundSettings>` |
| `apps/monitor/src/App.vue` | Wrap with `<PageBackground>` |
| `apps/monitor/src/Settings/Settings.vue` | Add `<BackgroundSettings>` |
| `apps/tour/src/App.vue` | Wrap with `<PageBackground>`, replace existing `<BackgroundDecor />` usage |

### Deleted Files

| File | Reason |
|---|---|
| `apps/throttle/src/assets/northernlights.jpg` | Moved to `@repo/ui` |
| `apps/throttle/src/assets/tracks1.jpg` | Moved to `@repo/ui` |
| `apps/throttle/src/assets/foresttracks.jpg` | Moved to `@repo/ui` |
| `apps/throttle/src/assets/vertwaves.jpg` | Moved to `@repo/ui` |
| `apps/throttle/src/assets/viaduct.jpg` | Moved to `@repo/ui` |
| `apps/throttle/src/assets/background.jpg` | Unused |

### Tour App Note

The tour app does not currently have a settings page. Background settings for tour can be accessed through the cloud app's settings (which manages layout-level configuration). A tour-specific settings view is out of scope for this spec.

---

## Integration Points

### Existing code to reuse

- `useCurrentUser()` from `vuefire` — auth user with UID (`packages/ui/src/UserProfile.vue:2`, `packages/modules/layouts/useLayout.ts:15`)
- `useDocument()` from `vuefire` — reactive Firestore binding (`packages/modules/locos/useLocos.ts:43`)
- `useStorage()` from `@vueuse/core` — localStorage persistence (`packages/ui/src/composables/useThemeSwitcher.ts:12`)
- `db` from `@repo/firebase-config` — Firestore instance (`packages/firebase-config/src/firebase.ts`)
- `setDoc` with `{ merge: true }` — existing write pattern (`packages/modules/layouts/useLayout.ts`)
- `serverTimestamp()` — existing timestamp pattern
- `BackgroundDecor` component — already in `@repo/ui` (`packages/ui/src/BackgroundDecor.vue`)
- `BackgroundFallingStars` component — already in `@repo/ui` (`packages/ui/src/BackgroundFallingStars.vue`)
- `useThemeSwitcher()` — existing theme composable (future: migrate to use `useUserPreferences`)

### Pattern consistency

- Composable naming: `useUserPreferences()` follows `useLocos()`, `useTurnouts()`, etc.
- Export pattern: barrel exports from `packages/modules/preferences/index.ts`
- Write pattern: `setDoc(doc(db, path, id), data, { merge: true })` with `serverTimestamp()`
- Storage key: `@DEJA/userPreferences` follows `@DEJA/*` convention

---

## Error Handling

- **Unauthenticated users:** `useUserPreferences()` returns defaults (no Firebase read/write). Background falls back to migration defaults or `'none'`. Settings component shows "Sign in to save preferences" message.
- **Firebase offline:** localStorage cache provides last-known preferences. Writes queue via Firestore's built-in offline persistence.
- **Invalid background ID:** `PageBackground` falls back to `'none'` (no background rendered).
- **Missing images:** CSS `background-image` gracefully degrades to background color.

---

## Verification

1. **Type check:** `pnpm check-types` passes
2. **Lint:** `pnpm lint` passes
3. **Build:** `pnpm build` succeeds for all apps
4. **Manual testing:**
   - Start throttle app, navigate to settings, verify background thumbnails render
   - Select a background, verify it applies immediately to the current page
   - Set per-page overrides, navigate between pages, verify correct backgrounds
   - Refresh the page — verify background persists (localStorage hydration)
   - Sign in on another device — verify background syncs via Firebase
   - Repeat for cloud and monitor apps
5. **Regression:** Throttle app pages that previously had hardcoded backgrounds should look the same on first load (migration defaults apply when no user preferences exist)
6. **Security rules:** Deploy Firestore rules for `users/{uid}` and verify unauthenticated access is denied
