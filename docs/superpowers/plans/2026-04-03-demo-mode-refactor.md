# Demo Mode Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor demo mode from env-var-toggled global behavior to runtime user-identity detection scoped to throttle, and add `dev:demo` auto-login for all apps.

**Architecture:** New `isDemoUser()` helper checks `getAuth().currentUser?.email` at call-time. Shared packages (`useDcc`, `useDejaJS`) use this runtime check instead of `VITE_DEMO_MODE`. New `ensureAutoLogin()` function handles dev convenience login via `VITE_AUTO_LOGIN` env var set by `dev:demo` script.

**Tech Stack:** Vue 3, Vue Router 4, Firebase Auth, Vuefire, TypeScript, Turborepo

**Spec:** `docs/superpowers/specs/2026-04-03-demo-mode-refactor-design.md`

---

### Task 1: Create `isDemoUser` helper

**Files:**
- Create: `packages/auth/src/isDemoUser.ts`
- Modify: `packages/auth/src/index.ts`

- [ ] **Step 1: Create `isDemoUser.ts`**

```ts
// packages/auth/src/isDemoUser.ts
import { getAuth } from 'firebase/auth'

const DEMO_EMAIL = 'demo@dejajs.com'

export function isDemoUser(): boolean {
  return getAuth().currentUser?.email === DEMO_EMAIL
}

export { DEMO_EMAIL }
```

- [ ] **Step 2: Export from `packages/auth/src/index.ts`**

Add this line after the existing exports:

```ts
export { isDemoUser, DEMO_EMAIL } from './isDemoUser'
```

- [ ] **Step 3: Commit**

```bash
git add packages/auth/src/isDemoUser.ts packages/auth/src/index.ts
git commit -m "feat(auth): add isDemoUser runtime helper"
```

---

### Task 2: Create `ensureAutoLogin` function

**Files:**
- Create: `packages/auth/src/ensureAutoLogin.ts`
- Modify: `packages/auth/src/index.ts`

- [ ] **Step 1: Create `ensureAutoLogin.ts`**

```ts
// packages/auth/src/ensureAutoLogin.ts
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getCurrentUser } from 'vuefire'
import { createLogger } from '@repo/utils'

const log = createLogger('AutoLogin')

export async function ensureAutoLogin(): Promise<void> {
  if (import.meta.env.VITE_AUTO_LOGIN !== 'true') return

  const currentUser = await getCurrentUser()
  if (currentUser) return

  const email = import.meta.env.VITE_DEMO_EMAIL
  const password = import.meta.env.VITE_DEMO_PASSWORD
  if (!email || !password) {
    log.warn('VITE_AUTO_LOGIN is set but VITE_DEMO_EMAIL/VITE_DEMO_PASSWORD are missing')
    return
  }

  try {
    await signInWithEmailAndPassword(getAuth(), email, password)
    log.info('Auto-login successful as', email)
  } catch (err) {
    log.error('Auto-login failed:', err)
  }
}
```

- [ ] **Step 2: Export from `packages/auth/src/index.ts`**

Add this line after the `isDemoUser` export:

```ts
export { ensureAutoLogin } from './ensureAutoLogin'
```

- [ ] **Step 3: Commit**

```bash
git add packages/auth/src/ensureAutoLogin.ts packages/auth/src/index.ts
git commit -m "feat(auth): add ensureAutoLogin for dev:demo auto-login"
```

---

### Task 3: Switch `useDcc` to runtime demo detection

**Files:**
- Modify: `packages/dccex/useDcc.ts:1-21, 78-93`

- [ ] **Step 1: Replace env var check with `isDemoUser()` import**

In `packages/dccex/useDcc.ts`, replace lines 5-6 (the `createMockResponder` import) and lines 19-20:

Remove:
```ts
import { createMockResponder } from './mockResponses'
```
```ts
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
const mockResponder = isDemoMode ? createMockResponder() : null
```

