# Design — Product Page Rebuild + Brand Refresh

**Date:** 2026-04-09
**Status:** Draft → awaiting user review
**Scope:** `apps/dejajs-www` (marketing site)
**Delivery:** Single PR to `preview` containing all three phases below

---

## 1. Overview

Rewrite the six product pages on `dejajs.com` from scratch, cascade a new brand-color + icon system across the monorepo, and fully remove Sanity from the marketing site in the same change. 🚂

The three work streams ship as one PR but are designed as sequential phases so the diff is reviewable:

1. **Phase 1 — Brand refresh.** New per-product color tokens and icons. User supplies assets.
2. **Phase 2 — Sanity removal.** Strip Sanity from the entire marketing site, hardcode all nav / sitemap / page content.
3. **Phase 3 — Product page rebuild.** Six unique pages composed from a shared building-block library.

### Products in scope

Six products, displayed in this nav order throughout the site:

1. **Throttle** — precise mobile throttle control
2. **Server** — Node.js bridge between browser and DCC-EX
3. **Cloud** — roster and layout management hub
4. **IO** — Arduino / Pico W hardware expansion via MQTT
5. **Monitor** — diagnostics, command traces, sensor telemetry
6. **Tour** — interactive tours and effect sequences

### Non-goals

- Not recoloring in-app Vuetify themes inside Throttle / Cloud / Monitor / Tour runtimes
- Not recapturing existing screenshots
- Not touching docs / guides / pricing / FAQ pages
- Not adding any explicit competitor comparison tables or named competitor callouts

---

## 2. Phase 1 — Brand refresh

User supplies:

- Six product colors (hex values) — one per product
- Six sets of product icons (at least `icon-512.png`, `icon-192.png`, `icon-192-maskable.png`, `apple-touch-icon.png` per product)

### Token layout

`apps/dejajs-www/styles/globals.css` gets a new set of per-product tokens in the `@theme` block:

```css
@theme {
  /* Existing core brand — unchanged */
  --color-deja-cyan: #00E5FF;
  --color-deja-magenta: #D500F9;
  --color-deja-lime: #69FF00;

  /* New per-product tokens */
  --color-deja-throttle: <TBD>;
  --color-deja-server:   <TBD>;
  --color-deja-cloud:    <TBD>;
  --color-deja-io:       <TBD>;
  --color-deja-monitor:  <TBD>;
  --color-deja-tour:     <TBD>;
}
```

Matching `.glow-{product}` utilities mirror the existing `.glow-cyan` / `.glow-magenta` / `.glow-lime` pattern so each product page can apply brand-colored drop shadows without inline style.

### Surfaces updated (in scope)

| Surface | Files |
|---|---|
| Brand tokens | `apps/dejajs-www/styles/globals.css` |
| Marketing site product icons | `apps/dejajs-www/public/{throttle,server,cloud,io,monitor,tour}/icon-*.png` |
| Site-level PWA manifest | `apps/dejajs-www/app/manifest.json` |
| OG image references | `apps/dejajs-www/app/{product}/page.tsx` metadata |
| Header nav icons | `apps/dejajs-www/components/Header.tsx` (`defaultProducts` array) |
| In-app PWA manifests | `apps/{throttle,cloud,monitor,tour}/public/manifest.json` |
| In-app favicons + meta | `apps/{throttle,cloud,monitor,tour}/public/favicon.*`, `<meta theme-color>` in `index.html` |
| IconKitchen source folders | `apps/{throttle,cloud,monitor,tour}/public/IconKitchen-*/` |

Server and IO do not have runtime apps with favicons or manifests — their icons only appear in the marketing site.

### Out of scope

- Vuetify primary color overrides in any app
- Any existing screenshot under `apps/dejajs-www/public/screenshots/`
- `io/` firmware repo (no branding there)

---

## 3. Phase 2 — Sanity removal

