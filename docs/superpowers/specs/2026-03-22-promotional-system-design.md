# Promotional System Design

**Date:** 2026-03-22
**Status:** Approved
**Branch:** `feature/free-support`

---

## Overview

A lightweight promotional content system for DEJA.js that lets you schedule and display promotions across three apps: **dejajs-www** (marketing site), **Cloud** (layout management), and **Throttle** (train control). Content is stored in Firebase Firestore and managed via a CLI seed script + JSON files.

### First Promotion

"Free Installation Support" during the DEJA.js launch — encourages DIY setup via docs, but offers free 1-on-1 help via Discord and email for users who get stuck. Calendly links are shared privately after users reach out, not in the promo itself.

---

## Architecture Decision

**Firebase-only (Approach B)** — The Vue apps (Cloud, Throttle) already talk to Firebase. Content is authored as JSON files in the repo and pushed to Firestore via a CLI script.

**Note:** `dejajs-www` does **not** currently use Firebase — it uses Sanity CMS. Rather than adding a Firebase dependency to the marketing site, the seed script will push promo data to **both** Firestore (for Vue apps) and Sanity (for dejajs-www). This keeps each app reading from its existing data source.

---

## Firestore Schema

**Collection:** `promotions` (top-level, not scoped to a layout — promos are global)

```typescript
interface Promotion {
  // Identity
  id: string                    // Firestore doc ID (e.g., 'launch-support')
  slug: string                  // Human-readable key, matches doc ID

  // Content
  title: string                 // "Free Installation Support"
  body: string                  // Short description text
  ctas: PromoCTA[]              // Array of action buttons

  // Placement
  slots: string[]               // e.g., ['hero-section', 'banner-top']

  // Scheduling
  startDate: Timestamp | null   // null = immediately active
  endDate: Timestamp | null     // null = no expiration
  active: boolean               // Manual kill switch

  // Display
  variant: 'info' | 'success' | 'launch' | 'warning'
  icon: string | null           // Emoji or icon name (e.g., '🚀')

  // Meta
  createdAt: Timestamp
  updatedAt: Timestamp
}

interface PromoCTA {
  label: string                 // "Join Discord"
  url: string                   // External link
  style: 'primary' | 'secondary' | 'ghost'
}
```

### Security Rules

- **Read:** Public (no auth required) — promos are shown to all users including anonymous visitors
- **Write:** Restricted to admin (specific Firebase UID or custom claim)

---

## Placement Slots

Two slots for v1:

| Slot | App(s) | Component | Description |
|------|--------|-----------|-------------|
| `banner-top` | Cloud, Throttle, dejajs-www (non-homepage) | `PromoBanner.vue` / equivalent | Dismissable strip at top of app |
| `hero-section` | dejajs-www homepage only | `PromoHeroSection.tsx` | Rich card/section near the hero |

Slots are just strings in the Firestore document. New slots can be added later (e.g., `card-dashboard`, `modal-onboarding`, `toast-notification`) without schema changes.

---

## `@repo/modules/promotions` — Shared Logic

New domain folder following the established pattern (like `plans/`, `effects/`, etc.):

```
packages/modules/promotions/
├── index.ts          # Re-exports everything
├── types.ts          # Promotion, PromoCTA interfaces
├── constants.ts      # PROMO_SLOTS constants, variant mappings
└── usePromotions.ts  # Vue composable
```

### `usePromotions(slotId: string)`

The core Vue composable:

```typescript
const { promotions, hasPromotions } = usePromotions('banner-top')
```

- Queries `promotions` collection using Vuefire's `useCollection` (reactive, real-time)
- **Not layout-scoped** — promotions are global, so no `layoutId` dependency (unlike effects/signals/turnouts)
- Firestore query filters: `active === true`
- Client-side filters: `slotId` match + date range check (`now >= startDate.toDate()` and `now <= endDate.toDate()`, treating `null` as "always active")
- Returns reactive `promotions` array and `hasPromotions` boolean computed
- No auth required

### `constants.ts`

```typescript
export const PROMO_SLOTS = {
  BANNER_TOP: 'banner-top',
  HERO_SECTION: 'hero-section',
} as const
```

### Module Export

Added to `packages/modules/index.ts`:

```typescript
// Promotions module
export { usePromotions } from './promotions/usePromotions'
export * from './promotions/types'
export * from './promotions/constants'
```

---

## UI Components

### Vue: `PromoBanner.vue` (`@repo/ui`)

Location: `packages/ui/src/Promotions/PromoBanner.vue`