Replace with:
```ts
import { isDemoUser } from '@repo/auth'
import { createMockResponder } from './mockResponses'
```
```ts
let _mockResponder: ReturnType<typeof createMockResponder> | null = null
```

- [ ] **Step 2: Update `send()` to use runtime check**

Replace the `send()` function body (lines 78-93):

Old:
```ts
  async function send(action: string, payload?: object): Promise<void> {
    if (isDemoMode && mockResponder) {
      log.debug('[DEJA DEMO] send', action, payload)
      await mockResponder.handleCommand(action, payload)
      return
    } else if (isEmulated.value) {
```

New:
```ts
  async function send(action: string, payload?: object): Promise<void> {
    if (isDemoUser()) {
      if (!_mockResponder) _mockResponder = createMockResponder()
      log.debug('[DEJA DEMO] send', action, payload)
      await _mockResponder.handleCommand(action, payload)
      return
    } else if (isEmulated.value) {
```

- [ ] **Step 3: Commit**

```bash
git add packages/dccex/useDcc.ts
git commit -m "refactor(dccex): switch useDcc to runtime isDemoUser check"
```

---

### Task 4: Switch `useDejaJS` to runtime demo detection

**Files:**
- Modify: `packages/deja/useDejaJS.ts:5-6, 20, 24-28`

- [ ] **Step 1: Replace env var check with `isDemoUser()` import**

In `packages/deja/useDejaJS.ts`:

Add import at the top (after line 4):
```ts
import { isDemoUser } from '@repo/auth'
```

Remove line 20:
```ts
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
```

- [ ] **Step 2: Update `sendDejaCommand()` to use runtime check**

Replace line 25:

Old:
```ts
    if (isDemoMode) {
```

New:
```ts
    if (isDemoUser()) {
```

- [ ] **Step 3: Commit**

```bash
git add packages/deja/useDejaJS.ts
git commit -m "refactor(deja): switch useDejaJS to runtime isDemoUser check"
```

---

### Task 5: Clean up shared auth guards

**Files:**
- Modify: `packages/auth/src/guards/requireAuth.ts:1-16`
- Modify: `packages/auth/src/guards/requireDccEx.ts:1-20`

- [ ] **Step 1: Remove demo bypass from `requireAuth.ts`**

Replace the entire file content:

```ts
import { getCurrentUser } from 'vuefire'

export async function requireAuth() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return {
      path: '/login',
      query: { redirect: window.location.pathname },
    }
  }
}
```

- [ ] **Step 2: Remove demo bypass from `requireDccEx.ts`**

Replace the entire file content:

```ts
import { computed } from 'vue'
import { useLayout } from '@repo/modules'

export async function requireDccEx() {
  const { getDevices } = useLayout()
  const devices = getDevices()
  const dccExDevice = computed(() =>
    devices.value.find((device) => device.type === 'dcc-ex')
  )

  if (!dccExDevice.value) {
    return {
      path: '/',
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/auth/src/guards/requireAuth.ts packages/auth/src/guards/requireDccEx.ts
git commit -m "refactor(auth): remove VITE_DEMO_MODE bypass from shared guards"
```

---

### Task 6: Clean up `useDemoAuth`

**Files:**
- Modify: `packages/auth/src/useDemoAuth.ts:17, 47-53`

- [ ] **Step 1: Remove env var reference**

In `packages/auth/src/useDemoAuth.ts`:

Remove line 17:
```ts
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
```

Update the return object (lines 47-53) — remove `isDemoMode`:

Old:
```ts
  return {
    signInAsDemo,
    isDemoMode,
    isLoading,
    error,
    DEMO_LAYOUT_ID,
  }
```

New:
```ts
  return {
    signInAsDemo,
    isLoading,
    error,
    DEMO_LAYOUT_ID,
  }
```

- [ ] **Step 2: Commit**

```bash
git add packages/auth/src/useDemoAuth.ts
git commit -m "refactor(auth): remove VITE_DEMO_MODE from useDemoAuth"
```

---

### Task 7: Update `Login.vue` — prop-gated "Try Demo" button