Sanity is removed from the marketing site entirely. Every consumer becomes hardcoded.

### Files to delete

- `apps/dejajs-www/sanity/` (entire directory — schemas, queries, client, types)
- `apps/dejajs-www/sanity.cli.ts`
- `apps/dejajs-www/sanity.config.ts`
- `apps/dejajs-www/app/studio/` (the Studio route)

### Files to edit

- `apps/dejajs-www/app/layout.tsx` — stop passing Sanity-fetched settings to `<Header>`
- `apps/dejajs-www/components/Header.tsx` — remove the `settings` prop and fallback logic; the existing `defaultProducts` / `defaultGuidesLinks` / `defaultDocsLinks` arrays become the only source. Expand `defaultProducts` to include Server and IO entries.
- `apps/dejajs-www/app/sitemap.ts` — remove Sanity fetches; replace with a static list of all routes
- `apps/dejajs-www/app/page.tsx` — remove any Sanity calls, hardcode content
- `apps/dejajs-www/app/{product}/page.tsx` (all six) — remove Sanity imports, `PRODUCT_PAGE_QUERY`, try/catch fallbacks. These pages will be rewritten in Phase 3 anyway.
- Any `home/*.tsx` component that pulls from Sanity → hardcode its content
- `apps/dejajs-www/package.json` — uninstall `@sanity/*`, `next-sanity`, `sanity`, `styled-components` (if only used by Studio)
- `apps/dejajs-www/next.config.js` — remove Sanity-specific config
- `apps/dejajs-www/.env.example` — strip `SANITY_*` / `NEXT_PUBLIC_SANITY_*` vars
- `apps/dejajs-www/vercel.json` — strip Sanity env var references

### Verification

- `pnpm --filter=deja-www build` succeeds
- No `import` from `@sanity`, `next-sanity`, or local `../sanity/*` remains (grep-verified)
- `/studio` route returns 404
- Header, footer, sitemap, and home page all render with hardcoded content

---

## 4. Phase 3 — Product page rebuild

### 4.1 Building block library

Lives under `apps/dejajs-www/components/products/`. All blocks are React server components that accept typed props — no data fetching, no client state unless explicitly needed.

```
apps/dejajs-www/components/products/
├── index.ts                  # barrel export
├── types.ts                  # Product, Feature, CTA, ProductAccent interfaces
├── ProductHero.tsx           # icon + name + tagline + CTAs + hero visual slot
├── SectionHeading.tsx        # eyebrow + heading + kicker
├── FeatureGrid.tsx           # 2×2 or 3×2 grid of feature cards
├── Showcase.tsx              # two-column text/visual row, reversible
├── ScreenshotCarousel.tsx    # horizontal scroll strip with captions
├── DeviceMockup.tsx          # CSS-only phone or laptop frame around a screenshot
├── EzConsistStory.tsx        # three-step consist building walkthrough (Throttle only)
├── PlatformBreadth.tsx       # 6-tile ecosystem grid (excludes current product)
├── HardwareGallery.tsx       # photo grid with placeholder slots (IO only)
├── FreeToTryBanner.tsx       # shared "free to try" strip
└── ProductCTA.tsx            # final call-to-action strip with primary + secondary + guide link
```

Existing components reused (not rebuilt):

- `components/home/TerminalBlock.tsx` — reused on Server page for the install command
- `components/diagrams/*` — reused for Server and IO architecture diagrams

### 4.2 Shared types

```ts
// components/products/types.ts
export type ProductSlug =
  | 'throttle'
  | 'server'
  | 'cloud'
  | 'io'
  | 'monitor'
  | 'tour';

export interface ProductAccent {
  slug: ProductSlug;
  tokenClass: string;        // e.g. 'deja-throttle'
  glowClass: string;         // e.g. 'glow-throttle'
}

export interface Feature {
  icon: string;              // emoji or icon component ref
  title: string;
  description: string;
}

export interface CTAAction {
  label: string;
  href: string;
  style?: 'primary' | 'secondary' | 'ghost';
  external?: boolean;
}
```

