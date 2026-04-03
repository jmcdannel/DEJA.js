# 🎯 Demo Mode Refactor — Runtime Detection, Throttle-Only

**Date:** 2026-04-03
**Status:** Draft
**Supersedes:** `2026-03-24-demo-mode-design.md`

---

## Summary

Refactor demo mode from an environment-variable-toggled behavior (`VITE_DEMO_MODE`) that affected all apps into a **runtime, user-identity-based** system scoped to the **throttle app only**. Separately, add a `dev:demo` script that auto-logs into all apps for local dev/screenshot workflows.

---

## Goals

1. **Throttle demo for end users** — "Try Demo" button always visible on throttle login. Signs in as `demo@dejajs.com`, gets mock DCC hardware and RTDB skip. No env var toggle needed.
2. **Dev auto-login for screenshots** — `pnpm dev:demo` starts all apps and auto-logs in with configurable credentials. Real Firebase auth, real data, all guards run normally.
3. **Remove demo mode from non-throttle apps** — Cloud, monitor, and tour should have zero demo-mode logic.

---

## Design

### 1. Runtime Demo User Detection

Replace all `import.meta.env.VITE_DEMO_MODE === 'true'` checks with a runtime check against the current Firebase user's email.

**New helper** in `packages/auth/src/isDemoUser.ts`:

```ts
import { getAuth } from 'firebase/auth'

const DEMO_EMAIL = 'demo@dejajs.com'

export function isDemoUser(): boolean {
  return getAuth().currentUser?.email === DEMO_EMAIL
}

export { DEMO_EMAIL }
```

This is a simple synchronous function — called at command-send time, not at composable setup time. No reactivity needed.

**Consumers:**

| File | Current check | New check |
|------|--------------|-----------|
| `packages/dccex/useDcc.ts` | `import.meta.env.VITE_DEMO_MODE === 'true'` (module-level const) | `isDemoUser()` called inside `send()` |
| `packages/dccex/useDcc.ts` | `const mockResponder = isDemoMode ? createMockResponder() : null` (eager) | Lazy-create on first demo send |
| `packages/deja/useDejaJS.ts` | `import.meta.env.VITE_DEMO_MODE === 'true'` (module-level const) | `isDemoUser()` called inside `sendDejaCommand()` |

**`useDcc.ts` send() changes:**

```ts
import { isDemoUser } from '@repo/auth'
import { createMockResponder } from './mockResponses'

let _mockResponder: ReturnType<typeof createMockResponder> | null = null

async function send(action: string, payload?: object): Promise<void> {
  if (isDemoUser()) {
    if (!_mockResponder) _mockResponder = createMockResponder()
    log.debug('[DEJA DEMO] send', action, payload)
    await _mockResponder.handleCommand(action, payload)
    return
  }
  // ... rest unchanged (emulated, serial, cloud paths)
}
```

**`useDejaJS.ts` changes:**

```ts
import { isDemoUser } from '@repo/auth'

async function sendDejaCommand({ action, payload }: DejaCommand) {
  if (isDemoUser()) {
    log.debug('[DEJA DEMO] skipping RTDB write:', action, payload)
    return
  }
  // ... rest unchanged
}
```

### 2. Throttle — Keep Demo Features

**What stays in throttle:**

- `/try-demo` route via `createTryDemoRoute()` in `apps/throttle/src/router.ts:145`
- `useDemoAuth` composable (signs in with `VITE_DEMO_EMAIL`/`VITE_DEMO_PASSWORD`, sets layout to `demo-betatrack`)
- "Try Demo" button on throttle's login page

**Throttle router guard changes (`apps/throttle/src/router.ts`):**

Remove the blanket demo bypass at line 167-169:
```ts
// DELETE THIS:
if (import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true') {
  return
}
```

Replace with targeted demo-user handling inside the guard chain:
- `requireAuth` — demo user IS authenticated, passes naturally
- `requireLayout` — demo user has `demo-betatrack` layout (set by `useDemoAuth`), passes naturally
- `requireDccEx` — demo user has no real hardware, must be skipped. Add check:
  ```ts
  if (meta.requireDccEx && !isDemoUser()) {
    // run DCC-EX device check
  }
  ```

**Login.vue "Try Demo" button:**

Change the visibility condition from `!!import.meta.env.VITE_DEMO_EMAIL` to a **prop**:

```ts
// Login.vue
defineProps<{
  showTryDemo?: boolean
}>()
```

```html
<!-- Login.vue template -->
<v-divider v-if="showTryDemo" class="my-4" />
<v-btn v-if="showTryDemo" ... >🚂 Try Demo</v-btn>
```

Only throttle's `LoginView.vue` passes `:show-try-demo="true"`. All other apps render `<Login />` without the prop → no button.

### 3. Remove Demo Mode from Non-Throttle Apps

**Cloud router (`apps/cloud/src/router.ts`):**
- Line 9: Remove `import { createTryDemoRoute } from '@repo/auth'`
- Line 315: Remove `createTryDemoRoute()` route
- Lines 396-398: Remove `VITE_DEMO_MODE` bypass in `beforeEach`

**Monitor router (`apps/monitor/src/router.ts`):**
- Lines 82-84: Remove `VITE_DEV_AUTO_LOGIN` bypass block
- Flatten the guard logic (remove the if/else wrapping)

**Monitor App.vue (`apps/monitor/src/App.vue`):**
- Line 33: Remove `const isDemoMode = ...`
- Line 47: Change `v-if="user || isDemoMode"` to `v-if="user"`