**Files:**
- Modify: `packages/auth/src/Login.vue:54-56, 296-315`

- [ ] **Step 1: Add `showTryDemo` prop**

In `packages/auth/src/Login.vue`, after the `defineEmits` block (after line 29), add:

```ts
const props = defineProps<{
  showTryDemo?: boolean
}>()
```

- [ ] **Step 2: Remove env-var-based `showDemoButton`**

Remove lines 55-56:
```ts
const demoEmail = import.meta.env.VITE_DEMO_EMAIL
const showDemoButton = !!demoEmail
```

- [ ] **Step 3: Update template to use prop**

Replace `showDemoButton` references in template (lines 296-315):

Old:
```html
          <!-- Try Demo -->
          <v-divider v-if="showDemoButton" class="my-4" />
          <v-btn
            v-if="showDemoButton"
```

New:
```html
          <!-- Try Demo -->
          <v-divider v-if="props.showTryDemo" class="my-4" />
          <v-btn
            v-if="props.showTryDemo"
```

- [ ] **Step 4: Commit**

```bash
git add packages/auth/src/Login.vue
git commit -m "refactor(auth): gate Try Demo button behind showTryDemo prop"
```

---

### Task 8: Update throttle `LoginView.vue` — pass `showTryDemo` prop

**Files:**
- Modify: `apps/throttle/src/views/LoginView.vue:22-26`

- [ ] **Step 1: Add prop to Login component**

In `apps/throttle/src/views/LoginView.vue`, update the template:

Old:
```html
    <Login
      @auth="handleAuth"
      @navigate-signup="handleNavigateSignup"
      @navigate-forgot-password="handleNavigateForgotPassword"
    />
```

New:
```html
    <Login
      :show-try-demo="true"
      @auth="handleAuth"
      @navigate-signup="handleNavigateSignup"
      @navigate-forgot-password="handleNavigateForgotPassword"
    />
```

- [ ] **Step 2: Commit**

```bash
git add apps/throttle/src/views/LoginView.vue
git commit -m "feat(throttle): enable Try Demo button on throttle login"
```

---

### Task 9: Update throttle router — replace blanket bypass with targeted checks

**Files:**
- Modify: `apps/throttle/src/router.ts:1-6, 162-213`

- [ ] **Step 1: Update imports**

In `apps/throttle/src/router.ts`, replace the import block (lines 1-6):

Old:
```ts
import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import type { User } from 'firebase/auth'
import { requireLayout } from '@repo/auth'
import { createTryDemoRoute } from '@repo/auth'
import { createLogger } from '@repo/utils'
```

New:
```ts
import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import type { User } from 'firebase/auth'
import { requireLayout, createTryDemoRoute, isDemoUser, ensureAutoLogin } from '@repo/auth'
import { createLogger } from '@repo/utils'
```

- [ ] **Step 2: Replace the `beforeEach` guard**

Replace the entire `beforeEach` block (lines 162-213):

