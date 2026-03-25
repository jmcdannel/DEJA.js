# Shared 404 Page — Design Spec

**Date:** 2026-03-16
**Status:** Approved
**Branch:** claude/inspiring-borg

---

## Overview

Create a shared `NotFoundPage.vue` component in `@repo/ui` and wire it into all four Vue apps (cloud, throttle, monitor, tour). The existing `apps/cloud/src/views/NotFound.vue` will be replaced. The other three apps currently have no 404 handling and need catch-all routes added.

---

## Goals

- Single source of truth for the 404 experience across all apps
- Brand-consistent design following DEJA.js Brand Guidelines v2.0
- Simple, elegant — no over-engineered content or animations
- Configurable navigation links per app via props

---

## Component Design

### Location

`packages/ui/src/NotFoundPage.vue`

### Visual Layout

Vertically and horizontally centered, full-height (`min-height: 100vh`), dark background (`#0F172A`).

```
        [ Logo ]        ← existing Logo.vue component

          404           ← large, brand cyan #00E3EF, text-h1

    Page not found.     ← text-h5, muted (#94A3B8)

  Looks like this train has left the station.   ← text-body-2, muted

   [ button ]  [ button ]   ← v-btn, variant="tonal", configurable
```

### Props

```ts
interface NavLink {
  label: string
  to: string   // Internal vue-router paths only (e.g. '/dashboard'). External URLs are not supported.
  icon?: string
}

interface Props {
  links?: NavLink[]
}
```

- If `links` is empty or not provided, defaults to a single **"Go Home"** button routing to `'/'`
- Buttons use `v-btn` with `variant="tonal"`, `color="primary"`, and `size="large"`
- If an `icon` is provided on a link, it renders as `prepend-icon`

### Copy

| Element | Text |
|---|---|
| Error code | `404` |
| Heading | `Page not found.` |
| Subtext | `Looks like this train has left the station.` |
| Default button | `Go Home` |

---

## Integration Per App

All wrapper views import via the barrel: `import { NotFoundPage } from '@repo/ui'`

### Cloud (`apps/cloud`)

- **Fully replace** `apps/cloud/src/views/NotFound.vue` — delete all existing script, template, style, and scoped CSS; replace with a minimal wrapper using `<NotFoundPage :links="[...]" />`
- Pass cloud-specific nav links (e.g. Dashboard, Roster, Effects)
- Catch-all route already exists at `router.ts` line 246 with `meta: { requireAuth: true }` — no change needed

### Throttle (`apps/throttle`)

- Add catch-all route to `apps/throttle/src/router.ts` using `beforeEnter: [requireAuth]` to match the app's existing guard pattern
- Create `apps/throttle/src/views/NotFound.vue` as a minimal wrapper
- Pass throttle-relevant links (e.g. Throttle, Roster, Turnouts)

### Monitor (`apps/monitor`)

- Add catch-all route to `apps/monitor/src/router.ts` using `beforeEnter: [requireAuth]` to match the app's existing guard pattern
- Create `apps/monitor/src/views/NotFound.vue` as a minimal wrapper
- Pass monitor-relevant links (e.g. Dashboard, Logs)

### Tour (`apps/tour`)

- Add catch-all route to `apps/tour/src/router/index.ts` with **no auth guard** — tour allows guest users via `requireGuestOrAuth`, so the 404 page must be accessible to unauthenticated users too
- Create `apps/tour/src/views/NotFound.vue` as a minimal wrapper
- Pass a single Go Home link (`'/'`)

---

## Package Exports

Add to `packages/ui/src/index.ts`:
```ts
export { default as NotFoundPage } from './NotFoundPage.vue'
```

Add to `packages/ui/package.json` exports:
```json
"./NotFoundPage": "./src/NotFoundPage.vue"
```

---

## Brand Alignment

| Guideline | Application |
|---|---|
| Primary cyan `#00E3EF` | 404 number |
| Muted text `#94A3B8` | Heading and subtext |
| Dark bg `#0F172A` | Page background |
| Logo mark | `Logo.vue` reused at top |
| Voice: warm but precise | "Looks like this train has left the station." |
| Elegance through simplicity | No animation, no card, no decoration |
| Inter / Vuetify type scale | `text-h1`, `text-h5`, `text-body-2` |

---

## What's Not Included

- No animations or CSS keyframes
- No expansion panels or technical details section
- No train emoji in the error code (plain `404`)
- No fun facts or extra content sections

---

## Files Changed

| File | Change |
|---|---|
| `packages/ui/src/NotFoundPage.vue` | **New** — shared component |
| `packages/ui/src/index.ts` | Add export |
| `packages/ui/package.json` | Add named export |
| `apps/cloud/src/views/NotFound.vue` | Replace body with shared component |
| `apps/throttle/src/router.ts` | Add catch-all route |
| `apps/throttle/src/views/NotFound.vue` | **New** — thin wrapper |
| `apps/monitor/src/router.ts` | Add catch-all route |
| `apps/monitor/src/views/NotFound.vue` | **New** — thin wrapper |
| `apps/tour/src/router/index.ts` | Add catch-all route |
| `apps/tour/src/views/NotFound.vue` | **New** — thin wrapper |
