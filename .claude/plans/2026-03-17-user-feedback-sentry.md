# User Feedback via Sentry — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Sentry-powered feedback widget to the cloud and throttle apps — a persistent floating button for general feedback plus an automatic dialog on unhandled Vue errors, with user identity pre-filled from Firebase Auth.

**Architecture:** A new `feedback/` subdomain module in `@repo/modules` exports shared config (`feedbackConfig`) and a composable (`useFeedbackUser`) that maps Firebase Auth state to Sentry user fields. Each app wires these in `main.ts` (Sentry init + error handler) and `App.vue` (user identity watcher). No new npm packages needed.

**Tech Stack:** `@sentry/vue@^8` (already installed), Firebase Auth (`firebase/auth`), Vue 3 Composition API, TypeScript strict mode, pnpm workspaces

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `packages/modules/feedback/types.ts` | Create | `FeedbackUser` interface (mirrors `Sentry.User` shape) |
| `packages/modules/feedback/config.ts` | Create | Shared `feedbackConfig` object for `feedbackIntegration()` |
| `packages/modules/feedback/useFeedbackUser.ts` | Create | Composable — Firebase Auth → reactive `FeedbackUser` ref |
| `packages/modules/feedback/index.ts` | Create | Barrel export for the subdomain |
| `packages/modules/package.json` | Modify | Add `./feedback` export entry |
| `packages/modules/index.ts` | Modify | Re-export feedback module from root barrel |
| `apps/cloud/src/main.ts` | Modify | Add `feedbackIntegration` to Sentry init + Vue error handler |
| `apps/cloud/src/App.vue` | Modify | Watch `feedbackUser` → `Sentry.setUser()` |
| `apps/throttle/src/main.ts` | Modify | Same as cloud `main.ts` |
| `apps/throttle/src/App.vue` | Modify | Same as cloud `App.vue` |

---

## Task 1: Create the `@repo/modules/feedback` subdomain

**Files:**
- Create: `packages/modules/feedback/types.ts`
- Create: `packages/modules/feedback/config.ts`
- Create: `packages/modules/feedback/useFeedbackUser.ts`
- Create: `packages/modules/feedback/index.ts`

- [ ] **Step 1.1: Create `types.ts`**

```typescript
// packages/modules/feedback/types.ts

// Mirrors Sentry's User type fields so Sentry.setUser(feedbackUser) works without mapping.
// 'username' (not 'name') is what the feedback widget reads by default
// (useSentryUser default: { email: 'email', name: 'username' }).
// id is optional string | number to match Sentry's User.id — Firebase uid is always string at runtime.
export interface FeedbackUser {
  email?: string
  username?: string
  id?: string | number
}
```

- [ ] **Step 1.2: Create `config.ts`**

```typescript
// packages/modules/feedback/config.ts

// useSentryUser defaults to { email: 'email', name: 'username' }.
// FeedbackUser maps Firebase displayName → User.username, so the name field pre-fills automatically.
// No useSentryUser override needed.
export const feedbackConfig = {
  colorScheme: 'dark' as const,
  showBranding: false,
  triggerLabel: 'Feedback',
  submitButtonLabel: 'Submit',
  formTitle: 'Share Feedback',
  messagePlaceholder: 'Describe what you were doing and what went wrong...',
}
```

- [ ] **Step 1.3: Create `useFeedbackUser.ts`**

```typescript
// packages/modules/feedback/useFeedbackUser.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { getAuth, onAuthStateChanged, type Unsubscribe } from 'firebase/auth'
import type { FeedbackUser } from './types'

export function useFeedbackUser() {
  const feedbackUser = ref<FeedbackUser | null>(null)
  let unsubscribe: Unsubscribe | null = null

  onMounted(() => {
    const auth = getAuth()
    unsubscribe = onAuthStateChanged(auth, (user) => {
      feedbackUser.value = user
        ? {
            email: user.email ?? undefined,
            username: user.displayName ?? undefined, // maps to Sentry User.username for name pre-fill
            id: user.uid,
          }
        : null
    })
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return { feedbackUser }
}

export default useFeedbackUser
```