**Tour router (`apps/tour/src/router/index.ts`):**
- Line 7: Remove `import { createTryDemoRoute } from '@repo/auth'`
- Line 17: Remove `const isDemoMode = ...`
- Line 20: Change `const authGuard = isDemoMode ? [] : [requireGuestOrAuth]` to `const authGuard = [requireGuestOrAuth]`
- Line 72: Remove `createTryDemoRoute(TourLogin)` route
- Lines 91: Remove `if (isDemoMode) return` in `beforeEach`

### 4. Remove Demo Mode from Shared Auth Guards

**`packages/auth/src/guards/requireAuth.ts`:**
- Lines 4-6: Remove `VITE_DEMO_MODE` bypass. The guard should always check Firebase auth.

**`packages/auth/src/guards/requireDccEx.ts`:**
- Lines 5-7: Remove `VITE_DEMO_MODE` bypass. Throttle handles this in its own router guard with `isDemoUser()` check.

### 5. `useDemoAuth` Cleanup

**`packages/auth/src/useDemoAuth.ts`:**
- Line 17: Remove `const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'`
- Line 49: Remove `isDemoMode` from return object
- The composable's job is just to sign in with demo credentials and set the layout — no env var awareness needed.

### 6. Dev Auto-Login (`dev:demo` Script)

**New shared function** in `packages/auth/src/ensureAutoLogin.ts`:

```ts
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

**Integration in each app's router `beforeEach`:**

Add `await ensureAutoLogin()` as the very first line of every app's `beforeEach` guard (throttle, cloud, monitor, tour). This runs before any auth check. If `VITE_AUTO_LOGIN` isn't set, it's a no-op.

**Root `package.json` script:**

```json
"dev:demo": "VITE_AUTO_LOGIN=true turbo run dev"
```

**Note:** `VITE_AUTO_LOGIN` is set by the script, never stored in `.env`. This means `pnpm dev` = normal login flow, `pnpm dev:demo` = auto-login.

### 7. Env Var Cleanup

**Remove:**
- `VITE_DEMO_MODE` — no longer exists as a concept
- `VITE_DEV_AUTO_LOGIN` — legacy, replaced by `VITE_AUTO_LOGIN`
- `VITE_LAYOUT_ID` — not needed; demo layout is hardcoded in `useDemoAuth`, dev login uses real account's layout

**Keep:**
- `VITE_DEMO_EMAIL` — used by both "Try Demo" button and `dev:demo` auto-login
- `VITE_DEMO_PASSWORD` — same

**Add:**
- `VITE_AUTO_LOGIN` — set by `dev:demo` script only, never in `.env`

**Files to update:**
- `.env.example` — remove `VITE_DEMO_MODE`, `VITE_DEV_AUTO_LOGIN`, `VITE_LAYOUT_ID` entries; document `VITE_AUTO_LOGIN` as script-only
- `turbo.json` `globalEnv` — replace `VITE_DEMO_MODE` and `VITE_DEV_AUTO_LOGIN` with `VITE_AUTO_LOGIN`
- `CLAUDE.md` — update env var table and demo mode documentation

### 8. Exports Cleanup

**`packages/auth/src/index.ts`:**
- Add export for `isDemoUser` and `DEMO_EMAIL`
- Add export for `ensureAutoLogin`
- Keep exports for `useDemoAuth` and `createTryDemoRoute` (throttle still uses them)

---

## Files Changed

### New Files
| File | Purpose |
|------|---------|
| `packages/auth/src/isDemoUser.ts` | Runtime demo user detection |
| `packages/auth/src/ensureAutoLogin.ts` | Dev auto-login for `dev:demo` |

### Modified Files
| File | Change |
|------|--------|
| `packages/auth/src/index.ts` | Add new exports |
| `packages/auth/src/Login.vue` | "Try Demo" gated by `showTryDemo` prop |
| `packages/auth/src/useDemoAuth.ts` | Remove `isDemoMode` env var ref |
| `packages/auth/src/guards/requireAuth.ts` | Remove `VITE_DEMO_MODE` bypass |
| `packages/auth/src/guards/requireDccEx.ts` | Remove `VITE_DEMO_MODE` bypass |
| `packages/dccex/useDcc.ts` | Use `isDemoUser()` runtime check, lazy mock |
| `packages/deja/useDejaJS.ts` | Use `isDemoUser()` runtime check |
| `apps/throttle/src/router.ts` | Replace blanket bypass with targeted `isDemoUser()` check; add `ensureAutoLogin()` |
| `apps/throttle/src/views/LoginView.vue` | Pass `show-try-demo` prop to Login |
| `apps/cloud/src/router.ts` | Remove demo bypass, `createTryDemoRoute` import/route; add `ensureAutoLogin()` |
| `apps/monitor/src/router.ts` | Remove `VITE_DEV_AUTO_LOGIN` bypass; add `ensureAutoLogin()` |
| `apps/monitor/src/App.vue` | Remove `isDemoMode` check |
| `apps/tour/src/router/index.ts` | Remove all demo mode logic; add `ensureAutoLogin()` |
| `.env.example` | Remove `VITE_DEMO_MODE`, `VITE_DEV_AUTO_LOGIN`, `VITE_LAYOUT_ID` |
| `turbo.json` | Update `globalEnv` |
| `package.json` | Update `dev:demo` script |

---

## What This Does NOT Change

- `mockResponses.ts` — unchanged, still the mock DCC responder
- `createTryDemoRoute.ts` — unchanged, still creates `/try-demo` route (throttle-only now)
- Firebase demo account or Firestore demo data — managed through cloud app as before
- Screenshot automation script — will use `dev:demo` for auto-login instead of hardcoded credentials
- Server app — no demo mode concept server-side
