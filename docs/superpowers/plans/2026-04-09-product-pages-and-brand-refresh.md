# Product Pages & Brand Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the six product pages on `dejajs.com` from scratch with a shared building-block library, cascade a new per-product brand-color + icon system through the monorepo, and fully remove Sanity CMS from the marketing site.

**Architecture:** Three sequential phases in a single PR. Phase A removes Sanity entirely. Phase B builds a typed component library at `components/products/` with 12 blocks. Phase C composes each of six product pages (Throttle, Server, Cloud, IO, Monitor, Tour) as a unique arrangement of those blocks with hardcoded `content.ts` sidecars. Phase D drops in the new brand tokens/icons once the user provides them.

**Tech Stack:** Next.js 15 App Router, React Server Components, Tailwind v4 (`@theme` tokens), TypeScript (strict), pnpm workspace.

**Spec reference:** `docs/superpowers/specs/2026-04-09-product-pages-and-brand-refresh-design.md`

---

## File Structure Overview

### New files (this plan creates)

```
apps/dejajs-www/
├── components/
│   └── products/
│       ├── index.ts                  # barrel export
│       ├── types.ts                  # ProductSlug, Feature, CTAAction, Product
│       ├── productAccents.ts         # slug → tailwind class lookup
│       ├── SectionHeading.tsx
│       ├── ProductHero.tsx
│       ├── FeatureGrid.tsx
│       ├── Showcase.tsx
│       ├── ScreenshotCarousel.tsx
│       ├── DeviceMockup.tsx
│       ├── EzConsistStory.tsx
│       ├── PlatformBreadth.tsx
│       ├── HardwareGallery.tsx
│       ├── FreeToTryBanner.tsx
│       └── ProductCTA.tsx
├── app/
│   ├── throttle/content.ts
│   ├── server/content.ts
│   ├── cloud/content.ts
│   ├── io/page.tsx                   # new route
│   ├── io/content.ts
│   ├── monitor/content.ts
│   └── tour/content.ts
└── public/
    ├── server/icon-512.png           # user-supplied, Phase D
    └── io/icon-512.png               # user-supplied, Phase D
```

### Modified files

```
apps/dejajs-www/
├── styles/globals.css                # new per-product tokens
├── components/Header.tsx             # hardcode nav, add Server + IO
├── components/Footer.tsx             # drop settings prop
├── app/layout.tsx                    # drop Sanity fetch
├── app/sitemap.ts                    # hardcode routes, +io
├── app/page.tsx                      # drop PromoHeroSection if Sanity-backed
├── app/{throttle,server,cloud,monitor,tour}/page.tsx  # rewrite
├── app/faq/page.tsx                  # drop Sanity fetch, keep hardcoded
├── package.json                      # uninstall Sanity deps
├── next.config.js                    # drop Sanity config if any
├── .env.example                      # strip SANITY_*
├── vercel.json                       # strip SANITY_*
└── public/{throttle,cloud,monitor,tour}/icon-*.png  # replaced Phase D

apps/{throttle,cloud,monitor,tour}/
├── public/manifest.json              # new theme_color Phase D
├── public/favicon.*                  # Phase D
├── public/IconKitchen-*/             # Phase D
└── index.html                        # theme-color meta Phase D
```

### Deleted files

```
apps/dejajs-www/sanity/                                  # whole directory
apps/dejajs-www/sanity.cli.ts
apps/dejajs-www/sanity.config.ts
apps/dejajs-www/app/studio/                              # whole directory
apps/dejajs-www/components/PromoBannerStrip.tsx          # Sanity-only component
apps/dejajs-www/components/home/PromoHeroSection.tsx     # Sanity-only component
apps/dejajs-www/lib/promotions.ts                        # Sanity promo helpers
apps/dejajs-www/scripts/seed-sanity.ts
```

---

## Phase A — Sanity Removal

Each of the tasks below is independent and can be done in order. None touches product page content yet — we just cleanse the site of Sanity so the rewrite in Phase C lands on a clean base.

---

### Task A1: Audit every Sanity import site

**Files:**
- Read-only reconnaissance

- [ ] **Step 1: Run grep to list all Sanity consumers**

```bash
cd apps/dejajs-www
```

Use Grep tool with pattern `from ['"](next-sanity|@sanity|\.\./sanity|\.\./\.\./sanity)` to verify the audit matches the expected list.

Expected consumers (27 files from initial audit):

```
scripts/seed-sanity.ts
sanity/structure.ts
sanity/schemaTypes/objects/nav-link.ts
sanity/schemaTypes/objects/feature.ts
sanity/schemaTypes/objects/cta.ts
sanity/schemaTypes/objects/carousel-item.ts
sanity/schemaTypes/documents/site-settings.ts
sanity/schemaTypes/documents/promotion.ts
sanity/schemaTypes/documents/product-page.ts
sanity/schemaTypes/documents/pricing-page.ts
sanity/schemaTypes/documents/homepage.ts
sanity/schemaTypes/documents/faq-page.ts
sanity/lib/queries.ts
sanity/lib/client.ts
sanity.config.ts
components/home/PromoHeroSection.tsx
components/PromoBannerStrip.tsx
app/tour/page.tsx
app/throttle/page.tsx
app/studio/[[...tool]]/page.tsx
app/studio/[[...tool]]/layout.tsx
app/sitemap.ts
app/server/page.tsx
app/monitor/page.tsx
app/layout.tsx
app/faq/page.tsx
app/cloud/page.tsx
```

- [ ] **Step 2: Note any new consumer not in the list**

If grep turns up additional files, add them to the list and handle in the appropriate later task.

- [ ] **Step 3: Commit nothing (read-only task)**

No commit.

---

### Task A2: Strip Sanity from `app/layout.tsx`

**Files:**
- Modify: `apps/dejajs-www/app/layout.tsx`

- [ ] **Step 1: Read the file**

Use Read tool on `apps/dejajs-www/app/layout.tsx`.

- [ ] **Step 2: Remove Sanity imports**

Delete these lines:

```ts
import { client } from '../sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '../sanity/lib/queries';
import PromoBannerStrip from '../components/PromoBannerStrip';
```

- [ ] **Step 3: Simplify RootLayout to a plain sync component**

Replace:

```ts
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let settings = null;
  try {
    if (client) settings = await client.fetch(SITE_SETTINGS_QUERY);
  } catch {
    // Fall back to hardcoded defaults in Header/Footer
  }

  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} ${dmMono.variable} ${bebasNeue.variable} font-sans bg-gray-950 text-gray-50 relative antialiased`}>
        <PromoBannerStrip />
```

With:

```ts
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} ${dmMono.variable} ${bebasNeue.variable} font-sans bg-gray-950 text-gray-50 relative antialiased`}>
```

- [ ] **Step 4: Remove `settings` prop on `<Header>` and `<Footer>`**

Change `<Header settings={settings} />` → `<Header />` and `<Footer settings={settings} />` → `<Footer />`.