### 4.3 Content strategy

Each page has a sibling `content.ts` file that exports typed objects. The `page.tsx` imports content and composes blocks. Copy stays separate from layout for easy editing; layout stays separate from data for easy reordering.

```
apps/dejajs-www/app/throttle/
├── page.tsx      # composes blocks, minimal logic
└── content.ts    # features, tagline, screenshots, CTAs — typed exports
```

### 4.4 Per-page composition

Each page uses a different composition of blocks to tell a different story. The order and block mix are deliberate — Throttle leads with the EZ Consist differentiator, Server leads with the install terminal, Cloud leads with sync, IO leads with hardware.

#### `/throttle`

1. `ProductHero` with `<DeviceMockup variant="phone">` containing a throttle screenshot
2. `EzConsistStory` — the three-tap consist differentiator, front and center
3. `FeatureGrid` — 4 features
4. `ScreenshotCarousel` — throttle list, conductor, routes, effects, turnouts
5. `Showcase` — "Open a URL. You're driving." (no app install)
6. `PlatformBreadth`
7. `FreeToTryBanner`
8. `ProductCTA` — primary: "Launch throttle" → `https://throttle.dejajs.com` / secondary: "Read the docs" → `/docs/throttle` / guide: `/guides/throttle`

#### `/server`

1. `ProductHero` with terminal output in hero slot
2. `TerminalBlock` — `curl -fsSL https://install.dejajs.com | bash`
3. `ArchitectureDiagram` — browser ↔ WebSocket ↔ Server ↔ Serial ↔ DCC-EX
4. `FeatureGrid` — 4 features
5. `Showcase` — "Manage it with the `deja` CLI" (terminal screenshot of `deja status`)
6. `PlatformBreadth`
7. `FreeToTryBanner`
8. `ProductCTA` — primary: "Install in 1 command" (copies curl on click) / secondary: "Read the docs" → `/docs/server` / guide: `/guides/server`

#### `/cloud`

1. `ProductHero` with dashboard screenshot
2. `FeatureGrid` — 4 features
3. `Showcase` (roster screenshot) — "A single source of truth"
4. `Showcase` reversed (effects screenshot) — "Visual management for every piece of the layout"
5. `ScreenshotCarousel` — dashboard, roster, turnouts, effects, routes, signals
6. `PlatformBreadth`
7. `FreeToTryBanner`
8. `ProductCTA` — primary: "Sign up free" → `https://cloud.dejajs.com/signup` / secondary: "Read the docs" → `/docs/cloud` / guide: `/guides/cloud`

#### `/io`

1. `ProductHero` with hardware photo placeholder
2. `FeatureGrid` — 4 features
3. `HardwareGallery` — placeholder slots for user-supplied photos
4. `ArchitectureDiagram` — IO devices ↔ MQTT ↔ Server ↔ Firebase
5. `Showcase` — "LED strips to servo turnouts. No proprietary modules."
6. `PlatformBreadth`
7. `FreeToTryBanner`
8. `ProductCTA` — primary: "See compatible hardware" → `/guides/io` / secondary: "Read the docs" → `/docs/io` / guide: `/guides/io`

#### `/monitor`

1. `ProductHero` with `<DeviceMockup variant="laptop">` containing dashboard screenshot
2. `FeatureGrid` — 4 features
3. `ScreenshotCarousel` — desktop dashboard, mobile dashboard, settings
4. `Showcase` — "Every DCC command, every sensor event, every device heartbeat"
5. `PlatformBreadth`
6. `FreeToTryBanner`
7. `ProductCTA` — primary: "Open Monitor" / secondary: "Read the docs" → `/docs/monitor` / guide: `/guides/monitor` (marked Soon if not yet published)

#### `/tour`