```ts
router.beforeEach(async (to) => {
  try {
    const { meta } = to

    // Dev auto-login (pnpm dev:demo)
    await ensureAutoLogin()

    // Resolve Firebase auth state once for the entire guard chain.
    const currentUser = await getCurrentUser()

    // 1. Redirect-if-authenticated (login page)
    if (meta.redirectIfAuthenticated) {
      if (currentUser) {
        log.debug('redirectIfAuthenticated → redirecting to home')
        return { path: '/' }
      }
    }

    // 2. Require authentication
    if (meta.requireAuth) {
      if (!currentUser) {
        log.debug('requireAuth → redirecting to login')
        return { path: '/login', query: { redirect: to.fullPath } }
      }
    }

    // From this point on, currentUser is guaranteed non-null when
    // requireAuth is set (the guard above would have returned).
    const user = currentUser as User

    // 3. Require a selected layout (auto-selects single layout)
    if (meta.requireLayout) {
      const redirect = await requireLayout(user.email!, to)
      if (redirect) {
        log.debug('requireLayout → redirecting')
        return redirect
      }
    }

    // 4. Require DCC-EX device — skip for demo user (no real hardware)
    if (meta.requireDccEx && !isDemoUser()) {
      // TODO: re-enable when DCC-EX device check is fully implemented
    }

    // All guards passed — allow navigation.
  } catch (error) {
    log.error('Navigation guard error:', error)
    return { path: '/login' }
  }
})
```

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/router.ts
git commit -m "refactor(throttle): replace demo bypass with runtime isDemoUser + ensureAutoLogin"
```

---

### Task 10: Remove demo mode from cloud router

**Files:**
- Modify: `apps/cloud/src/router.ts:1-11, 315, 389-398`

- [ ] **Step 1: Update imports**

Replace lines 8-9:

Old:
```ts
import { requireLayout } from '@repo/auth'
import { createTryDemoRoute } from '@repo/auth'
```

New:
```ts
import { requireLayout, ensureAutoLogin } from '@repo/auth'
```

- [ ] **Step 2: Remove `createTryDemoRoute()` from routes array**

Remove line 315:
```ts
    createTryDemoRoute(),
```

- [ ] **Step 3: Replace demo bypass in `beforeEach` with `ensureAutoLogin()`**

In the `beforeEach` block (starting at line 389), replace lines 395-398:

Old:
```ts
    // Demo mode auto-login bypass (local dev only)
    if (import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true') {
      return
    }
```

New:
```ts
    // Dev auto-login (pnpm dev:demo)
    await ensureAutoLogin()
```

- [ ] **Step 4: Commit**

```bash
git add apps/cloud/src/router.ts
git commit -m "refactor(cloud): remove demo mode, add ensureAutoLogin"
```

---

### Task 11: Remove demo mode from monitor

**Files:**
- Modify: `apps/monitor/src/router.ts:1-3, 77-96`
- Modify: `apps/monitor/src/App.vue:1-47`

- [ ] **Step 1: Update monitor router imports**

In `apps/monitor/src/router.ts`, update line 3:

Old:
```ts
import { Login, LogoutView, requireLayout } from '@repo/auth'
```

New:
```ts
import { Login, LogoutView, requireLayout, ensureAutoLogin } from '@repo/auth'
```

- [ ] **Step 2: Replace the `beforeEach` guard**

Replace the entire `beforeEach` block (lines 77-97):

```ts
router.beforeEach(async (to) => {
  const meta = to.meta ?? {}

  // Dev auto-login (pnpm dev:demo)
  await ensureAutoLogin()

  // 1. Require authentication
  if (meta.requireAuth) {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    // 2. Require a selected layout
    if (meta.requireLayout) {
      const redirect = await requireLayout(currentUser.email!, to)
      if (redirect) return redirect
    }
  }
})
```

- [ ] **Step 3: Remove `isDemoMode` from `App.vue`**

In `apps/monitor/src/App.vue`:

Remove line 33:
```ts
const isDemoMode = import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true'
```

Replace line 47:

Old:
```html
    <v-app v-if="user || isDemoMode" :theme="themePreference">
```

New:
```html
    <v-app v-if="user" :theme="themePreference">
```

- [ ] **Step 4: Commit**

```bash
git add apps/monitor/src/router.ts apps/monitor/src/App.vue
git commit -m "refactor(monitor): remove demo mode, add ensureAutoLogin"
```

---

### Task 12: Remove demo mode from tour router

**Files:**
- Modify: `apps/tour/src/router/index.ts:1-20, 72, 86-91`

- [ ] **Step 1: Update imports**

Remove the `createTryDemoRoute` import (line 7):

Old:
```ts
import { createTryDemoRoute } from '@repo/auth'
```

Add `ensureAutoLogin` import. After line 8:
```ts
import { ensureAutoLogin } from '@repo/auth'
```

- [ ] **Step 2: Remove `isDemoMode` and fix `authGuard`**

Remove line 17:
```ts
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
```

Replace line 20:

Old:
```ts
const authGuard = isDemoMode ? [] : [requireGuestOrAuth]
```

New:
```ts
const authGuard = [requireGuestOrAuth]
```

- [ ] **Step 3: Remove `createTryDemoRoute` from routes array**

Remove line 72:
```ts
    createTryDemoRoute(TourLogin),