- [ ] **Step 5: Verify the file compiles in isolation**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit app/layout.tsx 2>&1 | head -20
```

Expected: may show errors about `Header`/`Footer` still requiring `settings` — those are fixed in Task A3. No error about missing `client` or `SITE_SETTINGS_QUERY`.

- [ ] **Step 6: Commit**

```bash
git add apps/dejajs-www/app/layout.tsx
git commit -m "refactor(dejajs-www): drop Sanity fetch from root layout"
```

---

### Task A3: Hardcode `Header.tsx` — drop `settings` prop, add Server + IO

**Files:**
- Modify: `apps/dejajs-www/components/Header.tsx`

- [ ] **Step 1: Read the file**

Use Read tool on `apps/dejajs-www/components/Header.tsx`.

- [ ] **Step 2: Remove `SiteSettings` interface and `settings` prop**

Delete the `SiteSettings` interface (lines ~8–27). Change the component signature from:

```ts
export default function Header({ settings }: { settings?: SiteSettings | null }) {
```

to:

```ts
export default function Header() {
```

- [ ] **Step 3: Remove the `products` / `docsLinks` fallback-mapping logic**

Delete this block:

```ts
const products: ProductItem[] = settings?.productNavItems
  ? settings.productNavItems.map((item) => ({ ... }))
  : defaultProducts;

const docsLinks: DocItem[] = settings?.docsNavItems
  ? settings.docsNavItems.map((item) => ({ ... }))
  : defaultDocsLinks;

const loginUrl = settings?.loginUrl ?? 'https://cloud.dejajs.com/';
const signupUrl = settings?.signupUrl ?? 'https://cloud.dejajs.com/signup';
```

Replace with:

```ts
const products = defaultProducts;
const docsLinks = defaultDocsLinks;
const loginUrl = 'https://cloud.dejajs.com/';
const signupUrl = 'https://cloud.dejajs.com/signup';
```

- [ ] **Step 4: Update `defaultProducts` to the new 6-product nav order**

Replace the entire `defaultProducts` array with:

```ts
const defaultProducts: ProductItem[] = [
  {
    name: 'Throttle',
    desc: 'Precise speed control, consists, and function mapping.',
    logo: '/throttle/icon-512.png',
    href: '/throttle',
  },
  {
    name: 'Server',
    desc: 'Connect to your DCC-EX CommandStation via USB.',
    logo: '/server/icon-512.png',
    href: '/server',
  },
  {
    name: 'Cloud',
    desc: 'Manage roster, devices, turnouts, and effects.',
    logo: '/cloud/icon-512.png',
    href: '/cloud',
  },
  {
    name: 'IO',
    desc: 'Arduino and Pico W code for layout expansion.',
    logo: '/io/icon-512.png',
    href: '/io',
  },
  {
    name: 'Monitor',
    desc: 'Live telemetry, events, and command traces.',
    logo: '/monitor/icon-512.png',
    href: '/monitor',
  },
  {
    name: 'Tour',
    desc: 'Guided presets to automate layout sequences.',
    logo: '/tour/icon-512.png',
    href: '/tour',
  },
];
```

Note: `/server/icon-512.png` and `/io/icon-512.png` do not exist yet — they are added in Phase D. For now the Header will request a 404 for those two images, which is acceptable because the page still renders. The nav item still works.

- [ ] **Step 5: Change IO link from `/guides/io` to `/io`**

The old `defaultProducts` had `href: '/guides/io'` for IO. Confirmed new `/io` route is created in Task C6.

- [ ] **Step 6: Type-check**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit
```

Expected: no errors related to `Header.tsx` or `SiteSettings`.

- [ ] **Step 7: Commit**

```bash
git add apps/dejajs-www/components/Header.tsx
git commit -m "refactor(dejajs-www): hardcode Header nav, add Server + IO products"
```

---

### Task A4: Simplify `Footer.tsx` — drop `settings` prop

**Files:**
- Modify: `apps/dejajs-www/components/Footer.tsx`

- [ ] **Step 1: Read the file**

Use Read tool on `apps/dejajs-www/components/Footer.tsx` to see what it does with settings.

- [ ] **Step 2: Remove the `settings` prop and its consumption**

Change the component signature to drop `settings`. Hardcode any footer links that were previously driven by `settings.footerLinks` / `settings.socialLinks` using the same defaults the file already exports as fallbacks.

If the file has no Sanity-specific logic, just remove the `settings` parameter. If it has real logic, replace all `settings?.foo ?? defaultFoo` patterns with `defaultFoo`.

- [ ] **Step 3: Type-check**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit
```

Expected: no `Footer`-related errors.

- [ ] **Step 4: Commit**

```bash
git add apps/dejajs-www/components/Footer.tsx
git commit -m "refactor(dejajs-www): hardcode Footer links, drop settings prop"
```

---

### Task A5: Strip Sanity from `sitemap.ts`

**Files:**
- Modify: `apps/dejajs-www/app/sitemap.ts`

- [ ] **Step 1: Read the file**

- [ ] **Step 2: Rewrite as a pure static sitemap**

Replace the entire file with:

```ts
import type { MetadataRoute } from 'next';
import { getAllMdxFiles, getSlugFromFile } from '../lib/docs-utils';

const productSlugs = ['throttle', 'server', 'cloud', 'io', 'monitor', 'tour'];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dejajs.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const productPages: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const docsFiles = getAllMdxFiles();
  const docsPages: MetadataRoute.Sitemap = docsFiles.map((file) => {
    const slugParams = getSlugFromFile(file) || [];
    const path = slugParams.length > 0 ? '/' + slugParams.join('/') : '';
    return {
      url: `${baseUrl}/docs${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    };
  });

  return [...staticPages, ...productPages, ...docsPages];
}
```

Note: IO is now in the product list (vs. being under `/guides/io` before).

- [ ] **Step 3: Type-check**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit app/sitemap.ts 2>&1 | head
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/dejajs-www/app/sitemap.ts
git commit -m "refactor(dejajs-www): hardcode sitemap, add IO product route"
```

---

### Task A6: Strip Sanity from `app/faq/page.tsx`

**Files:**
- Modify: `apps/dejajs-www/app/faq/page.tsx`

The file already has a full `defaultSections` array with real FAQ content. We just need to remove the Sanity fetch and always use the hardcoded sections.

- [ ] **Step 1: Remove Sanity imports**

Delete:

```ts
import { client } from '../../sanity/lib/client';
import { FAQ_PAGE_QUERY } from '../../sanity/lib/queries';
```

- [ ] **Step 2: Simplify the component to a sync function**

Replace:

```ts
export default async function FAQPage() {
  let faq: any = null;
  try {
    if (client) faq = await client.fetch(FAQ_PAGE_QUERY);
  } catch {
    // Fall back to hardcoded content
  }

  const pageTitle = faq?.title || 'Frequently Asked Questions';
  const sections = faq?.sections?.length ? faq.sections : defaultSections;
```

With:

```ts
export default function FAQPage() {
  const pageTitle = 'Frequently Asked Questions';
  const sections = defaultSections;
```

- [ ] **Step 3: Remove the `any` types on `section` / `entry` params**

Since `defaultSections` is now the only source, TypeScript can infer the shape. Remove `: any` from the map callbacks. If TypeScript infers them correctly, leave them. If not, add an inline type:

```ts
type FAQSection = { _key?: string; heading: string; entries: Array<{ _key?: string; question: string; answer: string }> };
const sections: FAQSection[] = defaultSections;
```

- [ ] **Step 4: Type-check**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/dejajs-www/app/faq/page.tsx
git commit -m "refactor(dejajs-www): hardcode FAQ content, drop Sanity fetch"
```

---

### Task A7: Delete Sanity-backed promo components

**Files:**
- Delete: `apps/dejajs-www/components/PromoBannerStrip.tsx`
- Delete: `apps/dejajs-www/components/home/PromoHeroSection.tsx`
- Delete: `apps/dejajs-www/lib/promotions.ts` (if it only serves Sanity)

- [ ] **Step 1: Verify `PromoBannerStrip` is only used in `app/layout.tsx`**

Grep for `PromoBannerStrip` across the repo. If it's only imported in `app/layout.tsx` (which Task A2 already cleaned up), it's safe to delete.

- [ ] **Step 2: Verify `PromoHeroSection` is only used in `app/page.tsx`**

Grep for `PromoHeroSection`. If it's imported in `app/page.tsx`, plan to remove that import in Task A8.

- [ ] **Step 3: Check `lib/promotions.ts`**

Use Read tool. If it only exports Sanity types (`SanityPromotion`) and the `isActiveNow` helper used by the two promo components, it can be deleted. If anything else imports from it, leave it for now.

- [ ] **Step 4: Delete the files**

```bash
rm apps/dejajs-www/components/PromoBannerStrip.tsx
rm apps/dejajs-www/components/home/PromoHeroSection.tsx
```

If `lib/promotions.ts` has no other consumers:

```bash
rm apps/dejajs-www/lib/promotions.ts
```

- [ ] **Step 5: Commit**

```bash
git add -u apps/dejajs-www/components/PromoBannerStrip.tsx apps/dejajs-www/components/home/PromoHeroSection.tsx apps/dejajs-www/lib/promotions.ts
git commit -m "refactor(dejajs-www): delete Sanity-backed promo components"
```

---

### Task A8: Strip Sanity from `app/page.tsx` (home)

**Files:**
- Modify: `apps/dejajs-www/app/page.tsx`

- [ ] **Step 1: Read the file**

Use Read tool to see exactly what it imports and composes.

- [ ] **Step 2: Remove any Sanity-related imports**

Delete imports of `client`, `HOMEPAGE_QUERY`, `PromoHeroSection`, or anything from `../sanity/*`.

- [ ] **Step 3: Remove any Sanity fetches**

Replace any `await client.fetch(...)` calls with hardcoded content already available as fallbacks. If the home page was purely rendered from Sanity (unlikely given the number of components in `components/home/`), inline the content or fall back to existing `default*` exports.

- [ ] **Step 4: Remove `<PromoHeroSection />` usage**

Delete any JSX referencing it.

- [ ] **Step 5: Convert to sync component if possible**

If nothing else is `await`-ing, change `async function HomePage()` to `function HomePage()`.

- [ ] **Step 6: Type-check**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit
```

Expected: no errors related to `app/page.tsx` or removed imports.

- [ ] **Step 7: Commit**

```bash
git add apps/dejajs-www/app/page.tsx
git commit -m "refactor(dejajs-www): drop Sanity from home page"
```

---

### Task A9: Delete the Sanity directory, config, and Studio route

**Files:**
- Delete: `apps/dejajs-www/sanity/` (whole directory)
- Delete: `apps/dejajs-www/sanity.cli.ts`
- Delete: `apps/dejajs-www/sanity.config.ts`
- Delete: `apps/dejajs-www/app/studio/` (whole directory)
- Delete: `apps/dejajs-www/scripts/seed-sanity.ts`

- [ ] **Step 1: Verify no remaining imports from `sanity/`**

Grep for `from ['"]\.\./sanity` and `from ['"]\.\./\.\./sanity`. Should return zero results after Tasks A2–A8.

If anything remains, fix it before deleting.

- [ ] **Step 2: Delete**

```bash
rm -rf apps/dejajs-www/sanity
rm -f apps/dejajs-www/sanity.cli.ts
rm -f apps/dejajs-www/sanity.config.ts
rm -rf apps/dejajs-www/app/studio
rm -f apps/dejajs-www/scripts/seed-sanity.ts
```

- [ ] **Step 3: Type-check the whole app**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit
```

Expected: zero errors. If errors mention Sanity, fix the consumer.

- [ ] **Step 4: Commit**

```bash
git add -A apps/dejajs-www/sanity apps/dejajs-www/sanity.cli.ts apps/dejajs-www/sanity.config.ts apps/dejajs-www/app/studio apps/dejajs-www/scripts/seed-sanity.ts
git commit -m "refactor(dejajs-www): delete Sanity directories and Studio route"
```

---

### Task A10: Uninstall Sanity packages and strip env vars

**Files:**
- Modify: `apps/dejajs-www/package.json`
- Modify: `apps/dejajs-www/.env.example` (if it has `SANITY_*`)
- Modify: `apps/dejajs-www/vercel.json` (if it has `SANITY_*`)
- Modify: `apps/dejajs-www/next.config.js` (if it has Sanity config)

- [ ] **Step 1: Uninstall Sanity deps**

```bash
cd apps/dejajs-www && pnpm remove @sanity/client @sanity/icons @sanity/image-url @sanity/vision next-sanity sanity
```

- [ ] **Step 2: Remove the `seed` script from `package.json`**

Edit `apps/dejajs-www/package.json`. Delete the line:

```json
"seed": "npx tsx scripts/seed-sanity.ts"
```

- [ ] **Step 3: Strip `SANITY_*` env vars from `.env.example`**

Use Read tool on `.env.example`. Delete any lines matching `SANITY_PROJECT_ID`, `SANITY_DATASET`, `NEXT_PUBLIC_SANITY_*`, `SANITY_API_READ_TOKEN`, etc.

- [ ] **Step 4: Strip `SANITY_*` env vars from `vercel.json`**

Use Read tool on `vercel.json`. If it has any `SANITY_*` entries under `env` or `build.env`, delete them.

- [ ] **Step 5: Clean up `next.config.js`**

Use Read tool. If it has any Sanity-related config (e.g., image domains for `cdn.sanity.io`), remove those entries.

- [ ] **Step 6: Run full build to verify**

```bash
cd apps/dejajs-www && pnpm build
```

Expected: build succeeds. If it fails on missing `sanity` modules, there's a stray import — fix it.

- [ ] **Step 7: Commit**

```bash
git add apps/dejajs-www/package.json apps/dejajs-www/pnpm-lock.yaml apps/dejajs-www/.env.example apps/dejajs-www/vercel.json apps/dejajs-www/next.config.js
git commit -m "chore(dejajs-www): uninstall Sanity deps, strip env vars"
```

Note: Root `pnpm-lock.yaml` may also update — include it if it does.

---

### Task A11: Phase A verification

**Files:**
- Read-only verification

- [ ] **Step 1: Grep verify no Sanity imports remain**

Use Grep tool with pattern `from ['"](next-sanity|@sanity|\.\./sanity|\.\./\.\./sanity)` in `apps/dejajs-www`. Expected result: zero files.

- [ ] **Step 2: Build the app**

```bash
cd apps/dejajs-www && pnpm build
```

Expected: successful build.

- [ ] **Step 3: Start dev server and spot-check**

```bash
cd apps/dejajs-www && pnpm dev
```

In a browser, visit:
- `/` — home page renders
- `/throttle` — old page still renders (it was only stripped of Sanity, not rewritten yet)
- `/faq` — FAQ renders with all sections
- `/studio` — 404

Stop the dev server.

- [ ] **Step 4: No commit (verification only)**

---

## Phase B — Building Block Library

All blocks are React server components with typed props. No data fetching, no client state unless noted.

---

### Task B1: `components/products/types.ts`

**Files:**
- Create: `apps/dejajs-www/components/products/types.ts`

- [ ] **Step 1: Create the types file**

```ts
// components/products/types.ts

export type ProductSlug =
  | 'throttle'
  | 'server'
  | 'cloud'
  | 'io'
  | 'monitor'
  | 'tour';

export interface Feature {
  icon: string; // emoji
  title: string;
  description: string;
}

export interface CTAAction {
  label: string;
  href: string;
  style?: 'primary' | 'secondary' | 'ghost';
  external?: boolean;
}

export interface Screenshot {
  src: string;
  alt: string;
  caption?: string;
}

export interface ProductAccent {
  slug: ProductSlug;
  /** Tailwind text class, e.g. 'text-deja-throttle' */
  textClass: string;
  /** Tailwind bg class, e.g. 'bg-deja-throttle' */
  bgClass: string;
  /** Tailwind border class, e.g. 'border-deja-throttle' */
  borderClass: string;
  /** Glow utility class defined in globals.css */
  glowClass: string;
}

export interface ProductContent {
  slug: ProductSlug;
  name: string;
  icon: string; // path under /public
  tagline: string;
  heroKicker?: string;
  features: Feature[];
  ctas: {
    primary: CTAAction;
    secondary?: CTAAction;
    guide?: CTAAction;
  };
  seo: {
    title: string;
    description: string;
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/products/types.ts
git commit -m "feat(dejajs-www): add product types"
```

---

### Task B2: `components/products/productAccents.ts`

**Files:**
- Create: `apps/dejajs-www/components/products/productAccents.ts`

- [ ] **Step 1: Create the accent lookup**

```ts
// components/products/productAccents.ts
import type { ProductAccent, ProductSlug } from './types';

export const PRODUCT_ACCENTS: Record<ProductSlug, ProductAccent> = {
  throttle: {
    slug: 'throttle',
    textClass: 'text-deja-throttle',
    bgClass: 'bg-deja-throttle',
    borderClass: 'border-deja-throttle',
    glowClass: 'glow-throttle',
  },
  server: {
    slug: 'server',
    textClass: 'text-deja-server',
    bgClass: 'bg-deja-server',
    borderClass: 'border-deja-server',
    glowClass: 'glow-server',
  },
  cloud: {
    slug: 'cloud',
    textClass: 'text-deja-cloud',
    bgClass: 'bg-deja-cloud',
    borderClass: 'border-deja-cloud',
    glowClass: 'glow-cloud',
  },
  io: {
    slug: 'io',
    textClass: 'text-deja-io',
    bgClass: 'bg-deja-io',
    borderClass: 'border-deja-io',
    glowClass: 'glow-io',
  },
  monitor: {
    slug: 'monitor',
    textClass: 'text-deja-monitor',
    bgClass: 'bg-deja-monitor',
    borderClass: 'border-deja-monitor',
    glowClass: 'glow-monitor',
  },
  tour: {
    slug: 'tour',
    textClass: 'text-deja-tour',
    bgClass: 'bg-deja-tour',
    borderClass: 'border-deja-tour',
    glowClass: 'glow-tour',
  },
};

export function getAccent(slug: ProductSlug): ProductAccent {
  return PRODUCT_ACCENTS[slug];
}
```

Note: the Tailwind classes (`text-deja-throttle` etc.) don't resolve to real tokens yet — those are added in Phase D. Tailwind v4's `@theme` tokens auto-generate utilities, so they'll start working the moment the CSS tokens are added. Until then, the classes fall through to no-op, which is fine during development.

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/products/productAccents.ts
git commit -m "feat(dejajs-www): add product accent lookup"
```

---

### Task B3: `SectionHeading.tsx`

**Files:**
- Create: `apps/dejajs-www/components/products/SectionHeading.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/products/SectionHeading.tsx
interface SectionHeadingProps {
  eyebrow?: string;
  heading: string;
  kicker?: string;
  align?: 'left' | 'center';
  accentClass?: string;
}

export default function SectionHeading({
  eyebrow,
  heading,
  kicker,
  align = 'left',
  accentClass = 'text-deja-cyan',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left';
  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      {eyebrow && (
        <span className={`text-xs tracking-[0.2em] uppercase font-mono ${accentClass}`}>
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
        {heading}
      </h2>
      {kicker && (
        <p className="text-lg text-gray-400 max-w-2xl">
          {kicker}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/products/SectionHeading.tsx
git commit -m "feat(dejajs-www): add SectionHeading block"
```

---

### Task B4: `ProductHero.tsx`

**Files:**
- Create: `apps/dejajs-www/components/products/ProductHero.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/products/ProductHero.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CTAAction, ProductAccent } from './types';

interface ProductHeroProps {
  productName: string;
  icon: string;
  tagline: string;
  kicker?: string;
  accent: ProductAccent;
  primaryCta: CTAAction;
  secondaryCta?: CTAAction;
  guideCta?: CTAAction;
  heroVisual?: ReactNode;
}

export default function ProductHero({
  productName,
  icon,
  tagline,
  kicker,
  accent,
  primaryCta,
  secondaryCta,
  guideCta,
  heroVisual,
}: ProductHeroProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Image
              src={icon}
              alt={`${productName} logo`}
              width={72}
              height={72}
              className="h-16 w-16 md:h-20 md:w-20 drop-shadow-lg"
            />
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.2em] uppercase font-mono text-gray-500">
                DEJA.js
              </span>
              <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${accent.textClass}`}>
                {productName}
              </h1>
            </div>
          </div>
          {kicker && (
            <p className="text-sm font-mono tracking-widest text-gray-500 uppercase">
              {kicker}
            </p>
          )}
          <p className="text-xl md:text-2xl text-gray-300 max-w-xl leading-relaxed">
            {tagline}
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <CtaLink cta={primaryCta} accent={accent} variant="primary" />
            {secondaryCta && <CtaLink cta={secondaryCta} accent={accent} variant="secondary" />}
            {guideCta && <CtaLink cta={guideCta} accent={accent} variant="ghost" />}
          </div>
        </div>
        {heroVisual && <div className="flex justify-center">{heroVisual}</div>}
      </div>
    </section>
  );
}

function CtaLink({
  cta,
  accent,
  variant,
}: {
  cta: CTAAction;
  accent: ProductAccent;
  variant: 'primary' | 'secondary' | 'ghost';
}) {
  const base =
    'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold tracking-wide font-mono text-sm transition-colors';
  const classes =
    variant === 'primary'
      ? `${base} ${accent.bgClass} text-gray-950 hover:opacity-90 ${accent.glowClass}`
      : variant === 'secondary'
        ? `${base} border ${accent.borderClass} ${accent.textClass} hover:bg-white/5`
        : `${base} ${accent.textClass} hover:opacity-80`;

  if (cta.external) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={classes}>
        {cta.label}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={classes}>
      {cta.label}
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/products/ProductHero.tsx
git commit -m "feat(dejajs-www): add ProductHero block"
```

---

### Task B5: `FeatureGrid.tsx`

**Files:**
- Create: `apps/dejajs-www/components/products/FeatureGrid.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/products/FeatureGrid.tsx
import SectionHeading from './SectionHeading';
import type { Feature, ProductAccent } from './types';

interface FeatureGridProps {
  eyebrow?: string;
  heading?: string;
  kicker?: string;
  features: Feature[];
  accent: ProductAccent;
  columns?: 2 | 3;
}

export default function FeatureGrid({
  eyebrow = 'Capabilities',
  heading = 'Core capabilities',
  kicker,
  features,
  accent,
  columns = 2,
}: FeatureGridProps) {
  const gridClass = columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading eyebrow={eyebrow} heading={heading} kicker={kicker} accentClass={accent.textClass} />
        <div className={`grid grid-cols-1 ${gridClass} gap-8`}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 hover:border-slate-700 transition-colors"
            >
              <div className={`text-3xl mb-3 ${accent.textClass}`}>{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/products/FeatureGrid.tsx
git commit -m "feat(dejajs-www): add FeatureGrid block"
```

---

### Task B6: `Showcase.tsx`

**Files:**
- Create: `apps/dejajs-www/components/products/Showcase.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/products/Showcase.tsx
import type { ReactNode } from 'react';
import type { ProductAccent } from './types';

interface ShowcaseProps {
  eyebrow?: string;
  heading: string;
  body: string | ReactNode;
  visual: ReactNode;
  reversed?: boolean;
  accent: ProductAccent;
  bullets?: string[];
}

export default function Showcase({
  eyebrow,
  heading,
  body,
  visual,
  reversed = false,
  accent,
  bullets,
}: ShowcaseProps) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${reversed ? 'md:[&>*:first-child]:order-2' : ''}`}
        >
          <div className="space-y-4">
            {eyebrow && (
              <span className={`text-xs tracking-[0.2em] uppercase font-mono ${accent.textClass}`}>
                {eyebrow}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{heading}</h2>
            {typeof body === 'string' ? (
              <p className="text-gray-400 text-lg leading-relaxed">{body}</p>
            ) : (
              body
            )}
            {bullets && (
              <ul className="space-y-2 mt-2 text-gray-400 list-disc list-inside">
                {bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-center">{visual}</div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/products/Showcase.tsx
git commit -m "feat(dejajs-www): add Showcase block"
```

---

### Task B7: `ScreenshotCarousel.tsx`

**Files:**
- Create: `apps/dejajs-www/components/products/ScreenshotCarousel.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/products/ScreenshotCarousel.tsx
import Image from 'next/image';
import type { ProductAccent, Screenshot } from './types';
import SectionHeading from './SectionHeading';

interface ScreenshotCarouselProps {
  eyebrow?: string;
  heading: string;
  kicker?: string;
  screenshots: Screenshot[];
  accent: ProductAccent;
  aspectRatio?: 'desktop' | 'mobile';
}

export default function ScreenshotCarousel({
  eyebrow = 'Screens',
  heading,
  kicker,
  screenshots,
  accent,
  aspectRatio = 'desktop',
}: ScreenshotCarouselProps) {
  const dimensions = aspectRatio === 'mobile' ? { w: 320, h: 640 } : { w: 800, h: 500 };
  const frameClass =
    aspectRatio === 'mobile'
      ? 'w-[260px] md:w-[300px] h-auto'
      : 'w-[640px] md:w-[760px] h-auto';

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeading eyebrow={eyebrow} heading={heading} kicker={kicker} accentClass={accent.textClass} />
        <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 min-w-min">
            {screenshots.map((shot, i) => (
              <figure key={i} className="flex-shrink-0 flex flex-col gap-3">
                <div
                  className={`rounded-xl bg-slate-900 border border-slate-800 p-2 shadow-lg ${frameClass}`}
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={dimensions.w}
                    height={dimensions.h}
                    className="rounded-lg w-full h-auto"
                  />
                </div>
                {shot.caption && (
                  <figcaption className="text-sm text-gray-500 text-center max-w-[300px] mx-auto">
                    {shot.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/products/ScreenshotCarousel.tsx
git commit -m "feat(dejajs-www): add ScreenshotCarousel block"
```

---

### Task B8: `DeviceMockup.tsx`

**Files:**
- Create: `apps/dejajs-www/components/products/DeviceMockup.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/products/DeviceMockup.tsx
import Image from 'next/image';

interface DeviceMockupProps {
  variant: 'phone' | 'laptop';
  src: string;
  alt: string;
}

export default function DeviceMockup({ variant, src, alt }: DeviceMockupProps) {
  if (variant === 'phone') {
    return (
      <div className="relative w-[280px] md:w-[320px] aspect-[9/19] rounded-[3rem] bg-slate-900 border-[8px] border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-slate-950 z-10" />
        <Image
          src={src}
          alt={alt}
          width={320}
          height={640}
          className="w-full h-full object-cover object-top"
        />
      </div>
    );
  }
  return (
    <div className="relative w-full max-w-[700px]">
      <div className="rounded-t-2xl bg-slate-900 border-[6px] border-slate-800 border-b-0 overflow-hidden aspect-[16/10]">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={500}
          className="w-full h-full object-cover object-top"
        />
      </div>
      <div className="h-3 bg-slate-800 rounded-b-lg w-[110%] -ml-[5%] shadow-lg" />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/products/DeviceMockup.tsx
git commit -m "feat(dejajs-www): add DeviceMockup block"
```

---

### Task B9: `EzConsistStory.tsx`

**Files:**
- Create: `apps/dejajs-www/components/products/EzConsistStory.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/products/EzConsistStory.tsx
import type { ProductAccent } from './types';
import SectionHeading from './SectionHeading';

interface EzConsistStep {
  number: string;
  title: string;
  description: string;
}

interface EzConsistStoryProps {
  accent: ProductAccent;
  steps?: EzConsistStep[];
}

const defaultSteps: EzConsistStep[] = [
  {
    number: '01',
    title: 'Pick your locomotives',
    description: 'Tap the locomotives you want to run together. They light up in your consist color.',
  },
  {
    number: '02',
    title: 'Choose the lead',
    description: 'Tap to set the lead loco and flip orientation on any unit with one tap.',
  },
  {
    number: '03',
    title: 'Drive as one',
    description: 'Hit go. Every loco in the consist responds in lockstep — no CV programming required.',
  },
];

export default function EzConsistStory({ accent, steps = defaultSteps }: EzConsistStoryProps) {
  return (
    <section className="py-20 bg-slate-950/60 border-y border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionHeading
          eyebrow="EZ Consist"
          heading="Build a consist in three taps."
          kicker="No decoder programming. No address math. Pick, lead, drive."
          accentClass={accent.textClass}
          align="center"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-8 flex flex-col gap-3"
            >
              <span
                className={`text-5xl font-mono font-bold opacity-30 ${accent.textClass}`}
              >
                {step.number}
              </span>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/products/EzConsistStory.tsx
git commit -m "feat(dejajs-www): add EzConsistStory block"
```

---

### Task B10: `PlatformBreadth.tsx`

**Files:**
- Create: `apps/dejajs-www/components/products/PlatformBreadth.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/products/PlatformBreadth.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { ProductSlug } from './types';
import SectionHeading from './SectionHeading';

interface PlatformProduct {
  slug: ProductSlug;
  name: string;
  tagline: string;
  icon: string;
  href: string;
}

const ALL_PRODUCTS: PlatformProduct[] = [
  { slug: 'throttle', name: 'Throttle', tagline: 'Drive from any phone', icon: '/throttle/icon-512.png', href: '/throttle' },
  { slug: 'server',   name: 'Server',   tagline: 'Bridge to DCC-EX',     icon: '/server/icon-512.png',   href: '/server' },
  { slug: 'cloud',    name: 'Cloud',    tagline: 'Roster & layouts',     icon: '/cloud/icon-512.png',    href: '/cloud' },
  { slug: 'io',       name: 'IO',       tagline: 'Expand with hardware', icon: '/io/icon-512.png',       href: '/io' },
  { slug: 'monitor',  name: 'Monitor',  tagline: 'Live diagnostics',     icon: '/monitor/icon-512.png',  href: '/monitor' },
  { slug: 'tour',     name: 'Tour',     tagline: 'Guided showcases',     icon: '/tour/icon-512.png',     href: '/tour' },
];

interface PlatformBreadthProps {
  currentSlug: ProductSlug;
}

export default function PlatformBreadth({ currentSlug }: PlatformBreadthProps) {
  const products = ALL_PRODUCTS.filter((p) => p.slug !== currentSlug);
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          eyebrow="One platform"
          heading="One account. Every app."
          kicker="DEJA.js isn't a single tool — it's an open platform for driving, managing, and expanding your layout."
          align="center"
        />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={product.href}
              className="group flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 hover:bg-slate-900/80 transition-colors"
            >
              <Image
                src={product.icon}
                alt={`${product.name} icon`}
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <div className="text-center">
                <div className="font-bold text-white text-sm">{product.name}</div>
                <div className="text-xs text-gray-500 mt-1">{product.tagline}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/products/PlatformBreadth.tsx
git commit -m "feat(dejajs-www): add PlatformBreadth block"
```

---

### Task B11: `HardwareGallery.tsx`

**Files:**
- Create: `apps/dejajs-www/components/products/HardwareGallery.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/products/HardwareGallery.tsx
import Image from 'next/image';
import type { ProductAccent } from './types';
import SectionHeading from './SectionHeading';

interface HardwarePhoto {
  src?: string;
  alt: string;
  caption?: string;
}

interface HardwareGalleryProps {
  accent: ProductAccent;
  photos: HardwarePhoto[];
  heading?: string;
  kicker?: string;
}

export default function HardwareGallery({
  accent,
  photos,
  heading = 'Open hardware, end to end',
  kicker = 'Wire it yourself or drop in one of these. Every device speaks MQTT directly to your server.',
}: HardwareGalleryProps) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading eyebrow="Hardware" heading={heading} kicker={kicker} accentClass={accent.textClass} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, i) => (
            <figure
              key={i}
              className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col"
            >
              {photo.src ? (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-gray-600 text-sm font-mono">
                  📸 photo slot: {photo.alt}
                </div>
              )}
              {photo.caption && (
                <figcaption className="p-4 text-sm text-gray-400">{photo.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/products/HardwareGallery.tsx
git commit -m "feat(dejajs-www): add HardwareGallery block"
```

---

### Task B12: `FreeToTryBanner.tsx`

**Files:**
- Create: `apps/dejajs-www/components/products/FreeToTryBanner.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/products/FreeToTryBanner.tsx
import Link from 'next/link';

export default function FreeToTryBanner() {
  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-deja-lime/30 bg-gradient-to-r from-deja-lime/5 to-deja-cyan/5 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Free to try. No trial timer.
            </h3>
            <p className="text-gray-400 mt-2">
              Spin up DEJA.js on your layout today — no credit card, no download for the web apps.
            </p>
          </div>
          <Link
            href="https://cloud.dejajs.com/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-deja-lime text-gray-950 font-bold font-mono text-sm tracking-wide glow-lime hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Create an account
          </Link>
        </div>
      </div>
    </section>
  );
}
```

Note: "Free to try. No trial timer." is flagged in the claims audit. If the pricing page shows a paid-only model, this wording is softened in Task D2's claims audit step.

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/products/FreeToTryBanner.tsx
git commit -m "feat(dejajs-www): add FreeToTryBanner block"
```

---

### Task B13: `ProductCTA.tsx`

**Files:**
- Create: `apps/dejajs-www/components/products/ProductCTA.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/products/ProductCTA.tsx
import Link from 'next/link';
import type { CTAAction, ProductAccent } from './types';

interface ProductCTAProps {
  heading: string;
  subheading?: string;
  accent: ProductAccent;
  primary: CTAAction;
  secondary?: CTAAction;
  guide?: CTAAction;
}

export default function ProductCTA({
  heading,
  subheading,
  accent,
  primary,
  secondary,
  guide,
}: ProductCTAProps) {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
        <h2 className={`text-4xl md:text-5xl font-bold tracking-tight ${accent.textClass}`}>
          {heading}
        </h2>
        {subheading && <p className="text-xl text-gray-400 max-w-2xl">{subheading}</p>}
        <div className="flex flex-wrap justify-center gap-3">
          <CtaButton cta={primary} accent={accent} variant="primary" />
          {secondary && <CtaButton cta={secondary} accent={accent} variant="secondary" />}
          {guide && <CtaButton cta={guide} accent={accent} variant="ghost" />}
        </div>
      </div>
    </section>
  );
}

function CtaButton({
  cta,
  accent,
  variant,
}: {
  cta: CTAAction;
  accent: ProductAccent;
  variant: 'primary' | 'secondary' | 'ghost';
}) {
  const base =
    'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold tracking-wide font-mono text-sm transition-colors';
  const classes =
    variant === 'primary'
      ? `${base} ${accent.bgClass} text-gray-950 hover:opacity-90 ${accent.glowClass}`
      : variant === 'secondary'
        ? `${base} border ${accent.borderClass} ${accent.textClass} hover:bg-white/5`
        : `${base} ${accent.textClass} hover:opacity-80`;
  if (cta.external) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={classes}>
        {cta.label}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={classes}>
      {cta.label}
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/products/ProductCTA.tsx
git commit -m "feat(dejajs-www): add ProductCTA block"
```

---

### Task B14: Barrel export

**Files:**
- Create: `apps/dejajs-www/components/products/index.ts`

- [ ] **Step 1: Create the index**

```ts
// components/products/index.ts
export { default as SectionHeading } from './SectionHeading';
export { default as ProductHero } from './ProductHero';
export { default as FeatureGrid } from './FeatureGrid';
export { default as Showcase } from './Showcase';
export { default as ScreenshotCarousel } from './ScreenshotCarousel';
export { default as DeviceMockup } from './DeviceMockup';
export { default as EzConsistStory } from './EzConsistStory';
export { default as PlatformBreadth } from './PlatformBreadth';
export { default as HardwareGallery } from './HardwareGallery';
export { default as FreeToTryBanner } from './FreeToTryBanner';
export { default as ProductCTA } from './ProductCTA';
export { getAccent, PRODUCT_ACCENTS } from './productAccents';
export type {
  ProductSlug,
  Feature,
  CTAAction,
  Screenshot,
  ProductAccent,
  ProductContent,
} from './types';
```

- [ ] **Step 2: Type-check the block library**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/dejajs-www/components/products/index.ts
git commit -m "feat(dejajs-www): add products block library barrel"
```

---

## Phase C — Product Page Rewrites

Each page has a `content.ts` sidecar and a `page.tsx` that composes blocks. Claim accuracy is enforced in Task D2's audit.

---

### Task C1: Throttle page rewrite

**Files:**
- Create: `apps/dejajs-www/app/throttle/content.ts`
- Modify: `apps/dejajs-www/app/throttle/page.tsx`

- [ ] **Step 1: Create `content.ts`**

```ts
// app/throttle/content.ts
import type { ProductContent, Screenshot } from '../../components/products/types';

export const throttleContent: ProductContent = {
  slug: 'throttle',
  name: 'Throttle',
  icon: '/throttle/icon-512.png',
  tagline:
    'The throttle that fits in your pocket. Touch-first, instant, and designed for real operating sessions.',
  heroKicker: 'Drive on any phone, tablet, or laptop',
  features: [
    {
      icon: '🎚️',
      title: 'Precision speed control',
      description:
        'Smooth sliders plus exact ±1 step modifiers. Visual feedback confirms every speed change instantly.',
    },
    {
      icon: '🔗',
      title: 'EZ Consist',
      description:
        'Build a consist in three taps: pick locos, choose a lead, drive them as one. No CV programming.',
    },
    {
      icon: '🎛️',
      title: 'Function mapping',
      description:
        'Function buttons map dynamically from your roster. Color-code lights, horns, and bells for instant recognition.',
    },
    {
      icon: '🔀',
      title: 'Turnouts & routes at the throttle',
      description:
        'Throw switches and trigger routes without leaving the throttle view. Your whole layout is one tap away.',
    },
  ],
  ctas: {
    primary: {
      label: 'Launch throttle.dejajs.com',
      href: 'https://throttle.dejajs.com',
      external: true,
      style: 'primary',
    },
    secondary: {
      label: 'Read the docs',
      href: '/docs/throttle',
      style: 'secondary',
    },
    guide: {
      label: 'Follow the guide',
      href: '/guides/throttle',
      style: 'ghost',
    },
  },
  seo: {
    title: 'DEJA.js Throttle — Precision Mobile Control for DCC-EX',
    description:
      'Touch-first throttle app for DCC-EX layouts. EZ Consist, function mapping, turnouts & routes, and nothing to install — just open a URL.',
  },
};

export const throttleScreenshots: Screenshot[] = [
  { src: '/screenshots/throttle_desktop_throttle-list.png', alt: 'Throttle list view', caption: 'Multi-throttle control, one screen' },
  { src: '/screenshots/throttle_desktop_throttle.png',      alt: 'Single throttle view', caption: 'Speed, functions, direction' },
  { src: '/screenshots/throttle_desktop_conductor.png',     alt: 'Conductor view',       caption: 'Switch between throttles fast' },
  { src: '/screenshots/throttle_desktop_routes.png',        alt: 'Routes view',          caption: 'Trigger preset routes' },
  { src: '/screenshots/throttle_desktop_turnouts.png',      alt: 'Turnouts view',        caption: 'Throw switches from anywhere' },
  { src: '/screenshots/throttle_desktop_effects.png',       alt: 'Effects view',         caption: 'Fire sounds and lights' },
];
```

- [ ] **Step 2: Rewrite `page.tsx`**

Replace the entire file with:

```tsx
// app/throttle/page.tsx
import type { Metadata } from 'next';
import {
  ProductHero,
  FeatureGrid,
  Showcase,
  ScreenshotCarousel,
  DeviceMockup,
  EzConsistStory,
  PlatformBreadth,
  FreeToTryBanner,
  ProductCTA,
  getAccent,
} from '../../components/products';
import { throttleContent, throttleScreenshots } from './content';

const accent = getAccent('throttle');

export const metadata: Metadata = {
  title: throttleContent.seo.title,
  description: throttleContent.seo.description,
  openGraph: {
    title: throttleContent.seo.title,
    description: throttleContent.seo.description,
    url: 'https://dejajs.com/throttle',
    images: [{ url: throttleContent.icon, width: 512, height: 512, alt: 'DEJA.js Throttle' }],
  },
};

export default function ThrottlePage() {
  return (
    <>
      <ProductHero
        productName={throttleContent.name}
        icon={throttleContent.icon}
        tagline={throttleContent.tagline}
        kicker={throttleContent.heroKicker}
        accent={accent}
        primaryCta={throttleContent.ctas.primary}
        secondaryCta={throttleContent.ctas.secondary}
        guideCta={throttleContent.ctas.guide}
        heroVisual={
          <DeviceMockup
            variant="phone"
            src="/screenshots/throttle_mobile_throttle.png"
            alt="Throttle running on a phone"
          />
        }
      />

      <EzConsistStory accent={accent} />

      <FeatureGrid
        eyebrow="Capabilities"
        heading="Built for operating sessions"
        features={throttleContent.features}
        accent={accent}
      />

      <ScreenshotCarousel
        eyebrow="Screens"
        heading="Every view designed for real operators"
        screenshots={throttleScreenshots}
        accent={accent}
      />

      <Showcase
        eyebrow="Zero install"
        heading="Open a URL. You're driving."
        body="No app store review. No sideloaded APKs. No Java install. Throttle is a web app, so every phone, tablet, and laptop on your network is ready to drive the moment you share the link."
        visual={
          <DeviceMockup
            variant="phone"
            src="/screenshots/throttle_mobile_home.png"
            alt="Throttle home screen on a phone"
          />
        }
        accent={accent}
        bullets={[
          'Runs on iOS, Android, and every modern browser',
          'High-contrast UI built for layout-room lighting',
          'Large touch targets you can hit without looking',
        ]}
      />

      <PlatformBreadth currentSlug="throttle" />

      <FreeToTryBanner />

      <ProductCTA
        heading="Start driving in under a minute."
        subheading="No install. No configuration. Just open the link on your phone."
        accent={accent}
        primary={throttleContent.ctas.primary}
        secondary={throttleContent.ctas.secondary}
        guide={throttleContent.ctas.guide}
      />
    </>
  );
}
```

- [ ] **Step 3: Type-check and verify the page loads**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit && pnpm dev
```

Visit `http://localhost:3051/throttle`. Expect: page renders with all sections. Colors may be missing (`text-deja-throttle` not yet defined) — that's fine until Phase D. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add apps/dejajs-www/app/throttle/content.ts apps/dejajs-www/app/throttle/page.tsx
git commit -m "feat(dejajs-www): rewrite Throttle product page"
```

---

### Task C2: Server page rewrite

**Files:**
- Create: `apps/dejajs-www/app/server/content.ts`
- Modify: `apps/dejajs-www/app/server/page.tsx`

- [ ] **Step 1: Create `content.ts`**

```ts
// app/server/content.ts
import type { ProductContent } from '../../components/products/types';

export const serverContent: ProductContent = {
  slug: 'server',
  name: 'Server',
  icon: '/server/icon-512.png',
  tagline:
    'The quiet bridge between your browser and your DCC-EX CommandStation. Runs on Mac, Linux, and Raspberry Pi.',
  heroKicker: 'One install command. Runs anywhere.',
  features: [
    {
      icon: '⚡',
      title: 'Single-command install',
      description:
        'Paste one curl command and DEJA.js Server is running. No Docker, no Python virtualenv, no yak to shave.',
    },
    {
      icon: '🖥️',
      title: 'Mac, Linux, and Raspberry Pi',
      description:
        'Runs natively on macOS, Linux, and a $35 Raspberry Pi. Plug in USB, start the server, start driving.',
    },
    {
      icon: '🔌',
      title: 'WebSocket + MQTT + Firebase',
      description:
        'Bridges your browser, your layout devices, and your cloud roster over the right protocol for each job.',
    },
    {
      icon: '🛡️',
      title: 'Managed with the deja CLI',
      description:
        'Start, stop, update, and inspect your server with a single `deja` command. PID files and graceful shutdown built in.',
    },
  ],
  ctas: {
    primary: {
      label: 'Install in 1 command',
      href: '/docs/server#install',
      style: 'primary',
    },
    secondary: {
      label: 'Read the docs',
      href: '/docs/server',
      style: 'secondary',
    },
    guide: {
      label: 'Follow the guide',
      href: '/guides/server',
      style: 'ghost',
    },
  },
  seo: {
    title: 'DEJA.js Server — One Command to Bridge Browser and DCC-EX',
    description:
      'A lightweight Node.js bridge between your browser and your DCC-EX CommandStation. Runs on Mac, Linux, or Raspberry Pi, installed with one command.',
  },
};

export const serverInstallCommand = 'curl -fsSL https://install.dejajs.com | bash';
```

- [ ] **Step 2: Rewrite `page.tsx`**

```tsx
// app/server/page.tsx
import type { Metadata } from 'next';
import {
  ProductHero,
  FeatureGrid,
  Showcase,
  PlatformBreadth,
  FreeToTryBanner,
  ProductCTA,
  getAccent,
} from '../../components/products';
import TerminalBlock from '../../components/home/TerminalBlock';
import { serverContent, serverInstallCommand } from './content';

const accent = getAccent('server');

export const metadata: Metadata = {
  title: serverContent.seo.title,
  description: serverContent.seo.description,
  openGraph: {
    title: serverContent.seo.title,
    description: serverContent.seo.description,
    url: 'https://dejajs.com/server',
    images: [{ url: serverContent.icon, width: 512, height: 512, alt: 'DEJA.js Server' }],
  },
};

export default function ServerPage() {
  return (
    <>
      <ProductHero
        productName={serverContent.name}
        icon={serverContent.icon}
        tagline={serverContent.tagline}
        kicker={serverContent.heroKicker}
        accent={accent}
        primaryCta={serverContent.ctas.primary}
        secondaryCta={serverContent.ctas.secondary}
        guideCta={serverContent.ctas.guide}
        heroVisual={
          <div className="w-full max-w-lg">
            <TerminalBlock command={serverInstallCommand} />
          </div>
        }
      />

      <FeatureGrid
        eyebrow="Capabilities"
        heading="Small footprint. Big responsibilities."
        features={serverContent.features}
        accent={accent}
      />

      <Showcase
        eyebrow="Install"
        heading="One command. Running in seconds."
        body="DEJA.js Server installs into ~/.deja/ as a single self-contained Node.js process. No Docker, no system-level packages, and nothing you need sudo to remove."
        visual={<TerminalBlock command={serverInstallCommand} />}
        accent={accent}
        bullets={[
          'Installs under ~/.deja/ with no root access',
          'Auto-detects your DCC-EX serial port',
          'Managed with the `deja` CLI — start, stop, status, update',
        ]}
      />

      <Showcase
        eyebrow="Architecture"
        heading="The thinnest bridge we could build."
        body="Your browser talks WebSockets to the server. The server talks serial to DCC-EX, MQTT to your IO devices, and Firebase to your cloud roster. That's it. No proprietary protocols. No lock-in."
        visual={
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm font-mono text-gray-400 leading-relaxed">
            <pre>{`browser ──WebSocket──▶ server
                        ├─Serial──▶ DCC-EX CommandStation
                        ├─MQTT────▶ IO devices
                        └─Firebase▶ DEJA Cloud`}</pre>
          </div>
        }
        accent={accent}
        reversed
      />

      <PlatformBreadth currentSlug="server" />

      <FreeToTryBanner />

      <ProductCTA
        heading="Bridge your layout to the browser in under a minute."
        subheading="Paste the install command. Plug in USB. You're live."
        accent={accent}
        primary={serverContent.ctas.primary}
        secondary={serverContent.ctas.secondary}
        guide={serverContent.ctas.guide}
      />
    </>
  );
}
```

Note: This task assumes `TerminalBlock` accepts a `command` prop. If the existing component has a different signature, adapt the call to match.

- [ ] **Step 3: Check `TerminalBlock` prop signature**

Use Read tool on `apps/dejajs-www/components/home/TerminalBlock.tsx`. If the signature is different, adapt the two `<TerminalBlock>` calls above.

- [ ] **Step 4: Type-check and verify**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add apps/dejajs-www/app/server/content.ts apps/dejajs-www/app/server/page.tsx
git commit -m "feat(dejajs-www): rewrite Server product page"
```

---

### Task C3: Cloud page rewrite

**Files:**
- Create: `apps/dejajs-www/app/cloud/content.ts`
- Modify: `apps/dejajs-www/app/cloud/page.tsx`

- [ ] **Step 1: Create `content.ts`**

```ts
// app/cloud/content.ts
import type { ProductContent, Screenshot } from '../../components/products/types';

export const cloudContent: ProductContent = {
  slug: 'cloud',
  name: 'Cloud',
  icon: '/cloud/icon-512.png',
  tagline:
    'Your roster, turnouts, effects, and devices — live-synced across every phone, tablet, and laptop in the room.',
  heroKicker: 'The hub for your whole layout',
  features: [
    {
      icon: '🔄',
      title: 'Live multi-device sync',
      description:
        'Rename a loco on your laptop and every throttle in the room updates instantly. No file imports, no CSV syncs.',
    },
    {
      icon: '🎨',
      title: 'Color-coded everything',
      description:
        'Pick a color for a loco, turnout, or effect in Cloud and that color follows the item into Throttle and Monitor. 🚦',
    },
    {
      icon: '🔐',
      title: 'Secure device identity',
      description:
        'Manage your connected hardware with per-device session tokens. Authorize throttles, revoke old clients, keep strangers off your track.',
    },
    {
      icon: '🌐',
      title: 'Multiple layout spaces',
      description:
        'Run your home layout, your club layout, and a test bench from one account. Switch between them in one tap.',
    },
  ],
  ctas: {
    primary: {
      label: 'Sign up free',
      href: 'https://cloud.dejajs.com/signup',
      external: true,
      style: 'primary',
    },
    secondary: {
      label: 'Read the docs',
      href: '/docs/cloud',
      style: 'secondary',
    },
    guide: {
      label: 'Follow the guide',
      href: '/guides/cloud',
      style: 'ghost',
    },
  },
  seo: {
    title: 'DEJA.js Cloud — Your Layout, Everywhere',
    description:
      'Centralized roster, turnouts, effects, and device management for DCC-EX layouts. Live sync across every throttle in the room.',
  },
};

export const cloudScreenshots: Screenshot[] = [
  { src: '/screenshots/cloud_desktop_dashboard.png', alt: 'Cloud dashboard',  caption: 'Your layout at a glance' },
  { src: '/screenshots/cloud_desktop_roster.png',    alt: 'Loco roster',      caption: 'Roster with color coding' },
  { src: '/screenshots/cloud_desktop_turnouts.png',  alt: 'Turnout config',   caption: 'Visual turnout management' },
  { src: '/screenshots/cloud_desktop_effects.png',   alt: 'Effects manager',  caption: 'Effects and sounds' },
  { src: '/screenshots/cloud_desktop_routes.png',    alt: 'Routes manager',   caption: 'Preset routes' },
  { src: '/screenshots/cloud_desktop_signals.png',   alt: 'Signals manager',  caption: 'Signal state control' },
];
```

- [ ] **Step 2: Rewrite `page.tsx`**

```tsx
// app/cloud/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import {
  ProductHero,
  FeatureGrid,
  Showcase,
  ScreenshotCarousel,
  PlatformBreadth,
  FreeToTryBanner,
  ProductCTA,
  getAccent,
} from '../../components/products';
import { cloudContent, cloudScreenshots } from './content';

const accent = getAccent('cloud');

export const metadata: Metadata = {
  title: cloudContent.seo.title,
  description: cloudContent.seo.description,
  openGraph: {
    title: cloudContent.seo.title,
    description: cloudContent.seo.description,
    url: 'https://dejajs.com/cloud',
    images: [{ url: cloudContent.icon, width: 512, height: 512, alt: 'DEJA.js Cloud' }],
  },
};

export default function CloudPage() {
  return (
    <>
      <ProductHero
        productName={cloudContent.name}
        icon={cloudContent.icon}
        tagline={cloudContent.tagline}
        kicker={cloudContent.heroKicker}
        accent={accent}
        primaryCta={cloudContent.ctas.primary}
        secondaryCta={cloudContent.ctas.secondary}
        guideCta={cloudContent.ctas.guide}
        heroVisual={
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-2 shadow-2xl max-w-xl">
            <Image
              src="/screenshots/cloud_desktop_dashboard.png"
              alt="Cloud dashboard"
              width={800}
              height={500}
              className="rounded-lg w-full h-auto"
            />
          </div>
        }
      />

      <FeatureGrid
        eyebrow="Capabilities"
        heading="A single source of truth"
        features={cloudContent.features}
        accent={accent}
      />

      <Showcase
        eyebrow="Roster"
        heading="No roster files to import."
        body="Add a loco in Cloud and every throttle in your layout sees it before you can lift your finger. No CSV exports, no file sync, no hunting for the right version."
        visual={
          <Image
            src="/screenshots/cloud_desktop_roster.png"
            alt="Cloud roster"
            width={800}
            height={500}
            className="rounded-xl border border-slate-800 shadow-lg w-full h-auto"
          />
        }
        accent={accent}
      />

      <Showcase
        eyebrow="Effects"
        heading="Visual management for every piece of the layout."
        body="Turnouts, effects, signals, and routes all live in the same clean UI. Color-code what you want. Group what you want. Drive from any device."
        visual={
          <Image
            src="/screenshots/cloud_desktop_effects.png"
            alt="Cloud effects manager"
            width={800}
            height={500}
            className="rounded-xl border border-slate-800 shadow-lg w-full h-auto"
          />
        }
        accent={accent}
        reversed
      />

      <ScreenshotCarousel
        heading="Every piece of your layout, one place."
        screenshots={cloudScreenshots}
        accent={accent}
      />

      <PlatformBreadth currentSlug="cloud" />

      <FreeToTryBanner />

      <ProductCTA
        heading="Your layout. Everywhere."
        subheading="Create an account, add a loco, and every throttle in the room syncs instantly."
        accent={accent}
        primary={cloudContent.ctas.primary}
        secondary={cloudContent.ctas.secondary}
        guide={cloudContent.ctas.guide}
      />
    </>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add apps/dejajs-www/app/cloud/content.ts apps/dejajs-www/app/cloud/page.tsx
git commit -m "feat(dejajs-www): rewrite Cloud product page"
```

---

### Task C4: Monitor page rewrite

**Files:**
- Create: `apps/dejajs-www/app/monitor/content.ts`
- Modify: `apps/dejajs-www/app/monitor/page.tsx`

- [ ] **Step 1: Create `content.ts`**

```ts
// app/monitor/content.ts
import type { ProductContent, Screenshot } from '../../components/products/types';

export const monitorContent: ProductContent = {
  slug: 'monitor',
  name: 'Monitor',
  icon: '/monitor/icon-512.png',
  tagline:
    'See what your layout is doing, live. Command traces, device health, and sensor events on every screen.',
  heroKicker: 'Debug your layout, not your toolchain',
  features: [
    {
      icon: '📡',
      title: 'Live command stream',
      description:
        'Every DCC command flows through Monitor in real time. Debug a misbehaving decoder without guessing.',
    },
    {
      icon: '🛰️',
      title: 'Device health',
      description:
        'See which devices are connected, which are silent, and which are producing errors — at a glance.',
    },
    {
      icon: '📱',
      title: 'Mobile and desktop dashboards',
      description:
        'Keep Monitor open on your phone while you drive. Full dashboard on the desktop for deeper diagnostics.',
    },
    {
      icon: '🔎',
      title: 'Event traces',
      description:
        'Scroll back through recent events to see exactly what your layout was doing when something went wrong.',
    },
  ],
  ctas: {
    primary: {
      label: 'Open Monitor',
      href: 'https://monitor.dejajs.com',
      external: true,
      style: 'primary',
    },
    secondary: {
      label: 'Read the docs',
      href: '/docs/monitor',
      style: 'secondary',
    },
  },
  seo: {
    title: 'DEJA.js Monitor — See Your Layout, Live',
    description:
      'Live diagnostics for your DCC-EX layout. Command traces, device health, and event streams on every screen.',
  },
};

export const monitorScreenshots: Screenshot[] = [
  { src: '/screenshots/monitor_desktop_dashboard.png', alt: 'Monitor desktop dashboard', caption: 'Desktop dashboard' },
  { src: '/screenshots/monitor_mobile_dashboard.png',  alt: 'Monitor mobile dashboard',  caption: 'Same data on your phone' },
  { src: '/screenshots/monitor_desktop_settings.png',  alt: 'Monitor settings',          caption: 'Per-device settings' },
];
```

- [ ] **Step 2: Rewrite `page.tsx`**

```tsx
// app/monitor/page.tsx
import type { Metadata } from 'next';
import {
  ProductHero,
  FeatureGrid,
  Showcase,
  ScreenshotCarousel,
  DeviceMockup,
  PlatformBreadth,
  FreeToTryBanner,
  ProductCTA,
  getAccent,
} from '../../components/products';
import { monitorContent, monitorScreenshots } from './content';

const accent = getAccent('monitor');

export const metadata: Metadata = {
  title: monitorContent.seo.title,
  description: monitorContent.seo.description,
  openGraph: {
    title: monitorContent.seo.title,
    description: monitorContent.seo.description,
    url: 'https://dejajs.com/monitor',
    images: [{ url: monitorContent.icon, width: 512, height: 512, alt: 'DEJA.js Monitor' }],
  },
};

export default function MonitorPage() {
  return (
    <>
      <ProductHero
        productName={monitorContent.name}
        icon={monitorContent.icon}
        tagline={monitorContent.tagline}
        kicker={monitorContent.heroKicker}
        accent={accent}
        primaryCta={monitorContent.ctas.primary}
        secondaryCta={monitorContent.ctas.secondary}
        heroVisual={
          <DeviceMockup
            variant="laptop"
            src="/screenshots/monitor_desktop_dashboard.png"
            alt="Monitor dashboard"
          />
        }
      />

      <FeatureGrid
        eyebrow="Capabilities"
        heading="Transparency other systems hide"
        features={monitorContent.features}
        accent={accent}
      />

      <ScreenshotCarousel
        heading="One view, every scale."
        screenshots={monitorScreenshots}
        accent={accent}
      />

      <Showcase
        eyebrow="Diagnose fast"
        heading="Every command. Every sensor. Every heartbeat."
        body="When a train stops responding mid-session, Monitor lets you see exactly what the command station heard and what came back. No more guessing at wiring."
        visual={
          <DeviceMockup
            variant="laptop"
            src="/screenshots/monitor_desktop_dashboard.png"
            alt="Monitor dashboard detail"
          />
        }
        accent={accent}
      />

      <PlatformBreadth currentSlug="monitor" />

      <FreeToTryBanner />

      <ProductCTA
        heading="See what your layout is doing."
        subheading="Monitor ships with every DEJA.js install. Open it on any device."
        accent={accent}
        primary={monitorContent.ctas.primary}
        secondary={monitorContent.ctas.secondary}
      />
    </>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add apps/dejajs-www/app/monitor/content.ts apps/dejajs-www/app/monitor/page.tsx
git commit -m "feat(dejajs-www): rewrite Monitor product page"
```

---

### Task C5: Tour page rewrite

**Files:**
- Create: `apps/dejajs-www/app/tour/content.ts`
- Modify: `apps/dejajs-www/app/tour/page.tsx`

- [ ] **Step 1: Create `content.ts`**

```ts
// app/tour/content.ts
import type { ProductContent, Screenshot } from '../../components/products/types';

export const tourContent: ProductContent = {
  slug: 'tour',
  name: 'Tour',
  icon: '/tour/icon-512.png',
  tagline:
    'Give your layout a story. Guided presets and automated sequences turn open-house day into a narrated experience.',
  heroKicker: 'Guided layouts for clubs and showcases',
  features: [
    {
      icon: '🗺️',
      title: 'Section-by-section tours',
      description:
        'Walk visitors through distinct areas of your layout with rich context for each section.',
    },
    {
      icon: '🎬',
      title: 'Preset sequences',
      description:
        'Chain effects, sounds, and routes into a repeatable demonstration — one tap, every time.',
    },
    {
      icon: '🖼️',
      title: 'Embed rich media',
      description:
        'Add photos, videos, and descriptions to bring the story behind each area of your layout to life.',
    },
    {
      icon: '🚂',
      title: 'Showcase mode',
      description:
        'Perfect for club open houses, train shows, or giving first-time visitors an unforgettable walkthrough.',
    },
  ],
  ctas: {
    primary: {
      label: 'Try the demo',
      href: 'https://tour.dejajs.com',
      external: true,
      style: 'primary',
    },
    secondary: {
      label: 'Read the docs',
      href: '/docs/tour',
      style: 'secondary',
    },
  },
  seo: {
    title: 'DEJA.js Tour — Give Your Layout a Story',
    description:
      'Guided layout tours for clubs and open-house events. Preset routes, embedded media, and automated sequences.',
  },
};

export const tourScreenshots: Screenshot[] = [
  { src: '/screenshots/tour_desktop_welcome.png',     alt: 'Tour welcome screen', caption: 'A guided entry point' },
  { src: '/screenshots/tour_desktop_sections.png',    alt: 'Tour sections',       caption: 'Section-by-section navigation' },
  { src: '/screenshots/tour_desktop_area-detail.png', alt: 'Area detail',         caption: 'Rich media per area' },
  { src: '/screenshots/tour_desktop_effects.png',     alt: 'Effects panel',       caption: 'Trigger effects from tour' },
  { src: '/screenshots/tour_desktop_media.png',       alt: 'Media gallery',       caption: 'Photos and video' },
];
```

- [ ] **Step 2: Rewrite `page.tsx`**

```tsx
// app/tour/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import {
  ProductHero,
  FeatureGrid,
  Showcase,
  ScreenshotCarousel,
  PlatformBreadth,
  FreeToTryBanner,
  ProductCTA,
  getAccent,
} from '../../components/products';
import { tourContent, tourScreenshots } from './content';

const accent = getAccent('tour');

export const metadata: Metadata = {
  title: tourContent.seo.title,
  description: tourContent.seo.description,
  openGraph: {
    title: tourContent.seo.title,
    description: tourContent.seo.description,
    url: 'https://dejajs.com/tour',
    images: [{ url: tourContent.icon, width: 512, height: 512, alt: 'DEJA.js Tour' }],
  },
};

export default function TourPage() {
  return (
    <>
      <ProductHero
        productName={tourContent.name}
        icon={tourContent.icon}
        tagline={tourContent.tagline}
        kicker={tourContent.heroKicker}
        accent={accent}
        primaryCta={tourContent.ctas.primary}
        secondaryCta={tourContent.ctas.secondary}
        heroVisual={
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-2 shadow-2xl max-w-xl">
            <Image
              src="/screenshots/tour_desktop_welcome.png"
              alt="Tour welcome screen"
              width={800}
              height={500}
              className="rounded-lg w-full h-auto"
            />
          </div>
        }
      />

      <FeatureGrid
        eyebrow="Capabilities"
        heading="Turn running trains into storytelling"
        features={tourContent.features}
        accent={accent}
      />

      <ScreenshotCarousel
        heading="Every moment of your layout, staged."
        screenshots={tourScreenshots}
        accent={accent}
      />

      <Showcase
        eyebrow="For open houses"
        heading="Turn open-house day into a guided experience."
        body="Whether you're running a club show or hosting first-time visitors at home, Tour lets you script the experience so every visitor gets the same polish."
        visual={
          <Image
            src="/screenshots/tour_desktop_area-detail.png"
            alt="Tour area detail"
            width={800}
            height={500}
            className="rounded-xl border border-slate-800 shadow-lg w-full h-auto"
          />
        }
        accent={accent}
      />

      <PlatformBreadth currentSlug="tour" />

      <FreeToTryBanner />

      <ProductCTA
        heading="Give your layout a story."
        subheading="Tour ships with DEJA.js Cloud. Start narrating your layout today."
        accent={accent}
        primary={tourContent.ctas.primary}
        secondary={tourContent.ctas.secondary}
      />
    </>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add apps/dejajs-www/app/tour/content.ts apps/dejajs-www/app/tour/page.tsx
git commit -m "feat(dejajs-www): rewrite Tour product page"
```

---

### Task C6: IO page creation (new route)

**Files:**
- Create: `apps/dejajs-www/app/io/page.tsx`
- Create: `apps/dejajs-www/app/io/content.ts`

- [ ] **Step 1: Create `content.ts`**

```ts
// app/io/content.ts
import type { ProductContent } from '../../components/products/types';

export const ioContent: ProductContent = {
  slug: 'io',
  name: 'IO',
  icon: '/io/icon-512.png',
  tagline:
    'Expand your layout with code, not catalogs. Arduinos, Pico Ws, and MQTT — no proprietary modules required.',
  heroKicker: 'Open hardware. Open protocols.',
  features: [
    {
      icon: '🧩',
      title: 'Arduino and Pico W support',
      description:
        'Plug-and-play firmware for Arduino Mega and Raspberry Pi Pico W. Auto-configures pins for sensors, outputs, and servos.',
    },
    {
      icon: '📡',
      title: 'MQTT native',
      description:
        'Every IO device speaks MQTT directly to your server. Subscribe to events, publish commands, compose anything.',
    },
    {
      icon: '💡',
      title: 'Effects, sensors, servos, signals',
      description:
        'Wire LED strips, occupancy sensors, servo turnouts, and signals — each one becomes a first-class element in Cloud.',
    },
    {
      icon: '🔓',
      title: 'No proprietary modules',
      description:
        'No $80 decoders for things a Pico W can do for $6. Open hardware, open firmware, total control.',
    },
  ],
  ctas: {
    primary: {
      label: 'See compatible hardware',
      href: '/guides/io',
      style: 'primary',
    },
    secondary: {
      label: 'Read the docs',
      href: '/docs/io',
      style: 'secondary',
    },
    guide: {
      label: 'Follow the IO guide',
      href: '/guides/io',
      style: 'ghost',
    },
  },
  seo: {
    title: 'DEJA.js IO — Open Hardware Expansion for DCC-EX',
    description:
      'Expand your layout with Arduino, Pico W, and MQTT. Sensors, servos, effects, and signals — no proprietary modules.',
  },
};

export const ioHardwarePhotos: Array<{ src?: string; alt: string; caption?: string }> = [
  { alt: 'Raspberry Pi Pico W with DEJA firmware',  caption: 'Pico W running CircuitPython' },
  { alt: 'Arduino Mega wired for effects',          caption: 'Arduino Mega I/O board' },
  { alt: 'Servo-driven turnout mechanism',          caption: 'Servo turnouts' },
  { alt: 'LED strip lighting a station scene',      caption: 'Scene lighting' },
  { alt: 'Occupancy sensor on the mainline',        caption: 'Block occupancy sensors' },
  { alt: 'Signal head wired to IO',                 caption: 'Signal heads' },
];
```

Note: `src` is omitted — `HardwareGallery` renders a "photo slot" placeholder when `src` is missing. User supplies photos before merge.

- [ ] **Step 2: Create `page.tsx`**

```tsx
// app/io/page.tsx
import type { Metadata } from 'next';
import {
  ProductHero,
  FeatureGrid,
  Showcase,
  HardwareGallery,
  PlatformBreadth,
  FreeToTryBanner,
  ProductCTA,
  getAccent,
} from '../../components/products';
import { ioContent, ioHardwarePhotos } from './content';

const accent = getAccent('io');

export const metadata: Metadata = {
  title: ioContent.seo.title,
  description: ioContent.seo.description,
  openGraph: {
    title: ioContent.seo.title,
    description: ioContent.seo.description,
    url: 'https://dejajs.com/io',
    images: [{ url: ioContent.icon, width: 512, height: 512, alt: 'DEJA.js IO' }],
  },
};

export default function IOPage() {
  return (
    <>
      <ProductHero
        productName={ioContent.name}
        icon={ioContent.icon}
        tagline={ioContent.tagline}
        kicker={ioContent.heroKicker}
        accent={accent}
        primaryCta={ioContent.ctas.primary}
        secondaryCta={ioContent.ctas.secondary}
        guideCta={ioContent.ctas.guide}
        heroVisual={
          <div className="w-full max-w-lg aspect-square rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-gray-600 text-sm font-mono">
            📸 hero photo slot
          </div>
        }
      />

      <FeatureGrid
        eyebrow="Capabilities"
        heading="Your layout, your hardware, your rules"
        features={ioContent.features}
        accent={accent}
      />

      <HardwareGallery accent={accent} photos={ioHardwarePhotos} />

      <Showcase
        eyebrow="Architecture"
        heading="MQTT to the server. DCC to the track. Nothing proprietary in between."
        body="Every IO device publishes its state and subscribes to commands over MQTT. The server routes messages to the right Cloud element. You never touch a proprietary module or a locked-down protocol."
        visual={
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm font-mono text-gray-400 leading-relaxed">
            <pre>{`IO device ──MQTT──▶ server
                        ├─WebSocket─▶ throttles
                        └─Firebase──▶ cloud`}</pre>
          </div>
        }
        accent={accent}
      />

      <Showcase
        eyebrow="No catalogs"
        heading="LED strips to servo turnouts. No proprietary modules."
        body="If it runs on an Arduino or a Pico W, it can run under DEJA.js. Copy our firmware onto your board, wire it up, and it shows up in Cloud."
        visual={
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-gray-400">
            <ul className="space-y-2 list-disc list-inside">
              <li>LED scene lighting</li>
              <li>Servo-driven turnouts</li>
              <li>Block occupancy sensors</li>
              <li>Signal heads</li>
              <li>Sound effects</li>
              <li>Anything else you can wire to a GPIO</li>
            </ul>
          </div>
        }
        accent={accent}
        reversed
      />

      <PlatformBreadth currentSlug="io" />

      <FreeToTryBanner />

      <ProductCTA
        heading="Build the layout you want. Not the one a catalog lets you buy."
        subheading="Open firmware, open hardware, open protocols. Start with an Arduino or a Pico W."
        accent={accent}
        primary={ioContent.ctas.primary}
        secondary={ioContent.ctas.secondary}
        guide={ioContent.ctas.guide}
      />
    </>
  );
}
```

- [ ] **Step 3: Type-check and load the new route**

```bash
cd apps/dejajs-www && pnpm exec tsc --noEmit && pnpm dev
```

Visit `http://localhost:3051/io`. Expect: page renders with hardware photo placeholders. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add apps/dejajs-www/app/io/page.tsx apps/dejajs-www/app/io/content.ts
git commit -m "feat(dejajs-www): add IO product page"
```

---

### Task C7: Phase C verification

**Files:**
- Read-only verification

- [ ] **Step 1: Full build**

```bash
cd apps/dejajs-www && pnpm build
```

Expected: successful build.

- [ ] **Step 2: Dev server smoke test**

```bash
cd apps/dejajs-www && pnpm dev
```

Visit each route and confirm the page renders:
- `/throttle`
- `/server`
- `/cloud`
- `/io`
- `/monitor`
- `/tour`

Confirm the Header dropdown shows all 6 products in the correct order (Throttle → Server → Cloud → IO → Monitor → Tour).

Stop dev server.

- [ ] **Step 3: No commit (verification only)**

---

## Phase D — Brand Refresh + Claims Audit

This phase runs last because it depends on user-supplied assets.

---

### Task D1: Add per-product brand tokens and glow utilities

**Files:**
- Modify: `apps/dejajs-www/styles/globals.css`

**Prerequisite:** User has supplied 6 hex values. If they haven't yet, skip this task and block the PR.

- [ ] **Step 1: Read the current file**

Use Read tool on `apps/dejajs-www/styles/globals.css`.

- [ ] **Step 2: Add the new tokens inside `@theme`**

Append to the `@theme` block (after `--color-deja-lime`):

```css
--color-deja-throttle: <USER-SUPPLIED-HEX>;
--color-deja-server:   <USER-SUPPLIED-HEX>;
--color-deja-cloud:    <USER-SUPPLIED-HEX>;
--color-deja-io:       <USER-SUPPLIED-HEX>;
--color-deja-monitor:  <USER-SUPPLIED-HEX>;
--color-deja-tour:     <USER-SUPPLIED-HEX>;
```

- [ ] **Step 3: Add matching `.glow-*` utilities**

After the existing `.glow-lime` block, add:

```css
.glow-throttle {
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-deja-throttle) 40%, transparent),
              0 0 60px color-mix(in srgb, var(--color-deja-throttle) 15%, transparent);
}
.glow-server {
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-deja-server) 40%, transparent),
              0 0 60px color-mix(in srgb, var(--color-deja-server) 15%, transparent);
}
.glow-cloud {
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-deja-cloud) 40%, transparent),
              0 0 60px color-mix(in srgb, var(--color-deja-cloud) 15%, transparent);
}
.glow-io {
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-deja-io) 40%, transparent),
              0 0 60px color-mix(in srgb, var(--color-deja-io) 15%, transparent);
}
.glow-monitor {
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-deja-monitor) 40%, transparent),
              0 0 60px color-mix(in srgb, var(--color-deja-monitor) 15%, transparent);
}
.glow-tour {
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-deja-tour) 40%, transparent),
              0 0 60px color-mix(in srgb, var(--color-deja-tour) 15%, transparent);
}
```

`color-mix` is widely supported and handles the alpha math without requiring RGBA component variables.

- [ ] **Step 4: Verify Tailwind sees the tokens**

```bash
cd apps/dejajs-www && pnpm dev
```

Visit `/throttle`. The accent text should render in the new throttle color. If it doesn't, Tailwind v4 may need a rebuild — stop and restart dev.

- [ ] **Step 5: Commit**

```bash
git add apps/dejajs-www/styles/globals.css
git commit -m "feat(dejajs-www): add per-product brand tokens and glow utilities"
```

---

### Task D2: Claims audit pass

**Files:**
- Modify: any `content.ts` files where claims need softening
- Modify: `components/products/FreeToTryBanner.tsx` if pricing claim fails

**This task is mandatory and blocks merge.** Every feature bullet and headline in the rewritten product pages must be verifiable against actual code or docs.

- [ ] **Step 1: Verify Throttle claims**

For each claim in `app/throttle/content.ts`, confirm against `apps/throttle/src/`:

| Claim | Where to verify |
|---|---|
| "Smooth sliders plus exact ±1 step modifiers" | Throttle UI source |
| "Build a consist in three taps" | Consist creation flow — count the actual taps |
| "No CV programming" | Consist feature spec |
| "Function buttons map dynamically from your roster" | Function mapping source |
| "Throw switches and trigger routes from the throttle view" | Turnouts/routes nav |
| "Runs on iOS, Android, and every modern browser" | Confirmed in FAQ |

Any claim that fails: rewrite to a weaker, true statement. Example: if consists take 4 taps, change "three taps" → "a handful of taps".

- [ ] **Step 2: Verify Server claims**

For each claim in `app/server/content.ts`:

| Claim | Where to verify |
|---|---|
| "One curl command" | Confirm `install.dejajs.com` is live; confirm the one-line install exists |
| "Runs on macOS, Linux, and a $35 Raspberry Pi" | Confirm `linux/arm64` release exists (see distribution spec) |
| "No Docker, no Python virtualenv" | True by construction |
| "WebSocket + MQTT + Firebase bridge" | `apps/server/index.ts` |
| "Managed with the `deja` CLI" | `apps/cli/` exists |
| "PID files and graceful shutdown built in" | `apps/server/src/` — confirm |
| "Auto-detects your DCC-EX serial port" | `apps/server/src/lib/serial.ts` — verify; if not auto-detect, soften to "connects to your DCC-EX serial port" |

If `install.dejajs.com` isn't live yet, change the primary CTA to "See install docs" → `/docs/server#install` and remove the one-liner reference.

- [ ] **Step 3: Verify Cloud claims**

For each claim in `app/cloud/content.ts`:

| Claim | Where to verify |
|---|---|
| "Rename a loco on your laptop and every throttle in the room updates instantly" | Firebase sync — true by construction |
| "Color-coded everything" | Confirmed in FAQ |
| "Per-device session tokens" | `packages/auth/` — confirm; if not implemented yet, soften to "secure per-device access" |
| "Multiple layout spaces" | Confirmed in existing feature set |

- [ ] **Step 4: Verify IO claims**

For each claim in `app/io/content.ts`:

| Claim | Where to verify |
|---|---|
| "Plug-and-play firmware for Arduino Mega and Raspberry Pi Pico W" | `io/src/deja-arduino/` and `io/src/deja-pico-w/` exist |
| "Auto-configures pins for sensors, outputs, and servos" | FAQ claim — verify against `apps/cloud/src/` device config |
| "MQTT native" | `io/` firmware — confirm |
| "LED strips, occupancy sensors, servo turnouts, signals" | Confirmed in FAQ |

- [ ] **Step 5: Verify Monitor claims**

For each claim in `app/monitor/content.ts`:

| Claim | Where to verify |
|---|---|
| "Live command stream" | `apps/monitor/src/` — confirm real-time feed exists |
| "Device health" | Monitor dashboard source — confirm |
| "Mobile and desktop dashboards" | Confirm both screens exist in `apps/monitor/src/` |
| "Event traces — scroll back through recent events" | Confirm history/log view exists; if not, soften to "live event view" |

- [ ] **Step 6: Verify Tour claims**

For each claim in `app/tour/content.ts`:

| Claim | Where to verify |
|---|---|
| "Section-by-section tours" | `apps/tour/src/` — confirm |
| "Preset sequences — chain effects, sounds, and routes" | Confirm the sequence chaining feature exists; if not, soften |
| "Embed photos, videos, and descriptions" | Confirm media embed in tour |

- [ ] **Step 7: Verify FreeToTryBanner claim**

"Free to try. No trial timer." — check `apps/dejajs-www/app/pricing/page.tsx` and any billing config. If DEJA.js is strictly paid, rewrite to reflect the actual pricing model. Example alternatives:

- "Try DEJA.js on your layout today."
- "Start free. Upgrade when you're ready."

- [ ] **Step 8: Commit any corrections**

```bash
git add apps/dejajs-www/app/*/content.ts apps/dejajs-www/components/products/FreeToTryBanner.tsx
git commit -m "refactor(dejajs-www): claims audit — align product copy with shipped features"
```

If no changes were required, skip the commit and note "audit passed, no changes" in the PR description.

---

### Task D3: Drop in new product icons

**Files:**
- Write: `apps/dejajs-www/public/throttle/icon-{512,192,192-maskable}.png`
- Write: `apps/dejajs-www/public/server/icon-{512,192,192-maskable}.png`
- Write: `apps/dejajs-www/public/cloud/icon-{512,192,192-maskable}.png`
- Write: `apps/dejajs-www/public/io/icon-{512,192,192-maskable}.png`
- Write: `apps/dejajs-www/public/monitor/icon-{512,192,192-maskable}.png`
- Write: `apps/dejajs-www/public/tour/icon-{512,192,192-maskable}.png`

**Prerequisite:** User has supplied icon PNGs.

- [ ] **Step 1: Copy user-supplied icons**

User places new icons in the respective `public/{product}/` directories. Create `public/server/` and `public/io/` directories if they don't exist yet.

```bash
mkdir -p apps/dejajs-www/public/server apps/dejajs-www/public/io
# User drops files in place, or copies from a source folder:
# cp ~/Downloads/new-icons/throttle-512.png apps/dejajs-www/public/throttle/icon-512.png
# (and so on)
```

- [ ] **Step 2: Verify Next.js can load them**

```bash
cd apps/dejajs-www && pnpm dev
```

Visit each product page. Hero icon loads (not 404). Header dropdown icons load.

- [ ] **Step 3: Commit**

```bash
git add apps/dejajs-www/public/throttle/icon-*.png apps/dejajs-www/public/server/icon-*.png apps/dejajs-www/public/cloud/icon-*.png apps/dejajs-www/public/io/icon-*.png apps/dejajs-www/public/monitor/icon-*.png apps/dejajs-www/public/tour/icon-*.png
git commit -m "feat(dejajs-www): drop in new product icons for all 6 products"
```

---

### Task D4: Update in-app PWA manifests + favicons (Throttle, Cloud, Monitor, Tour)

**Files:**
- Modify: `apps/{throttle,cloud,monitor,tour}/public/manifest.json`
- Modify: `apps/{throttle,cloud,monitor,tour}/public/favicon.*`
- Modify: `apps/{throttle,cloud,monitor,tour}/public/IconKitchen-*/` (replace with new assets)
- Modify: `apps/{throttle,cloud,monitor,tour}/index.html` — update `<meta name="theme-color">`

**Prerequisite:** User has supplied the new icon source files (IconKitchen outputs) and the new brand hex for each app.

- [ ] **Step 1: Replace IconKitchen folders**

For each of Throttle, Cloud, Monitor, Tour, replace the contents of `apps/{app}/public/IconKitchen-*/` with the user-supplied new IconKitchen output.

- [ ] **Step 2: Update `favicon.ico` and `favicon.svg`**

Replace `apps/{app}/public/favicon.ico` and `favicon.svg` with the new versions.

- [ ] **Step 3: Update `manifest.json` theme_color and background_color**

For each app, read `apps/{app}/public/manifest.json`. Update:

```json
{
  "theme_color": "<new hex for this app>",
  "background_color": "<new hex or existing dark color>"
}
```

- [ ] **Step 4: Update `<meta name="theme-color">` in `index.html`**

For each app, read `apps/{app}/index.html` and replace:

```html
<meta name="theme-color" content="#old-color">
```

with the new hex.

- [ ] **Step 5: Verify each app still builds**

```bash
pnpm --filter=deja-throttle build
pnpm --filter=deja-cloud build
pnpm --filter=deja-monitor build
pnpm --filter=deja-tour build
```

Expected: all four builds succeed.

- [ ] **Step 6: Commit**

```bash
git add apps/throttle/public apps/throttle/index.html apps/cloud/public apps/cloud/index.html apps/monitor/public apps/monitor/index.html apps/tour/public apps/tour/index.html
git commit -m "feat(apps): refresh per-app icons, manifests, and theme colors"
```

---

### Task D5: Final verification

**Files:**
- Read-only verification

- [ ] **Step 1: Full monorepo lint + type-check + build**

```bash
pnpm --filter=deja-www lint
pnpm --filter=deja-www check-types
pnpm --filter=deja-www build
```

Expected: all pass.

- [ ] **Step 2: Grep verify no Sanity remains**

Use Grep tool in `apps/dejajs-www` with pattern `from ['"](next-sanity|@sanity|\.\./sanity|\.\./\.\./sanity)`. Expected: zero matches.

Use Grep tool with pattern `SANITY_` in `apps/dejajs-www`. Expected: zero matches (other than possibly a deleted-history note).

- [ ] **Step 3: Start dev server and walk through all pages**

```bash
cd apps/dejajs-www && pnpm dev
```

Walkthrough:
- `/` — home renders with no Sanity-driven content
- `/throttle` — renders with new icon, new color, phone mockup, all sections
- `/server` — renders with terminal install block
- `/cloud` — renders with roster/effects showcases
- `/io` — renders with hardware photos (or placeholder slots if user hasn't provided photos yet)
- `/monitor` — renders with laptop mockup
- `/tour` — renders with welcome screen hero
- Header dropdown shows all 6 products in order
- `/studio` — 404
- `/sitemap.xml` — includes `/io`

Stop dev server.

- [ ] **Step 4: No commit (verification only)**

---

## Self-Review Against Spec

Running through the spec sections and confirming each has a task:

**§2 Phase 1 — Brand refresh**
- Tokens in `globals.css` → Task D1 ✅
- Marketing site product icons → Task D3 ✅
- Site-level PWA manifest (`app/manifest.json`) → *missing, add to Task D4*
- OG image references in product page metadata → covered via `content.ts` → `metadata` in each page rewrite (Tasks C1–C6) ✅
- Header nav icons → Task A3 ✅
- In-app PWA manifests + favicons + theme meta → Task D4 ✅
- IconKitchen source folders → Task D4 ✅

**§3 Phase 2 — Sanity removal**
- Delete `sanity/`, `sanity.cli.ts`, `sanity.config.ts`, `app/studio/` → Task A9 ✅
- `app/layout.tsx` stop passing Sanity settings → Task A2 ✅
- `components/Header.tsx` hardcode nav → Task A3 ✅
- `app/sitemap.ts` hardcode → Task A5 ✅
- `app/page.tsx` drop Sanity → Task A8 ✅
- Six product `page.tsx` drop Sanity → done implicitly in Phase C rewrites ✅
- `home/*.tsx` Sanity consumers → Task A7 (PromoHeroSection, PromoBannerStrip) ✅
- `package.json` uninstall Sanity deps → Task A10 ✅
- `next.config.js`, `.env.example`, `vercel.json` → Task A10 ✅
- `app/faq/page.tsx` → Task A6 ✅

**§4 Phase 3 — Product page rebuild**
- Building block library (12 blocks) → Tasks B1–B14 ✅
- Shared types + accents → Tasks B1–B2 ✅
- 6 product pages composed → Tasks C1–C6 ✅
- `content.ts` sidecar per page → Tasks C1–C6 ✅

**§5 Differentiation**
- Baked into `content.ts` copy in each page (Tasks C1–C6) ✅

**§6 Claims audit**
- Task D2 ✅

**§7 CTA mapping**
- Encoded in each page's `content.ts` (Tasks C1–C6) ✅

**§9 Open items**
- User-supplied assets block Tasks D1, D3, D4 ✅

**§10 Verification plan**
- Tasks A11, C7, D5 ✅

### Fixing the one gap

Adding the site-level manifest update to Task D4 as a sub-step:

- `apps/dejajs-www/app/manifest.json` — update `theme_color` if the site-wide brand changes. Otherwise leave as-is and note in the PR.

The fix is small enough that the execution agent can handle it as part of Task D4 without a new task.

### Placeholder scan

Grepping my own plan for red-flag phrases:

- "TBD" — only in `<USER-SUPPLIED-HEX>` placeholders in Task D1. These are intentional — user supplies the values at execution time. ✅
- "TODO", "implement later", "similar to Task N", "add error handling" — none. ✅
- "Write tests for the above" — none (no tests in this plan because the marketing site has no existing test harness and adding one is out of scope). ✅

### Type consistency

- `ProductSlug` defined in B1, used in B2, B10, and all C tasks — consistent. ✅
- `ProductAccent` defined in B1 with `textClass`, `bgClass`, `borderClass`, `glowClass` — used consistently in B4, B5, B6, B7, B9, B11, B13. ✅
- `Feature` interface — consistent across B5 and all C tasks. ✅
- `CTAAction` — consistent. ✅
- `getAccent()` function signature — consistent in all C tasks. ✅

No fixes needed.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-09-product-pages-and-brand-refresh.md`.

**User is running Phase D (brand assets) in parallel.** Phases A, B, and C can proceed now without blocking.

Execution strategy:
1. **Phase A** (Sanity removal) — Tasks A1–A11 (run in order)
2. **Phase B** (Block library) — Tasks B1–B14 (most can run in any order, B14 barrel exports last)
3. **Phase C** (Page rewrites) — Tasks C1–C6 (independent, C7 verifies)
4. **Phase D** (Brand + audit) — Tasks D1–D5, waits on user assets