1. `ProductHero` with tour welcome screen screenshot
2. `FeatureGrid` — 4 features
3. `ScreenshotCarousel` — welcome, sections, area detail, effects, media
4. `Showcase` — "Turn open-house day into a guided experience"
5. `PlatformBreadth`
6. `FreeToTryBanner`
7. `ProductCTA` — primary: "Try the demo" / secondary: "Read the docs" → `/docs/tour`

---

## 5. Differentiation without naming competitors

Competitive positioning is implicit in headlines and feature copy. No comparison tables, no competitor names.

Examples of implicit differentiators (subject to the claims audit in §6):

- "Open a URL. You're driving." — vs. Java installs and sideloaded APKs
- "No roster files to import." — vs. file-based roster workflows
- "Build a consist in three taps." — vs. CV programming
- "One account, every app." — platform breadth
- "Runs on a Raspberry Pi." — accessibility, if verified

Every page uses the same `FreeToTryBanner` and `PlatformBreadth` blocks so the ecosystem story and the "free to try" message show up consistently on all six pages.

---

## 6. Claims audit (required before merge)

Every feature bullet and headline claim in every product page's `content.ts` must be cross-checked against the actual code or docs. If a claim cannot be verified, it is softened or dropped.

**Audit checklist per page** — each claim must have one of:

- a code reference proving it exists
- a link to existing docs showing the feature
- a test / screenshot that demonstrates it
- a "softened" replacement that is trivially true

**Specific claims already flagged for verification:**

| Claim | Where | Verify against |
|---|---|---|
| "Live command stream" | Monitor | `apps/monitor/src/` — is there a real-time command feed? |
| "Sensor telemetry" | Monitor | `apps/server/src/modules/sensors.ts` + monitor UI |
| "Auto-reconnects / graceful shutdown" | Server | `apps/server/src/lib/serial.ts`, `apps/server/src/dejaCloud.ts` |
| "Free to try, no trial timer" | All | `apps/dejajs-www/app/pricing/page.tsx` and actual billing config |
| "Runs on a $35 Raspberry Pi" | Server | Distribution spec — confirm `linux/arm64` is released |
| "One command install" | Server | Confirm `install.dejajs.com` script is live |
| "Mobile and desktop at the same time" | Monitor | Confirm mobile dashboard is shipped |
| "EZ Consist in three taps" | Throttle | Confirm actual consist flow has ≤ 3 steps |
| "Rich media embeds" | Tour | Confirm tour supports embedded media |
| "Timed effect sequences" | Tour | Confirm tour supports timed triggers |

Any claim that fails the audit gets rewritten to something that is obviously true. The rule is: **every word on these pages must be defensible.**

---

## 7. CTA mapping summary

| Product | Primary | Secondary | Guide |
|---|---|---|---|
| Throttle | Launch throttle.dejajs.com | `/docs/throttle` | `/guides/throttle` |
| Server | Install in 1 command (copies curl) | `/docs/server` | `/guides/server` |
| Cloud | Sign up free → cloud.dejajs.com/signup | `/docs/cloud` | `/guides/cloud` |
| IO | See compatible hardware → `/guides/io` | `/docs/io` | `/guides/io` |
| Monitor | Open Monitor | `/docs/monitor` | `/guides/monitor` (marked Soon if unpublished) |
| Tour | Try the demo | `/docs/tour` | *(none — no guide exists yet)* |

---

## 8. File change summary

### New files