```

- [ ] **Step 4: Add `ensureAutoLogin` and remove demo bypass from `beforeEach`**

Replace the `beforeEach` block (lines 86-106):

```ts
router.beforeEach(async (to) => {
  // Skip pages that don't need feature checks
  if (to.name === 'not-available' || to.name === 'login') return

  // Dev auto-login (pnpm dev:demo)
  await ensureAutoLogin()

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

- [ ] **Step 5: Commit**

```bash
git add apps/tour/src/router/index.ts
git commit -m "refactor(tour): remove demo mode, add ensureAutoLogin"
```

---

### Task 13: Update `dev:demo` script and env config

**Files:**
- Modify: `package.json` (root, line 25)
- Modify: `turbo.json` (lines 25-26)
- Modify: `.env.example` (lines 46-55)

- [ ] **Step 1: Update root `package.json` `dev:demo` script**

Replace line 25:

Old:
```json
    "dev:demo": "VITE_DEMO_MODE=true turbo run dev"
```

New:
```json
    "dev:demo": "VITE_AUTO_LOGIN=true turbo run dev"
```

- [ ] **Step 2: Update `turbo.json` globalEnv**

Replace lines 25-26:

Old:
```json
    "VITE_DEMO_MODE",
    "VITE_DEV_AUTO_LOGIN",
```

New:
```json
    "VITE_AUTO_LOGIN",
```

- [ ] **Step 3: Update `.env.example`**

Replace the Demo / Dev section (lines 46-55):

Old:
```env
# ── Demo / Dev ───────────────────────────────────────────
# Enable demo mode (bypasses auth in tour app)
VITE_DEMO_MODE=true
# Demo user credentials for automated login and demo mode
VITE_DEMO_EMAIL=demo@dejajs.com
VITE_DEMO_PASSWORD=
# Override layout ID for demo/dev (optional)
VITE_LAYOUT_ID=
# Auto-login for dev/screenshot workflows (never in production)
VITE_DEV_AUTO_LOGIN=
```

New:
```env
# ── Demo / Dev ───────────────────────────────────────────
# Demo user credentials — used by throttle "Try Demo" button
# and by `pnpm dev:demo` auto-login (all apps)
VITE_DEMO_EMAIL=demo@dejajs.com
VITE_DEMO_PASSWORD=
# Note: VITE_AUTO_LOGIN is set by `pnpm dev:demo` — do not add here
```

- [ ] **Step 4: Commit**

```bash
git add package.json turbo.json .env.example
git commit -m "chore: update dev:demo script and clean up env vars"
```

---

### Task 14: Verify — lint and type-check

- [ ] **Step 1: Run lint**

```bash
pnpm lint
```

Expected: No new errors. Fix any that appear from the refactored files.

- [ ] **Step 2: Run type-check**

```bash
pnpm check-types
```

Expected: No new errors. The `isDemoUser` import should resolve in `@repo/dccex` and `@repo/deja` since `@repo/auth` is a workspace dependency.

- [ ] **Step 3: If `@repo/auth` is not a dependency of `@repo/dccex` or `@repo/deja`, add it**

Check `packages/dccex/package.json` and `packages/deja/package.json` for `@repo/auth` in dependencies. If missing:

```bash
pnpm --filter=@repo/dccex add @repo/auth@workspace:*
pnpm --filter=@repo/deja add @repo/auth@workspace:*
```

- [ ] **Step 4: Re-run type-check if dependencies were added**

```bash
pnpm check-types
```

- [ ] **Step 5: Commit any dependency additions**

```bash
git add packages/dccex/package.json packages/deja/package.json pnpm-lock.yaml
git commit -m "chore: add @repo/auth dependency to dccex and deja packages"
```
