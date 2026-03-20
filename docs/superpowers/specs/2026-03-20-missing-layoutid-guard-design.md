# Missing layoutId Guard System — Design Spec

**Date:** 2026-03-20
**Branch:** `fix/missing-layoutid`
**Apps in scope:** Cloud, Throttle

---

## Problem

When `layoutId` is not set in localStorage, pages that depend on it can render with broken Firebase queries, empty states, or errors. The existing `requireLayout` guard redirects to `/select-layout`, but:

1. Single-layout users are forced to manually select their only layout every time they clear storage or use a new browser.
2. The select-layout page is functional but not polished — it doesn't match the app's gate-page aesthetic (login, onboarding).
3. Navigation chrome (header, sidebar, footer) still renders on the select-layout page, creating a confusing partial-state UI.
4. The guard implementations differ between cloud (unified `beforeEach`) and throttle (per-route `beforeEnter`), making behavior inconsistent.

## Goals

- **Prevent errors:** No page that requires `layoutId` should ever render without one.
- **Auto-select for single-layout users:** Users with exactly one layout should never see the select-layout page. Their layout is auto-selected silently.
- **Polished gate page:** Users with 2+ layouts see a fullscreen select-layout page that matches the app's design language (dark theme, glass cards, animated background).
- **No nav on gate pages:** The select-layout page hides all module navigation — it's a gate like login.
- **Consistent guard behavior:** Both apps use the same guard from `@repo/auth` with identical call signatures.

## Non-Goals

- Modal-based layout selection mid-session (already handled by `LayoutChip`).
- Disabling individual nav items (guard prevents reaching nav-visible pages without layoutId).
- Creating new layouts from the select-layout page (handled by onboarding flow).

---

## Design

### 1. Smart `requireLayout` Guard (`@repo/auth`)

**File:** `packages/auth/src/guards/requireLayout.ts`

The guard is upgraded from a simple localStorage check to a full layout resolution flow.

**Breaking change:** This changes the `requireLayout` export from a zero-argument function to one requiring `userEmail` and `to`. The only callers are the cloud and throttle routers, both of which are updated in this spec. The throttle's `beforeEnter` arrays that referenced the old signature are removed entirely (replaced by `beforeEach`).

**New signature:**

```typescript
export async function requireLayout(
  userEmail: string,
  to: RouteLocationNormalized
): Promise<RouteLocationRaw | undefined>
```

**Flow:**

```
requireLayout(userEmail, to)
  │
  ├─ await nextTick() (allow useStorage to hydrate from localStorage)
  │
  ├─ layoutId in localStorage and non-empty?
  │   └─ ✅ return undefined (pass)
  │
  └─ No layoutId → query Firestore layouts where owner == userEmail
      │
      ├─ Error fetching → return { path: '/select-layout', query: { redirect: to.fullPath } }
      │                    (fail-safe: let the select-layout page handle it)
      │
      ├─ 0 layouts → return { path: '/onboarding', query: { redirect: to.fullPath } }
      │
      ├─ 1 layout → localStorage.setItem('@DEJA/layoutId', JSON.stringify(layout.id))
      │              (direct write — more reliable than useStorage in guard context)
      │              also update the useStorage ref so reactive reads pick it up
      │              return undefined (pass — auto-selected, navigation continues)
      │
      └─ 2+ layouts → return { path: '/select-layout', query: { redirect: to.fullPath } }
```

**Key details:**