- [ ] **Step 1.4: Create `index.ts`**

Follows the `export { default as useXxx }` pattern used by all other subdomains in this package (e.g. `effects/index.ts` uses `export { default as useEfx }`):

```typescript
// packages/modules/feedback/index.ts
export * from './types'
export * from './config'
export { default as useFeedbackUser } from './useFeedbackUser'
```

- [ ] **Step 1.5: Type-check the new module**

Run from repo root:
```bash
pnpm --filter=@repo/modules type-check
```

Expected: exits 0, no errors. If `firebase/auth` import fails, check that `firebase` is listed in `packages/modules/package.json` dependencies (it should already be there).

---

## Task 2: Register the feedback module in `@repo/modules` exports

**Files:**
- Modify: `packages/modules/package.json`
- Modify: `packages/modules/index.ts`

- [ ] **Step 2.1: Add `./feedback` to `packages/modules/package.json` exports**

Open `packages/modules/package.json`. Find the `"exports"` field (currently has entries like `"."`, `"./effects"`, `"./layouts"`, etc.) and add:

```json
"./feedback": "./feedback/index.ts"
```

The exports object should look like:
```json
"exports": {
  ".": "./index.ts",
  "./effects": "./effects/index.ts",
  "./layouts": "./layouts/index.ts",
  "./locos": "./locos/index.ts",
  "./signals": "./signals/index.ts",
  "./turnouts": "./turnouts/index.ts",
  "./preferences": "./preferences/index.ts",
  "./routes": "./routes/index.ts",
  "./types": "./types.ts",
  "./plans/types": "./plans/types.ts",
  "./feedback": "./feedback/index.ts"
}
```

- [ ] **Step 2.2: Add feedback re-exports to `packages/modules/index.ts`**

Open `packages/modules/index.ts`. At the end of the file, add:

```typescript
// Feedback
export { default as useFeedbackUser } from './feedback/useFeedbackUser'
export * from './feedback/types'
export * from './feedback/config'
```

- [ ] **Step 2.3: Verify type-check still passes**

```bash
pnpm --filter=@repo/modules type-check
```

Expected: exits 0.

- [ ] **Step 2.4: Commit**

```bash
git add packages/modules/feedback/ packages/modules/package.json packages/modules/index.ts
git commit -m "feat(modules): add feedback subdomain with useFeedbackUser composable and Sentry config"
```

---

## Task 3: Wire feedback into the cloud app

**Files:**
- Modify: `apps/cloud/src/main.ts`
- Modify: `apps/cloud/src/App.vue`

- [ ] **Step 3.1: Update `apps/cloud/src/main.ts`**

Add the import near the top where other `@repo/modules` imports live:
```typescript
import { feedbackConfig } from '@repo/modules/feedback'
```

Update the `Sentry.init()` call — add `Sentry.feedbackIntegration(feedbackConfig)` to the integrations array:
```typescript
Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration(feedbackConfig),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

After `Sentry.init()`, add the Vue error handler:
```typescript
app.config.errorHandler = (err, _instance, info) => {
  const eventId = Sentry.captureException(err, { extra: { info } })
  Sentry.showReportDialog({ eventId })
}
```

> **Note:** If `Sentry.feedbackIntegration` is not found at runtime (namespace import resolves to a no-op shim), switch to the named import: `import { feedbackIntegration } from '@sentry/vue'` and call `feedbackIntegration(feedbackConfig)` directly.

- [ ] **Step 3.2: Update `apps/cloud/src/App.vue`**

In the `<script setup lang="ts">` block, add these after the existing imports. `watch` is already imported from `'vue'` on line 3 (`import { ref, computed, watch } from 'vue'`) — do NOT add it again, only add the two new imports and the two new lines:

```typescript
import { useFeedbackUser } from '@repo/modules/feedback'
import * as Sentry from '@sentry/vue'
// (do not re-import watch — it is already imported)