```
apps/dejajs-www/components/products/
  index.ts
  types.ts
  ProductHero.tsx
  SectionHeading.tsx
  FeatureGrid.tsx
  Showcase.tsx
  ScreenshotCarousel.tsx
  DeviceMockup.tsx
  EzConsistStory.tsx
  PlatformBreadth.tsx
  HardwareGallery.tsx
  FreeToTryBanner.tsx
  ProductCTA.tsx

apps/dejajs-www/app/throttle/content.ts
apps/dejajs-www/app/server/content.ts
apps/dejajs-www/app/cloud/content.ts
apps/dejajs-www/app/io/page.tsx           # new route
apps/dejajs-www/app/io/content.ts
apps/dejajs-www/app/monitor/content.ts
apps/dejajs-www/app/tour/content.ts

apps/dejajs-www/public/server/icon-*.png  # new, user-supplied
apps/dejajs-www/public/io/icon-*.png      # new, user-supplied
```

### Modified files

```
apps/dejajs-www/styles/globals.css                         # new brand tokens + glow utilities
apps/dejajs-www/components/Header.tsx                      # hardcoded nav, Server + IO added
apps/dejajs-www/app/layout.tsx                             # drop Sanity settings fetch
apps/dejajs-www/app/sitemap.ts                             # hardcoded routes, +io route
apps/dejajs-www/app/page.tsx                               # drop Sanity calls, hardcode
apps/dejajs-www/app/{throttle,server,cloud,monitor,tour}/page.tsx  # rewrite
apps/dejajs-www/app/manifest.json                          # new theme colors
apps/dejajs-www/public/{throttle,cloud,monitor,tour}/icon-*.png  # replaced with new icons
apps/dejajs-www/package.json                               # uninstall Sanity deps
apps/dejajs-www/next.config.js                             # drop Sanity config
apps/dejajs-www/.env.example                               # strip SANITY_*
apps/dejajs-www/vercel.json                                # strip SANITY_*
apps/{throttle,cloud,monitor,tour}/public/manifest.json    # new theme_color
apps/{throttle,cloud,monitor,tour}/public/favicon.*        # new icons
apps/{throttle,cloud,monitor,tour}/public/IconKitchen-*/   # regenerated sources
apps/{throttle,cloud,monitor,tour}/index.html              # new theme-color meta
```

### Deleted files

```
apps/dejajs-www/sanity/                   # entire directory
apps/dejajs-www/sanity.cli.ts
apps/dejajs-www/sanity.config.ts
apps/dejajs-www/app/studio/               # entire directory
```

---

## 9. Open items (user-supplied before merge)

- [ ] Six product colors (hex values)
- [ ] Six product icon sets (`icon-512.png`, `icon-192.png`, `icon-192-maskable.png`, `apple-touch-icon.png` per product)
- [ ] Hardware photos for the IO page's `HardwareGallery` (Pico W boards, sensors, installed devices)
- [ ] Confirmation that `install.dejajs.com` script is live before we reference it on the Server page
- [ ] Confirmation that `throttle.dejajs.com` is the correct launch URL for the Throttle page CTA
- [ ] Confirmation of final copy for the pricing line ("Free to try" — exact wording)
- [ ] Final URL for the Monitor "Open Monitor" CTA (`https://monitor.dejajs.com`?)
- [ ] Final URL or behavior for the Tour "Try the demo" CTA (live tour URL or in-page demo?)

---

## 10. Verification plan

- `pnpm --filter=deja-www lint`
- `pnpm --filter=deja-www check-types`
- `pnpm --filter=deja-www build`
- Grep: no `@sanity`, no `next-sanity`, no `../sanity/` imports remain
- Manual smoke test:
  - Navigate to all 6 product pages, verify they render
  - Verify Header nav shows all 6 products in the right order
  - Verify `/studio` returns 404
  - Verify sitemap.xml includes all 6 product routes
  - Verify each product page's primary CTA clicks through to the right URL
  - Verify OG images load for each product page
- Visual smoke test on staging via `/stage-pr`
- Claims audit (§6) completed and tracked in-PR before merge

---

## 11. Rollout

Single PR to `preview`. Once merged, the CI staging deploy updates `staging.dejajs.com` with the new pages. After review on staging, `preview → main` PR promotes to production.

No feature flag — the new pages replace the old ones directly.