- Uses Vuetify `v-banner` — same pattern as the existing trial banner in Cloud
- Props: `promotion: Promotion`
- Renders: icon + title + body text, CTA buttons in actions slot
- `variant` maps to Vuetify color (`launch` → `success`, `info` → `info`, etc.)
- Dismissable (session-only, no persistence for v1)
- Compact density

Exported from `@repo/ui`:

```typescript
export { default as PromoBanner } from './Promotions/PromoBanner.vue'
```

### React: `PromoHeroSection.tsx` (dejajs-www)

Location: `apps/dejajs-www/components/home/PromoHeroSection.tsx`

- **Reads from Sanity** (not Firebase) — `dejajs-www` has no Firebase dependency and we won't add one
- The seed script pushes promo data to both Firestore and Sanity (see Seed Script section)
- Uses the existing Sanity client (`sanity/lib/client.ts`) with a GROQ query for active `promotion` documents
- Filters for `hero-section` slot, active + in date range
- Styled to match existing homepage sections (gradient background, SectionLabel, AnimateIn)
- Renders title, body, CTA buttons with existing glow styles
- Renders nothing when no active promo — zero layout impact

### Sanity Schema: `promotion` Document Type

New schema at `apps/dejajs-www/sanity/schemaTypes/documents/promotion.ts`:

- Mirrors the Firestore `Promotion` fields: slug, title, body, ctas (array of objects), slots (array of strings), startDate, endDate, active, variant, icon
- Follows the existing Sanity schema patterns (uses `defineType`, `defineField`)
- Added to the schema index alongside homepage, pricing-page, etc.

---

## Per-App Integration

### Cloud App (`apps/cloud/src/App.vue`)

- Import `usePromotions` from `@repo/modules` and `PromoBanner` from `@repo/ui`
- Call `usePromotions(PROMO_SLOTS.BANNER_TOP)`
- Render `<PromoBanner>` below the existing trial banner (line ~121)
- Both banners coexist — trial info and promo are separate concerns

### Throttle App (`apps/throttle/`)

- Same import pattern
- Place `<PromoBanner>` above the main router view
- Connection status banner (snackbar at bottom) remains separate

### Website (`apps/dejajs-www/`)

- Add `PromoHeroSection` to the homepage between hero and first content section
- Queries **Sanity** via the existing client (not Firebase — dejajs-www has no Firebase dependency)
- Also add a `PromoBannerStrip` React component for `banner-top` slot on non-homepage pages (pricing, product pages, etc.)
- Server component, simple GROQ query at render time

---

## Seed Script & Content Management

### `scripts/push-promo.ts`

CLI script run with `tsx`:

1. Reads a JSON file (e.g., `promotions/launch-support.json`)
2. Validates required fields and slot names
3. Upserts to **Firestore** `promotions/{slug}` using Firebase Admin SDK (for Vue apps)
4. Upserts to **Sanity** `promotion` document using the Sanity client (for dejajs-www)
5. Adds `createdAt`/`updatedAt` timestamps
6. Confirms success for both targets

This dual-write approach keeps each app reading from its native data source with zero new dependencies.

### Root `package.json` Scripts

```json
{
  "promo:push": "tsx scripts/push-promo.ts",
  "promo:deactivate": "tsx scripts/push-promo.ts --deactivate"
}
```

**Usage:**

```bash
pnpm promo:push promotions/launch-support.json
pnpm promo:deactivate launch-support
```

### `promotions/` Directory

Version-controlled promo content at the repo root:

```
promotions/
├── README.md               # Schema docs, slot names, usage guide
└── launch-support.json     # First promo
```

### `promotions/README.md`

Documents:
- Firestore schema with field descriptions
- Available slot names and where they render
- Available variants
- How to create, push, deactivate, and remove promos
- Example JSON

---

## What This Does NOT Include (v1)

- **No user targeting** — promos show to everyone when active
- **No dismissal persistence** — dismiss is session-only
- **No A/B testing or feature flags**
- **No admin UI** — managed via CLI + JSON files
- **No scheduling daemon** — date filtering is client-side at render time
- **No preview mode** — push and check in dev
- **No `PromoCard` component** — only banner + hero section for v1

These can all be added incrementally as needs grow.

---

## Launch Promo Content

```json
{
  "slug": "launch-support",
  "title": "Free Installation Support",
  "body": "We encourage DIY — our docs will get you there. But if you get stuck, we're here to help during our launch period.",
  "icon": "🚀",
  "variant": "launch",
  "active": true,
  "startDate": null,
  "endDate": null,
  "slots": ["hero-section", "banner-top"],
  "ctas": [
    {
      "label": "Join Discord",
      "url": "<discord-invite-url>",
      "style": "primary"
    },
    {
      "label": "Email Support",
      "url": "mailto:<support-email>",
      "style": "secondary"
    }
  ]
}
```
