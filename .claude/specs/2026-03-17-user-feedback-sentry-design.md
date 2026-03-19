# User Feedback via Sentry — Design Spec

**Date:** 2026-03-17
**Status:** Approved
**Scope:** `apps/cloud`, `apps/throttle`, `packages/modules`
**Spec path (post plan-mode):** `docs/superpowers/specs/2026-03-17-user-feedback-sentry-design.md`

---

## Context

DEJA.js has Sentry v8 (`@sentry/vue@^8`) already integrated in all four Vue apps with session replay and browser tracing. The apps lack any mechanism for users to proactively report issues or share feedback. This change adds Sentry's built-in feedback widget to the cloud and throttle apps, with:

- A persistent floating "Feedback" button (general feedback, any time)
- Automatic feedback dialog on unhandled Vue errors (error-triggered)
- User identity pre-filled from Firebase Auth (name + email from logged-in session)
- Shared configuration via a new `@repo/modules/feedback` domain module

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Widget type | Sentry `feedbackIntegration()` floating button | Zero custom UI, leverages existing Sentry setup |
| Error triggering | `app.config.errorHandler` + `Sentry.showReportDialog()` | Vue-native, pairs error event ID with feedback dialog |
| Shared config | New `feedback/` subdomain in `@repo/modules` | DRY across apps, easy to extend to monitor/tour later |
| User identity | `useFeedbackUser()` composable + `Sentry.setUser()` in App.vue | Composable stays in modules, Sentry call stays in app layer |
| Color scheme | `dark` hardcoded | Both apps use dark theme by default |
| Branding | Disabled | Cleaner UX |

---

## New Files

### `packages/modules/feedback/types.ts`

```typescript
// Mirrors Sentry's User type fields so Sentry.setUser(feedbackUser) works without mapping.
// 'username' (not 'name') is what the feedback widget reads by default (useSentryUser default: { email: 'email', name: 'username' }).
// id is optional string | number to match Sentry's User.id — Firebase uid is always string at runtime.
export interface FeedbackUser {
  email?: string
  username?: string
  id?: string | number
}
```

### `packages/modules/feedback/config.ts`

```typescript
// useSentryUser defaults to { email: 'email', name: 'username' }.
// FeedbackUser maps Firebase displayName → User.username, so the name field pre-fills automatically.
// No useSentryUser override needed.
export const feedbackConfig = {
  colorScheme: 'dark' as const,
  showBranding: false,
  triggerLabel: 'Feedback',       // 'buttonLabel' is not a valid key — use 'triggerLabel'
  submitButtonLabel: 'Submit',
  formTitle: 'Share Feedback',
  messagePlaceholder: 'Describe what you were doing and what went wrong...',
}
```

### `packages/modules/feedback/useFeedbackUser.ts`

```typescript
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
            username: user.displayName ?? undefined, // 'username' maps to Sentry User.username
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
```

### `packages/modules/feedback/index.ts`

```typescript
export * from './types'
export * from './config'
export { default as useFeedbackUser } from './useFeedbackUser'
```

This matches the `export { default as useEfx }` pattern used by all other subdomain barrels.
`useFeedbackUser.ts` must have `export default useFeedbackUser` at the bottom.

---

## Modified Files

### `packages/modules/package.json`

Add to `exports`:
```json
"./feedback": "./feedback/index.ts"
```
Note: No new dependency needed — `firebase/auth` is already a dep of `@repo/modules`.

### `packages/modules/index.ts`

Add at the end (matching the `default as` pattern used by all other composables):
```typescript
// Feedback
export { default as useFeedbackUser } from './feedback/useFeedbackUser'
export * from './feedback/types'
export * from './feedback/config'
```

### `apps/cloud/src/main.ts` and `apps/throttle/src/main.ts`

**Add import:**
```typescript
import { feedbackConfig } from '@repo/modules/feedback'
```

**Update `Sentry.init()` integrations array:**
```typescript
integrations: [
  Sentry.browserTracingIntegration({ router }),
  Sentry.replayIntegration(),
  Sentry.feedbackIntegration(feedbackConfig),
],
```

**Add error handler after `Sentry.init()`:**
```typescript
app.config.errorHandler = (err, _instance, info) => {
  const eventId = Sentry.captureException(err, { extra: { info } })
  Sentry.showReportDialog({ eventId })
}
```

### `apps/cloud/src/App.vue` and `apps/throttle/src/App.vue`

**Add to `<script setup>`:**
```typescript
import { useFeedbackUser } from '@repo/modules/feedback'
import * as Sentry from '@sentry/vue'
import { watch } from 'vue'

const { feedbackUser } = useFeedbackUser()
watch(feedbackUser, (u) => Sentry.setUser(u), { immediate: true })
```

---

## File Change Summary

| File | Change |
|------|--------|
| `packages/modules/feedback/types.ts` | New — `FeedbackUser` interface |
| `packages/modules/feedback/config.ts` | New — shared widget config |
| `packages/modules/feedback/useFeedbackUser.ts` | New — Firebase Auth → Sentry user composable |
| `packages/modules/feedback/index.ts` | New — barrel export |
| `packages/modules/package.json` | Add `./feedback` export entry |
| `packages/modules/index.ts` | Re-export feedback module |
| `apps/cloud/src/main.ts` | Add `feedbackIntegration` + `errorHandler` |
| `apps/cloud/src/App.vue` | Add `useFeedbackUser` + `Sentry.setUser` watcher |
| `apps/throttle/src/main.ts` | Add `feedbackIntegration` + `errorHandler` |
| `apps/throttle/src/App.vue` | Add `useFeedbackUser` + `Sentry.setUser` watcher |

**Total:** 4 new files, 6 modified files.

---

## Verification

1. Start cloud app: `pnpm --filter=deja-cloud dev` — floating "Feedback" button should appear in bottom-right corner. If it does not appear, use named import `import { feedbackIntegration } from '@sentry/vue'` instead of `Sentry.feedbackIntegration()` (the namespace import may resolve to a no-op shim in some Sentry bundle configurations).
2. Click the button — form should open with dark theme, no Sentry branding
3. Log in — submit feedback — check Sentry dashboard at `https://track-and-trestle-technology-l.sentry.io` for the feedback item with user email/name attached
4. Trigger a Vue error (e.g., via browser console) — `Sentry.showReportDialog()` should open automatically
5. Repeat steps 1–4 for throttle app (`pnpm --filter=deja-throttle dev`)
6. Run `pnpm check-types` — no TypeScript errors
7. Run `pnpm lint` — no lint errors