- The guard always fetches layouts itself when `layoutId` is missing. Both apps call it identically — no optional snapshot parameter. This means the cloud app's `requireOnboarding` step may have already fetched layouts, and the guard will fetch again. This duplicate query only fires when `layoutId` is missing (not on every navigation), so the overhead is acceptable in exchange for keeping both apps' call sites identical.
- The existing `await nextTick()` pattern is preserved before the localStorage check, ensuring `useStorage` has hydrated.
- Auto-select writes via `localStorage.setItem()` directly (more reliable than `useStorage` in a navigation guard context), then updates the `useStorage` ref so reactive reads pick it up immediately.
- The `VITE_LAYOUT_ID` env var fallback is preserved — if set, it seeds the default and the guard passes immediately.
- The guard imports `db` from `@repo/firebase-config` and queries Firestore directly (same pattern as cloud's `getUserLayouts`).
- **New dependency:** `@repo/firebase-config` must be listed in `packages/auth/package.json` dependencies (verify and add if missing).
- **Error handling:** If the Firestore `getDocs` call fails (network error, permissions), the guard falls through to the `/select-layout` redirect as a fail-safe. The select-layout page can display its own error/retry UI.

### 2. Router Changes

#### Cloud App (`apps/cloud/src/router.ts`)

- **Remove** the local `checkRequireLayout` function.
- **Update** the `beforeEach` guard chain step 4 to call `requireLayout(user.email, to)` from `@repo/auth`.
- **Add** `fullscreen: true` to the `/select-layout` route meta.
- No other route changes needed — all routes already have correct `requireLayout` meta flags.

**Updated guard chain:**

```typescript
// 4. Require a selected layout
if (meta.requireLayout) {
  const redirect = await requireLayout(user.email, to)
  if (redirect) {
    log.debug('requireLayout → redirecting')
    return redirect
  }
}
```

#### Throttle App (`apps/throttle/src/router.ts`)

- **Replace** per-route `beforeEnter` arrays with a unified `beforeEach` guard chain that mirrors cloud's pattern.
- **Add** route meta flags (`requireAuth`, `requireLayout`, `requireDccEx`) to each route definition instead of `beforeEnter`.
- **Add** `fullscreen: true` to `/select-layout` and `/login` route meta.
- **Import** `getCurrentUser` from `vuefire` and `requireLayout` from `@repo/auth`.

**New guard chain (mirrors cloud):**

```typescript
router.beforeEach(async (to) => {
  const { meta } = to

  // 1. Redirect-if-authenticated
  if (meta.redirectIfAuthenticated) { ... }

  // 2. Require authentication
  if (meta.requireAuth) { ... }

  // 3. Require a selected layout (auto-selects single layout)
  if (meta.requireLayout) {
    const redirect = await requireLayout(user.email, to)
    if (redirect) return redirect
  }

  // 4. Require DCC-EX (placeholder)
  if (meta.requireDccEx) { ... }
})
```

**Route meta mapping** (replaces `beforeEnter` arrays):

| Route | Meta |
|-------|------|
| `/login` | `redirectIfAuthenticated: true, fullscreen: true` |
| `/select-layout` | `requireAuth: true, fullscreen: true` |
| `/settings` | `requireAuth: true` |
| `/connect` | `requireAuth: true` |
| `/locos`, `/effects`, `/signals`, `/routes`, `/turnouts` | `requireAuth: true, requireLayout: true` |
| `/throttle/:address`, `/throttles`, `/conductor`, `/programming` | `requireAuth: true, requireLayout: true, requireDccEx: true` |

**Differences from cloud:** The throttle router does not have `requireOnboarding` — throttle users are expected to create their first layout via the cloud app's onboarding wizard. If a throttle user somehow has 0 layouts, the guard redirects to `/onboarding`, which will hit the throttle's 404 catch-all. This is acceptable since the zero-layout case is not reachable from throttle in normal usage. A future enhancement could redirect to the cloud app's onboarding URL instead.

### 3. Select Layout Page (Shared Fullscreen Gate)

**File:** `packages/ui/src/SelectLayout.vue` (replace existing)

A polished fullscreen gate page used by both apps.

**Structure:**

```
┌──────────────────────────────────────────┐
│  [dejajs.com ←]              [User] [⎋]  │  ← minimal fullscreen header
├──────────────────────────────────────────┤
│                                          │
│            ★ animated background ★       │
│                                          │
│           🏠  DEJA logo/icon             │
│         Choose Your Layout               │
│     Select a layout to get started       │
│                                          │
│    ┌─────────────┐  ┌─────────────┐      │
│    │ Layout Name │  │ Layout Name │      │
│    │ [layout-id] │  │ [layout-id] │      │
│    │ description │  │ description │      │
│    │  ✓ active   │  │             │      │
│    └─────────────┘  └─────────────┘      │
│                                          │
└──────────────────────────────────────────┘
```

**Component API:**

```typescript
// Props — names match existing LayoutChip usage for backward compatibility
defineProps<{
  /** Currently selected layoutId (to show active indicator) */
  layoutId?: string | null
}>()

// Emits — "selected" matches existing LayoutChip event name
defineEmits<{
  selected: [layoutId: string]
}>()
```

**Data fetching:** The component fetches layouts internally using `useCurrentUser()` from VueFire to get the user's email, then calls `useLayout().getLayouts(email)`. This avoids requiring every consumer to pass layouts as a prop.

**Visual details:**

- **Background:** Uses `PageBackground` with `background-id="stars"` (same as login/onboarding).
- **Cards:** Vuetify `v-card` with existing glass styling classes (`glass-dark`, `hover:glass-cyan`).
- **Card content:** Layout name (prominent `text-h6`), layout ID (`v-chip` size small, `color="primary"`, variant outlined), description (if present, `text-body-2` muted).
- **Active indicator:** If `currentLayoutId` matches, show a cyan left border and a small checkmark icon.
- **Hover:** `hover:scale-[1.02]` + `transition-all duration-300` (matches existing cloud `SelectLayout` pattern).
- **Grid:** `v-row` + `v-col` — single column on mobile, 2 columns on md+.
- **Loading:** Vuetify `v-skeleton-loader` type="card" while layouts are fetched.
- **Empty state:** Should not be reachable (guard redirects 0-layout users to onboarding), but defensive message included.
- **No "Create New Layout" button** — removed from the shared component. The 0-layout case is handled by the guard redirecting to onboarding. The existing throttle `SelectLayoutView` had a non-functional "Create New Layout" button that is intentionally dropped.

**Behavior on select:**

1. Emit `selected` event with `layoutId`.
2. Parent route component (or inline handler) writes to `useStorage('@DEJA/layoutId')` and navigates to the `redirect` query param or `/`.

#### App-Specific Wrappers

**Cloud** (`apps/cloud/src/Layout/SelectLayout.vue`):
- Replace current content with a thin wrapper importing `SelectLayout` from `@repo/ui`.
- Handles the `@selected` event: write `layoutId`, `router.push(route.query.redirect || '/')`.

**Throttle** (`apps/throttle/src/views/SelectLayoutView.vue`):
- Replace current content with same thin wrapper pattern.
- Handles the `@selected` event identically.

### 4. Fullscreen Mode in Throttle App

**File:** `apps/throttle/src/App.vue`

The throttle app currently always renders `AppHeader`, `Menu`, `Footer`, and `ConnectionStatusBanner`. Add the `isFullscreen` pattern from cloud:

```typescript
const route = useRoute()

// Prevent flash of nav chrome before initial route resolves (mirrors cloud pattern)
const routeReady = ref(false)
watch(() => route.fullPath, () => { if (!routeReady.value) routeReady.value = true })

const isFullscreen = computed(() => {
  if (!routeReady.value) return true  // hide chrome until route resolves
  return route.meta.fullscreen === true
})
```

**Template changes:**
- `AppHeader` — wrap with `v-if="!isFullscreen"`
- `Menu` — wrap with `v-if="!isFullscreen"`
- `Footer` — wrap with `v-if="!isFullscreen"`
- `ConnectionStatusBanner` — wrap with `v-if="!isFullscreen"`
- Add the minimal fullscreen header (same as cloud's) for branding + user profile + signout.

**Throttle RouteMeta augmentation:**
Add `fullscreen?: boolean` to the throttle's route meta type (cloud already has this).

### 5. LayoutChip Update

**File:** `packages/ui/src/LayoutChip.vue`

The `LayoutChip` dialog already uses the `SelectLayout` component with `:layoutId` prop and `@selected` event — these names are preserved in the new component API for backward compatibility. No code change needed in `LayoutChip.vue` itself.

- The chip's `handleSelect` already writes to `useStorage` and reloads — no behavior change needed.
- The visual update comes for free from the shared component update.
- The chip dialog renders the component in a `v-sheet` — the fullscreen gate styling (background, hero header) is only applied when the component is used as a route page, not inside the chip dialog. The component should detect this via a `variant` prop or by checking if it's rendered inside a dialog.

---

## Files Changed

| File | Change |
|------|--------|
| `packages/auth/src/guards/requireLayout.ts` | Upgrade to smart guard with layout fetching, auto-select, onboarding redirect |
| `apps/cloud/src/router.ts` | Remove local `checkRequireLayout`, call shared guard, add `fullscreen` meta to select-layout |
| `apps/throttle/src/router.ts` | Replace `beforeEnter` with unified `beforeEach`, add route meta flags, add `fullscreen` meta |
| `apps/throttle/src/App.vue` | Add `isFullscreen` computed, conditionally hide nav/header/footer, add fullscreen header |
| `packages/ui/src/SelectLayout.vue` | Replace with polished fullscreen gate page component |
| `apps/cloud/src/Layout/SelectLayout.vue` | Thin wrapper around shared component |
| `apps/throttle/src/views/SelectLayoutView.vue` | Thin wrapper around shared component |
| `packages/ui/src/LayoutChip.vue` | No code change — prop/event names preserved for backward compatibility |
| `packages/auth/package.json` | Verify `@repo/firebase-config` is listed as a dependency (add if missing) |

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User has 0 layouts | Guard redirects to `/onboarding` (existing behavior preserved) |
| User has 1 layout | Guard auto-selects, user never sees select-layout page |
| User has 2+ layouts | Guard redirects to `/select-layout` fullscreen gate |
| User clears localStorage | Next navigation triggers guard → auto-select or select-layout |
| `VITE_LAYOUT_ID` env var set | Guard passes immediately (existing behavior preserved) |
| layoutId set to deleted/invalid layout | Not addressed in this spec — Firebase queries will return empty data. Future enhancement could validate layoutId against Firestore. |
| LayoutChip mid-session switch | Existing behavior preserved — chip opens dialog, user selects, page reloads |
| Redirect query param | Uses `to.fullPath` (preserves query params and hash) — behavior change from old guard which used `window.location.pathname` |
| Firestore query failure in guard | Fail-safe redirect to `/select-layout` — page handles its own error/retry |

## Testing

### Unit Tests (Vitest — `packages/auth`)

- **Guard with layoutId set:** Returns `undefined` (pass).
- **Guard with empty layoutId, 1 layout:** Writes to localStorage, returns `undefined`.
- **Guard with empty layoutId, 2+ layouts:** Returns redirect to `/select-layout`.
- **Guard with empty layoutId, 0 layouts:** Returns redirect to `/onboarding`.
- **Guard with Firestore error:** Returns redirect to `/select-layout` (fail-safe).
- **Guard with `VITE_LAYOUT_ID` set:** Returns `undefined` immediately.

### Manual Testing (both apps)

- **Single-layout user:** Clear localStorage, navigate — should auto-select and land on home without ever seeing select-layout.
- **Multi-layout user:** Clear localStorage, navigate — should land on fullscreen select-layout page with polished UI.
- **Zero-layout user (cloud only):** Redirect to onboarding still works.
- **Fullscreen isolation:** No AppHeader, Menu, Footer, or ConnectionStatusBanner visible on select-layout in both apps.
- **Redirect query param:** Navigate to `/effects` without layoutId → guard redirects to `/select-layout?redirect=/effects` → select layout → lands on `/effects`.
- **LayoutChip:** Chip dialog still works for mid-session layout switching (no fullscreen styling inside dialog).