const { feedbackUser } = useFeedbackUser()
watch(feedbackUser, (u) => Sentry.setUser(u), { immediate: true })
```

- [ ] **Step 3.3: Type-check the cloud app**

```bash
pnpm --filter=deja-cloud type-check
```

Expected: exits 0, no errors.

- [ ] **Step 3.4: Start cloud app and verify widget appears**

```bash
pnpm --filter=deja-cloud dev
```

Open the app in a browser. A "Feedback" button should appear in the bottom-right corner. Click it — the form should open with a dark theme and no Sentry branding. Log in (or use `VITE_DEMO_MODE=true` in `.env`) and submit a test feedback item. Check `https://track-and-trestle-technology-l.sentry.io` → User Feedback section for the submission.

- [ ] **Step 3.5: Commit**

```bash
git add apps/cloud/src/main.ts apps/cloud/src/App.vue
git commit -m "feat(cloud): add Sentry feedback widget and error-triggered report dialog"
```

---

## Task 4: Wire feedback into the throttle app

**Files:**
- Modify: `apps/throttle/src/main.ts`
- Modify: `apps/throttle/src/App.vue`

The changes are identical to Task 3. Apply the same edits.

- [ ] **Step 4.1: Update `apps/throttle/src/main.ts`**

Same changes as Step 3.1:
1. Add `import { feedbackConfig } from '@repo/modules/feedback'`
2. Add `Sentry.feedbackIntegration(feedbackConfig)` to integrations array
3. Add `app.config.errorHandler` after `Sentry.init()`

The throttle `main.ts` already has `import * as Sentry from '@sentry/vue'` — just add to it.

- [ ] **Step 4.2: Update `apps/throttle/src/App.vue`**

`watch` is already imported on line 13 (`import { watch, onMounted, onUnmounted } from 'vue'`) — do NOT re-import it. Add only the two new imports and two new lines:

```typescript
import { useFeedbackUser } from '@repo/modules/feedback'
import * as Sentry from '@sentry/vue'
// (do not re-import watch — it is already imported on line 13)

const { feedbackUser } = useFeedbackUser()
watch(feedbackUser, (u) => Sentry.setUser(u), { immediate: true })
```

- [ ] **Step 4.3: Type-check the throttle app**

```bash
pnpm --filter=deja-throttle type-check
```

Expected: exits 0.

- [ ] **Step 4.4: Start throttle app and verify widget**

```bash
pnpm --filter=deja-throttle dev
```

Same verification as Step 3.4: floating button visible, form opens dark, feedback submits to Sentry with user identity attached.

- [ ] **Step 4.5: Commit**

```bash
git add apps/throttle/src/main.ts apps/throttle/src/App.vue
git commit -m "feat(throttle): add Sentry feedback widget and error-triggered report dialog"
```

---

## Task 5: Final validation + spec doc + changeset + PR

- [ ] **Step 5.1: Full type-check across monorepo**

```bash
pnpm check-types
```

Expected: exits 0.

- [ ] **Step 5.2: Lint**

```bash
pnpm lint
```

Expected: exits 0 (auto-fix applied). If lint errors remain, fix them before proceeding.

- [ ] **Step 5.3: Save the spec document**

Copy the spec from the plan file to the correct location (spec was written during plan-mode and needs to be committed to the repo):

Create `docs/superpowers/specs/2026-03-17-user-feedback-sentry-design.md` with the contents of `/Users/jmcdannel/.claude/plans/glittery-noodling-cerf.md`.

- [ ] **Step 5.4: Create changeset**

Run `/changelog` to generate a changeset entry for the PR. Use `minor` bump (new user-facing feature). Example description:

```
added: **[cloud, throttle]** Sentry user feedback widget — persistent floating button for general feedback plus automatic report dialog on unhandled errors, with user identity pre-filled from Firebase Auth
```

- [ ] **Step 5.5: Open PR**

Run `/commit-push-pr` to commit remaining files (changeset, spec doc) and open the pull request.
