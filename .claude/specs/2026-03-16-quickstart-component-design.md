# QuickStart Component — Design Spec

**Date:** 2026-03-16
**Status:** Approved
**Location:** `packages/ui/src/QuickStart/QuickStart.vue`

---

## Overview

A shared Vue 3 component that guides new users through the two steps required to start using DEJA.js: creating an account and installing the server. The component is designed for reuse across multiple surfaces — the DEJAjs.com homepage, the Cloud and Throttle app settings pages, and the getting-started documentation page.

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Layout style | Numbered vertical stepper | Clear sequence, familiar onboarding pattern, line connecting steps |
| Completion state | Prop-driven (`completed: number[]`) | No auth coupling in the component; parent wires up auth checks per context |
| Step 2 install block | Compose `ServerSetupInfo` | Reuses existing copy-button logic; supports personalized URL when `uid`/`layoutId` provided |
| CTA links | Plain text row, no icons | Minimal visual noise; lets the stepper stay dominant |

---

## Component Spec

### File location

```
packages/ui/src/QuickStart/QuickStart.vue
```

Also export from `packages/ui/src/index.ts`:
```typescript
export { default as QuickStart } from './QuickStart/QuickStart.vue'
```

### Props

```typescript
interface Props {
  /** Step numbers (1-based) that the parent considers already completed. */
  completed?: number[]
  /** Firebase UID — passed to ServerSetupInfo to generate a personalized install URL. */
  uid?: string
  /** Layout ID — passed to ServerSetupInfo to generate a personalized install URL. */
  layoutId?: string
}

const props = withDefaults(defineProps<Props>(), {
  completed: () => [],
  uid: undefined,
  layoutId: undefined,
})
```

No emits. The component is purely presentational.

### Step structure

Two steps, stacked vertically with a connector line between them.

**Step 1 — Register**
- Circle: filled sky-blue (`#38bdf8`) with number `1`, OR green (`#22c55e`) with `✓` checkmark when completed
- Title: "Create your account"
- Description: "Sign up at DEJA Cloud to get your Layout ID"
- CTA button: `v-btn` → `https://cloud.dejajs.com/sign-up` (opens in new tab)
- When completed: step is dimmed (`opacity-60`), title has strikethrough, CTA button hidden, replaced with "You're already registered" hint text

**Step 2 — Install**
- Circle: filled sky-blue with number `2` when active; outlined dimmed circle when step 1 is not yet complete
- Title: "Install the server"
- Description: "Run on Raspberry Pi, Mac, or Linux"
- Body: `<ServerSetupInfo :uid="uid" :layout-id="layoutId" />` — shows generic URL when uid/layoutId are omitted, personalized URL when provided
- When completed: same dimmed/strikethrough treatment as step 1

**Connector line**
- A 1px vertical line connecting the bottom of step 1's circle to the top of step 2's circle
- Color: `rgba(56, 189, 248, 0.25)` when step 1 is pending; `rgba(34, 197, 94, 0.25)` when step 1 is complete

### CTA links section

Separated from the steps by a thin horizontal rule (`rgba(148, 163, 184, 0.1)`). Four plain text links in a horizontal row with `gap-5`:

| Label | URL |
|---|---|
| Docs | `https://docs.dejajs.com` |
| DEJA IO | `https://dejajs.com/io` |
| Help | `https://dejajs.com/help` |
| FAQ | `https://dejajs.com/faq` |

All links open in a new tab (`target="_blank" rel="noopener"`). Styled as `text-sky-400` with `text-sm`, no underline by default, underline on hover.

---

## Visual States

### State A — Unauthenticated (homepage, docs page)

```
  ①  Create your account
  │   Sign up at DEJA Cloud to get your Layout ID
  │   [ Register at cloud.dejajs.com → ]
  │
  ②  Install the server
      Run on Raspberry Pi, Mac, or Linux
      [ curl -fsSL https://install.dejajs.com | bash   Copy ]

  ──────────────────────────────────
  Docs · DEJA IO · Help · FAQ
```

### State B — Step 1 complete (Cloud / Throttle settings)

```
  ✓  ~~Create your account~~         (dimmed, strikethrough)
  │   You're already registered
  │
  ②  Install the server
      Run on Raspberry Pi, Mac, or Linux
      [ curl -fsSL https://install.dejajs.com?uid=… | bash   Copy ]

  ──────────────────────────────────
  Docs · DEJA IO · Help · FAQ
```

---

## Styling Conventions

Follows existing `@repo/ui` conventions:

- `<script setup lang="ts">` Composition API
- Vuetify components for interactive elements: `v-btn` for the Register CTA
- Tailwind utility classes for layout and spacing
- Dark-theme palette: sky-400 (`#38bdf8`), green-500 (`#22c55e`), slate-400/300/800 for supporting text and borders
- Scoped `<style>` only if custom transitions or pseudo-elements are needed
- Circle step indicators: `div` with `rounded-full`, sized `w-8 h-8` (32px)

---

## Usage Examples

### Homepage / Docs (no auth)

```vue
<QuickStart />
```

### Cloud App Settings (user logged in)

```vue
<script setup lang="ts">
import { useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { QuickStart } from '@repo/ui'

const user = useCurrentUser()
const layoutId = useStorage('@DEJA/layoutId', '')
</script>

<template>
  <QuickStart
    :completed="user ? [1] : []"
    :uid="user?.uid"
    :layout-id="layoutId"
  />
</template>
```

### Getting Started Docs Page (dejajs-www)

```vue
<QuickStart />
<!-- or with optional user state if the docs site has auth -->
```

---

## Files to Create / Modify

| Action | File |
|---|---|
| **Create** | `packages/ui/src/QuickStart/QuickStart.vue` |
| **Modify** | `packages/ui/src/index.ts` — add export |
| **Create** (optional) | `packages/ui/src/QuickStart/QuickStart.stories.ts` — Storybook stories |

---

## Out of Scope

- No Storybook story is required for MVP but is encouraged
- The component does not manage its own auth state — auth is always the parent's responsibility
- The CTA link URLs are hardcoded constants for now; they can be made into props in a future iteration if needed
- Step 2 completion state is not wired to any server status check — the parent is responsible for determining completion
