# Promotional System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cross-app promotional content system that displays time-based promotions across dejajs-www (Sanity), Cloud (Firebase), and Throttle (Firebase) apps.

**Architecture:** Promotions are stored in Firestore (for Vue apps) and Sanity (for dejajs-www). A shared `@repo/modules/promotions` domain provides types, constants, and a Vue composable. A seed script pushes promo JSON to both backends simultaneously. Each app renders promos via its native component system.

**Tech Stack:** Firebase Firestore, Sanity CMS, Vuefire, Vuetify 3, Vue 3 Composition API, Next.js (React), TypeScript

**Spec:** `docs/superpowers/specs/2026-03-22-promotional-system-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `packages/modules/promotions/types.ts` | Promotion & PromoCTA interfaces |
| `packages/modules/promotions/constants.ts` | PROMO_SLOTS, VARIANT_COLORS |
| `packages/modules/promotions/usePromotions.ts` | Vue composable: query Firestore, filter by slot + date |
| `packages/modules/promotions/index.ts` | Re-exports |
| `packages/ui/src/Promotions/PromoBanner.vue` | Vuetify v-banner promo component |
| `apps/dejajs-www/sanity/schemaTypes/documents/promotion.ts` | Sanity document schema |
| `apps/dejajs-www/components/home/PromoHeroSection.tsx` | React hero-section promo component |
| `apps/dejajs-www/components/PromoBannerStrip.tsx` | React banner-top promo component |
| `scripts/push-promo.ts` | CLI: push JSON to Firestore + Sanity |
| `promotions/launch-support.json` | First promo content |
| `promotions/README.md` | Schema docs + usage guide |

### Modified Files

| File | Change |
|------|--------|
| `packages/modules/index.ts` | Add promotions module exports |
| `packages/ui/src/index.ts` | Export PromoBanner |
| `apps/cloud/src/App.vue` | Add PromoBanner below trial banner |
| `apps/throttle/src/App.vue` | Add PromoBanner above main content |
| `apps/dejajs-www/sanity/schemaTypes/index.ts` | Register promotion schema |
| `apps/dejajs-www/sanity/lib/queries.ts` | Add ACTIVE_PROMOTIONS_QUERY |
| `apps/dejajs-www/app/page.tsx` | Add PromoHeroSection |
| `apps/dejajs-www/app/layout.tsx` | Add PromoBannerStrip (non-homepage) |
| `package.json` (root) | Add promo:push, promo:deactivate scripts |

---

## Task 1: Types & Constants

**Files:**
- Create: `packages/modules/promotions/types.ts`
- Create: `packages/modules/promotions/constants.ts`
- Create: `packages/modules/promotions/index.ts`
- Modify: `packages/modules/index.ts`

- [ ] **Step 1: Create types file**

Create `packages/modules/promotions/types.ts`:

```typescript
import type { Timestamp } from 'firebase/firestore'

export type PromoVariant = 'info' | 'success' | 'launch' | 'warning'

export type PromoCTAStyle = 'primary' | 'secondary' | 'ghost'

export interface PromoCTA {
  label: string
  url: string
  style: PromoCTAStyle
}

export interface Promotion {
  id: string
  slug: string
  title: string
  body: string
  ctas: PromoCTA[]
  slots: string[]
  startDate: Timestamp | null
  endDate: Timestamp | null
  active: boolean
  variant: PromoVariant
  icon: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

- [ ] **Step 2: Create constants file**

Create `packages/modules/promotions/constants.ts`:

```typescript
export const PROMO_SLOTS = {
  BANNER_TOP: 'banner-top',
  HERO_SECTION: 'hero-section',
} as const

export type PromoSlot = (typeof PROMO_SLOTS)[keyof typeof PROMO_SLOTS]

export const VARIANT_COLORS: Record<string, string> = {
  info: 'info',
  success: 'success',
  launch: 'success',
  warning: 'warning',
} as const
```

- [ ] **Step 3: Create index file**

Create `packages/modules/promotions/index.ts`:

```typescript
export * from './types'
export * from './constants'
// uncomment after Task 2 creates usePromotions.ts:
// export { usePromotions } from './usePromotions'
```

- [ ] **Step 4: Add to modules root index**

Modify `packages/modules/index.ts` — add after the `// Plans` export block (line 51):

```typescript
// Promotions
export * from './promotions'
```

- [ ] **Step 5: Verify types compile**

Run: `pnpm --filter=@repo/modules exec tsc --noEmit`

Expected: No type errors (the usePromotions import in index.ts may warn — that's fine until Task 2)

- [ ] **Step 6: Commit**

```bash
git add packages/modules/promotions/ packages/modules/index.ts
git commit -m "feat(modules): add promotions types and constants"
```

---

## Task 2: Vue Composable

**Files:**
- Create: `packages/modules/promotions/usePromotions.ts`
- Modify: `packages/modules/promotions/index.ts` (uncomment export)

- [ ] **Step 1: Create the composable**

Create `packages/modules/promotions/usePromotions.ts`:

```typescript
import { computed } from 'vue'
import { collection, query, where } from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'
import type { Promotion } from './types'

export function usePromotions(slotId: string) {
  const db = useFirestore()

  const promotionsRef = computed(() => {
    return query(
      collection(db, 'promotions'),
      where('active', '==', true),
    )
  })

  const allActive = useCollection<Promotion>(promotionsRef)

  const promotions = computed(() => {
    const now = new Date()
    return (allActive.value ?? []).filter((promo) => {
      if (!promo.slots.includes(slotId)) return false
      if (promo.startDate && promo.startDate.toDate() > now) return false
      if (promo.endDate && promo.endDate.toDate() < now) return false
      return true
    })
  })

  const hasPromotions = computed(() => promotions.value.length > 0)

  return {
    promotions,
    hasPromotions,
  }
}
```

- [ ] **Step 2: Ensure index.ts exports the composable**

Uncomment the export in `packages/modules/promotions/index.ts`:

```typescript
export * from './types'
export * from './constants'
export { usePromotions } from './usePromotions'
```

- [ ] **Step 3: Verify types compile**

Run: `pnpm --filter=@repo/modules exec tsc --noEmit`

Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add packages/modules/promotions/usePromotions.ts packages/modules/promotions/index.ts
git commit -m "feat(modules): add usePromotions composable"
```

---

## Task 3: PromoBanner Vue Component

**Files:**
- Create: `packages/ui/src/Promotions/PromoBanner.vue`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Create the component**

Create `packages/ui/src/Promotions/PromoBanner.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { Promotion } from '@repo/modules'
import { VARIANT_COLORS } from '@repo/modules'

defineProps<{
  promotion: Promotion
}>()

const dismissed = ref(false)
</script>

<template>
  <v-banner
    v-if="!dismissed"
    lines="one"
    :color="VARIANT_COLORS[promotion.variant] ?? 'info'"
    density="compact"
    class="text-body-2"
  >
    <template #prepend>
      <span v-if="promotion.icon" class="text-lg">{{ promotion.icon }}</span>
    </template>
    <template #text>
      <strong>{{ promotion.title }}</strong> — {{ promotion.body }}
    </template>
    <template #actions>
      <v-btn
        v-for="cta in promotion.ctas"
        :key="cta.url"
        :variant="cta.style === 'primary' ? 'tonal' : 'text'"
        size="small"
        :href="cta.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ cta.label }}
      </v-btn>
      <v-btn
        icon="mdi-close"
        size="x-small"
        variant="text"
        @click="dismissed = true"
      />
    </template>
  </v-banner>
</template>
```

- [ ] **Step 2: Export from @repo/ui**

Add to `packages/ui/src/index.ts` (after the Notifications exports, around line 62):

```typescript
export { default as PromoBanner } from './Promotions/PromoBanner.vue'
```

- [ ] **Step 3: Verify types compile**

Run: `pnpm check-types`

Expected: No new type errors

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/Promotions/ packages/ui/src/index.ts
git commit -m "feat(ui): add PromoBanner component"
```

---

## Task 4: Cloud App Integration

**Files:**
- Modify: `apps/cloud/src/App.vue`

- [ ] **Step 1: Add imports**

In `apps/cloud/src/App.vue`, add to the `<script setup>` imports:

```typescript
import { usePromotions, PROMO_SLOTS } from '@repo/modules'
import { PromoBanner } from '@repo/ui'
```

- [ ] **Step 2: Add composable call**

After the existing `useSubscription()` call in the setup block, add:

```typescript
const { promotions: activePromos, hasPromotions } = usePromotions(PROMO_SLOTS.BANNER_TOP)
```

- [ ] **Step 3: Add template markup**

In the `<template>`, add the PromoBanner immediately after the existing trial `v-banner` closing tag (after line ~121, after `</v-banner>`):

```vue
<PromoBanner
  v-for="promo in activePromos"
  :key="promo.id"
  :promotion="promo"
/>
```

- [ ] **Step 4: Verify it compiles**

Run: `pnpm --filter=deja-cloud exec vue-tsc --noEmit`

Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add apps/cloud/src/App.vue
git commit -m "feat(cloud): integrate promotional banners"
```

---

## Task 5: Throttle App Integration

**Files:**
- Modify: `apps/throttle/src/App.vue`

- [ ] **Step 1: Add imports**

In `apps/throttle/src/App.vue`, add to the existing `@repo/ui` import line (line 4):

```typescript
import { AppHeader, TransitionFade, NotificationContainer, provideNotifications, PageBackground, PromoBanner } from '@repo/ui'
```

And add a new import:

```typescript
import { usePromotions, PROMO_SLOTS } from '@repo/modules'
```

- [ ] **Step 2: Add composable call**

In the `<script setup>` block, after `provideNotifications()` (line 19), add:

```typescript
const { promotions: activePromos } = usePromotions(PROMO_SLOTS.BANNER_TOP)
```

- [ ] **Step 3: Add template markup**

In the `<template>`, add the PromoBanner immediately after `<AppHeader ... />` and before `<Menu ...>` (between lines 113 and 114):

```vue
<PromoBanner
  v-for="promo in activePromos"
  :key="promo.id"
  :promotion="promo"
/>
```

- [ ] **Step 4: Verify it compiles**

Run: `pnpm --filter=deja-throttle exec vue-tsc --noEmit`

Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add apps/throttle/src/App.vue
git commit -m "feat(throttle): integrate promotional banners"
```

---

## Task 6: Sanity Promotion Schema

**Files:**
- Create: `apps/dejajs-www/sanity/schemaTypes/documents/promotion.ts`
- Modify: `apps/dejajs-www/sanity/schemaTypes/index.ts`

- [ ] **Step 1: Create the schema**

Create `apps/dejajs-www/sanity/schemaTypes/documents/promotion.ts`:

```typescript
import { defineType, defineField, defineArrayMember } from 'sanity'
import { BulkEditIcon } from '@sanity/icons'

export const promotion = defineType({
  name: 'promotion',
  title: 'Promotion',
  type: 'document',
  icon: BulkEditIcon,
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'Unique identifier (e.g., "launch-support")',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Emoji or icon name (e.g., 🚀)',
    }),
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Success', value: 'success' },
          { title: 'Launch', value: 'launch' },
          { title: 'Warning', value: 'warning' },
        ],
        layout: 'radio',
      },
      initialValue: 'info',
    }),
    defineField({
      name: 'ctas',
      title: 'Calls to Action',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'url', title: 'URL', type: 'string', validation: (rule) => rule.required() }),
            defineField({
              name: 'style',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  { title: 'Primary', value: 'primary' },
                  { title: 'Secondary', value: 'secondary' },
                  { title: 'Ghost', value: 'ghost' },
                ],
                layout: 'radio',
              },
              initialValue: 'primary',
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'url' },
          },
        }),
      ],
    }),
    defineField({
      name: 'slots',
      title: 'Placement Slots',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'Banner Top', value: 'banner-top' },
          { title: 'Hero Section', value: 'hero-section' },
        ],
      },
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      description: 'Leave empty for immediately active',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      description: 'Leave empty for no expiration',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug', active: 'active' },
    prepare({ title, subtitle, active }) {
      return {
        title: `${active ? '🟢' : '🔴'} ${title}`,
        subtitle,
      }
    },
  },
})
```

- [ ] **Step 2: Register in schema index**

Modify `apps/dejajs-www/sanity/schemaTypes/index.ts` — add import and include in array:

```typescript
import { promotion } from './documents/promotion'
```

Add `promotion` to the `schemaTypes` array after `siteSettings`.

- [ ] **Step 3: Verify Sanity types**

Run: `pnpm --filter=dejajs-www build` (or just check types)

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/dejajs-www/sanity/schemaTypes/documents/promotion.ts apps/dejajs-www/sanity/schemaTypes/index.ts
git commit -m "feat(www): add Sanity promotion document schema"
```

---

## Task 7: Sanity Query + PromoHeroSection React Component

**Files:**
- Modify: `apps/dejajs-www/sanity/lib/queries.ts`
- Create: `apps/dejajs-www/components/home/PromoHeroSection.tsx`
- Modify: `apps/dejajs-www/app/page.tsx`

- [ ] **Step 1: Add GROQ query**

Add to `apps/dejajs-www/sanity/lib/queries.ts`:

```typescript
// ─── Active Promotions ───────────────────────────────────
export const ACTIVE_PROMOTIONS_QUERY = defineQuery(/* groq */ `
  *[_type == "promotion" && active == true]{
    _id,
    slug,
    title,
    body,
    icon,
    variant,
    ctas[] { label, url, style },
    slots,
    startDate,
    endDate
  }
`)
```

- [ ] **Step 2: Create PromoHeroSection**

Create `apps/dejajs-www/components/home/PromoHeroSection.tsx`:

```tsx
import AnimateIn from './AnimateIn'
import SectionLabel from './SectionLabel'
import { client } from '../../sanity/lib/client'
import { ACTIVE_PROMOTIONS_QUERY } from '../../sanity/lib/queries'

interface PromoCTA {
  label: string
  url: string
  style: 'primary' | 'secondary' | 'ghost'
}

interface SanityPromotion {
  _id: string
  slug: string
  title: string
  body: string
  icon: string | null
  variant: string
  ctas: PromoCTA[]
  slots: string[]
  startDate: string | null
  endDate: string | null
}

function isActiveNow(promo: SanityPromotion): boolean {
  const now = new Date()
  if (promo.startDate && new Date(promo.startDate) > now) return false
  if (promo.endDate && new Date(promo.endDate) < now) return false
  return true
}

export default async function PromoHeroSection() {
  if (!client) return null

  const promos: SanityPromotion[] = await client.fetch(ACTIVE_PROMOTIONS_QUERY)
  const promo = promos.find(
    (p) => p.slots.includes('hero-section') && isActiveNow(p),
  )

  if (!promo) return null

  return (
    <section className="relative py-12 px-4 sm:px-8">
      <div className="absolute inset-0 bg-gradient-to-r from-deja-lime/5 via-transparent to-deja-cyan/5 pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center relative">
        <AnimateIn>
          <SectionLabel color="lime">
            {promo.icon ?? '🚀'} Launch Offer
          </SectionLabel>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-4">
            {promo.title}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-3">
            {promo.body}
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {promo.ctas.map((cta) => (
              <a
                key={cta.url}
                href={cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  cta.style === 'primary'
                    ? 'inline-flex items-center gap-2 px-6 py-3 rounded-full bg-deja-lime text-black font-bold text-sm hover:opacity-90 transition-opacity glow-lime'
                    : cta.style === 'secondary'
                      ? 'inline-flex items-center gap-2 px-6 py-3 rounded-full border border-deja-lime text-deja-lime font-bold text-sm hover:bg-deja-lime/10 transition-colors'
                      : 'inline-flex items-center gap-2 px-6 py-3 text-deja-lime font-semibold text-sm hover:opacity-70 transition-opacity'
                }
              >
                {cta.label}
              </a>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add to homepage**

Modify `apps/dejajs-www/app/page.tsx` — add import:

```typescript
import PromoHeroSection from '../components/home/PromoHeroSection'
```

Add `<PromoHeroSection />` after `<HeroSection />` and before `<QuickStartSection />`:

```tsx
<HeroSection />
<PromoHeroSection />
<QuickStartSection />
```

- [ ] **Step 4: Verify it builds**

Run: `pnpm --filter=dejajs-www build`

Expected: Build succeeds (promo renders nothing until content is seeded)

- [ ] **Step 5: Commit**

```bash
git add apps/dejajs-www/sanity/lib/queries.ts apps/dejajs-www/components/home/PromoHeroSection.tsx apps/dejajs-www/app/page.tsx
git commit -m "feat(www): add PromoHeroSection for hero-section slot"
```

---

## Task 8: PromoBannerStrip React Component (dejajs-www)

**Files:**
- Create: `apps/dejajs-www/components/PromoBannerStrip.tsx`
- Modify: `apps/dejajs-www/app/layout.tsx`

- [ ] **Step 1: Create the component**

Create `apps/dejajs-www/components/PromoBannerStrip.tsx`:

```tsx
import { client } from '../sanity/lib/client'
import { ACTIVE_PROMOTIONS_QUERY } from '../sanity/lib/queries'

interface PromoCTA {
  label: string
  url: string
  style: 'primary' | 'secondary' | 'ghost'
}

interface SanityPromotion {
  _id: string
  slug: string
  title: string
  body: string
  icon: string | null
  variant: string
  ctas: PromoCTA[]
  slots: string[]
  startDate: string | null
  endDate: string | null
}

function isActiveNow(promo: SanityPromotion): boolean {
  const now = new Date()
  if (promo.startDate && new Date(promo.startDate) > now) return false
  if (promo.endDate && new Date(promo.endDate) < now) return false
  return true
}

export default async function PromoBannerStrip() {
  if (!client) return null

  const promos: SanityPromotion[] = await client.fetch(ACTIVE_PROMOTIONS_QUERY)
  const promo = promos.find(
    (p) => p.slots.includes('banner-top') && isActiveNow(p),
  )

  if (!promo) return null

  return (
    <div className="bg-gradient-to-r from-deja-lime/90 to-deja-cyan/90 text-black text-center py-2 px-4 text-sm font-medium">
      <span>
        {promo.icon && <span className="mr-1">{promo.icon}</span>}
        <strong>{promo.title}</strong> — {promo.body}
        {promo.ctas.map((cta) => (
          <a
            key={cta.url}
            href={cta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold ml-2 hover:opacity-70 transition-opacity"
          >
            {cta.label}
          </a>
        ))}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Add to layout**

Modify `apps/dejajs-www/app/layout.tsx` — import the component:

```typescript
import PromoBannerStrip from '../components/PromoBannerStrip'
```

Add `<PromoBannerStrip />` at the top of the `<body>` content, before the navbar/header. The exact placement depends on the layout structure — put it as the very first visible element inside `<body>`.

- [ ] **Step 3: Verify it builds**

Run: `pnpm --filter=dejajs-www build`

Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add apps/dejajs-www/components/PromoBannerStrip.tsx apps/dejajs-www/app/layout.tsx
git commit -m "feat(www): add PromoBannerStrip for banner-top slot"
```

---

## Task 9: Seed Script

**Files:**
- Create: `scripts/push-promo.ts`
- Modify: `package.json` (root)

- [ ] **Step 1: Create the script**

Create `scripts/push-promo.ts`:

```typescript
/**
 * Push a promotion to both Firestore and Sanity.
 *
 * Usage:
 *   pnpm promo:push promotions/launch-support.json
 *   pnpm promo:deactivate launch-support
 *
 * Required env vars:
 *   - Firebase Admin: VITE_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *   - Sanity: SANITY_API_TOKEN, NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Timestamp } from 'firebase-admin/firestore'
import { db } from '@repo/firebase-config/firebase-admin-node'
import { createClient } from '@sanity/client'

// ─── Sanity Client ──────────────────────────────────────
const sanityToken = process.env.SANITY_API_TOKEN
const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'c6pxffpo'
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

let sanityClient: ReturnType<typeof createClient> | null = null
if (sanityToken) {
  sanityClient = createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: '2026-03-01',
    useCdn: false,
    token: sanityToken,
  })
}

// ─── Helpers ────────────────────────────────────────────

function parseDate(value: string | null): Timestamp | null {
  if (!value) return null
  return Timestamp.fromDate(new Date(value))
}

// ─── Deactivate Mode ────────────────────────────────────

async function deactivate(slug: string) {
  console.log(`Deactivating promotion: ${slug}`)

  // Firestore
  const ref = db.collection('promotions').doc(slug)
  const doc = await ref.get()
  if (doc.exists) {
    await ref.update({ active: false, updatedAt: Timestamp.now() })
    console.log(`  [ok] Firestore: deactivated`)
  } else {
    console.log(`  [skip] Firestore: document not found`)
  }

  // Sanity
  if (sanityClient) {
    const sanityDoc = await sanityClient.fetch(
      `*[_type == "promotion" && slug == $slug][0]{ _id }`,
      { slug },
    )
    if (sanityDoc) {
      await sanityClient.patch(sanityDoc._id).set({ active: false }).commit()
      console.log(`  [ok] Sanity: deactivated`)
    } else {
      console.log(`  [skip] Sanity: document not found`)
    }
  } else {
    console.log(`  [skip] Sanity: no SANITY_API_TOKEN`)
  }

  console.log('Done!')
}

// ─── Push Mode ──────────────────────────────────────────

async function push(filePath: string) {
  const absPath = resolve(filePath)
  const raw = readFileSync(absPath, 'utf-8')
  const promo = JSON.parse(raw)

  // Validate required fields
  const required = ['slug', 'title', 'body', 'variant', 'slots', 'ctas']
  for (const field of required) {
    if (!(field in promo)) {
      console.error(`ERROR: Missing required field "${field}" in ${filePath}`)
      process.exit(1)
    }
  }

  console.log(`Pushing promotion: ${promo.slug}`)

  // ── Firestore ──
  const firestoreDoc = {
    ...promo,
    startDate: parseDate(promo.startDate),
    endDate: parseDate(promo.endDate),
    active: promo.active ?? true,
    updatedAt: Timestamp.now(),
    createdAt: Timestamp.now(),
  }
  await db.collection('promotions').doc(promo.slug).set(firestoreDoc, { merge: true })
  console.log(`  [ok] Firestore: promotions/${promo.slug}`)

  // ── Sanity ──
  if (sanityClient) {
    const sanityDoc = {
      _id: `promotion-${promo.slug}`,
      _type: 'promotion' as const,
      slug: promo.slug,
      title: promo.title,
      body: promo.body,
      icon: promo.icon ?? null,
      variant: promo.variant,
      active: promo.active ?? true,
      startDate: promo.startDate ?? null,
      endDate: promo.endDate ?? null,
      slots: promo.slots,
      ctas: promo.ctas.map((cta: any, i: number) => ({
        _key: `cta-${i}`,
        ...cta,
      })),
    }
    await sanityClient.createOrReplace(sanityDoc)
    console.log(`  [ok] Sanity: promotion-${promo.slug}`)
  } else {
    console.log(`  [skip] Sanity: no SANITY_API_TOKEN (set SANITY_API_TOKEN to push to Sanity)`)
  }

  console.log('Done!')
}

// ─── CLI Entry ──────────────────────────────────────────

const args = process.argv.slice(2)

if (args.includes('--deactivate')) {
  const slug = args.find((a) => !a.startsWith('--'))
  if (!slug) {
    console.error('Usage: pnpm promo:deactivate <slug>')
    process.exit(1)
  }
  deactivate(slug).catch((err) => {
    console.error('Failed:', err)
    process.exit(1)
  })
} else {
  const filePath = args[0]
  if (!filePath) {
    console.error('Usage: pnpm promo:push <path-to-json>')
    process.exit(1)
  }
  push(filePath).catch((err) => {
    console.error('Failed:', err)
    process.exit(1)
  })
}
```

- [ ] **Step 2: Add root package.json scripts**

Add to root `package.json` scripts:

```json
"promo:push": "tsx scripts/push-promo.ts",
"promo:deactivate": "tsx scripts/push-promo.ts --deactivate"
```

- [ ] **Step 3: Verify script loads**

Run: `pnpm promo:push --help` (should show usage error, not a crash)

Expected: `Usage: pnpm promo:push <path-to-json>` error message (not a module/import error)

- [ ] **Step 4: Commit**

```bash
git add scripts/push-promo.ts package.json
git commit -m "feat: add promo push/deactivate seed script"
```

---

## Task 10: Launch Promo Content + README

**Files:**
- Create: `promotions/launch-support.json`
- Create: `promotions/README.md`

- [ ] **Step 1: Create the promo JSON**

Create `promotions/launch-support.json`:

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
      "url": "https://discord.gg/REPLACE_ME",
      "style": "primary"
    },
    {
      "label": "Email Support",
      "url": "mailto:support@dejajs.com",
      "style": "secondary"
    }
  ]
}
```

> ⚠️ Replace `https://discord.gg/REPLACE_ME` and `support@dejajs.com` with real values before pushing.

- [ ] **Step 2: Create the README**

Create `promotions/README.md`:

```markdown
# 📢 DEJA.js Promotions

Promotional content managed via JSON files, pushed to **Firestore** (Vue apps) and **Sanity** (dejajs-www) with a single command.

## Quick Start

```bash
# Push a promotion to both Firestore and Sanity
pnpm promo:push promotions/launch-support.json

# Deactivate a promotion (sets active: false)
pnpm promo:deactivate launch-support
```

### Required Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_PROJECT_ID` | Firebase project (already in `.env`) |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin service account key |
| `SANITY_API_TOKEN` | Sanity write token (optional — Sanity push is skipped if missing) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID (defaults to `c6pxffpo`) |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (defaults to `production`) |

## JSON Schema

```json
{
  "slug": "unique-slug",
  "title": "Promo Title",
  "body": "Short description shown to users.",
  "icon": "🚀",
  "variant": "info | success | launch | warning",
  "active": true,
  "startDate": "2026-04-01T00:00:00Z",
  "endDate": null,
  "slots": ["banner-top", "hero-section"],
  "ctas": [
    { "label": "Button Text", "url": "https://...", "style": "primary | secondary | ghost" }
  ]
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | ✅ | Unique ID, used as Firestore doc ID |
| `title` | string | ✅ | Headline text |
| `body` | string | ✅ | Description text |
| `icon` | string | — | Emoji or icon (e.g., `🚀`) |
| `variant` | string | ✅ | Visual style: `info`, `success`, `launch`, `warning` |
| `active` | boolean | — | Manual on/off (default: `true`) |
| `startDate` | ISO string | — | `null` = immediately active |
| `endDate` | ISO string | — | `null` = no expiration |
| `slots` | string[] | ✅ | Where to show: `banner-top`, `hero-section` |
| `ctas` | array | ✅ | Action buttons (label, url, style) |

## Placement Slots

| Slot | Where It Renders |
|------|-----------------|
| `banner-top` | Top banner in Cloud, Throttle, and dejajs-www (all pages) |
| `hero-section` | Rich card on dejajs-www homepage (between hero and quick start) |

## Variants

| Variant | Vuetify Color | Use For |
|---------|--------------|---------|
| `info` | Blue | General announcements |
| `success` | Green | Positive news, features |
| `launch` | Green | Launch promotions |
| `warning` | Orange | Urgent notices |
```

- [ ] **Step 3: Commit**

```bash
git add promotions/
git commit -m "feat: add launch-support promo content and README"
```

---

## Task 11: Push Launch Promo + Verify

- [ ] **Step 1: Update CTA URLs**

Edit `promotions/launch-support.json` with real Discord invite URL and support email.

- [ ] **Step 2: Push to Firestore + Sanity**

Run: `pnpm promo:push promotions/launch-support.json`

Expected:
```
Pushing promotion: launch-support
  [ok] Firestore: promotions/launch-support
  [ok] Sanity: promotion-launch-support
Done!
```

- [ ] **Step 3: Verify in Firebase Console**

Open Firebase Console → Firestore → `promotions` collection → confirm `launch-support` document exists with correct fields.

- [ ] **Step 4: Verify in Sanity Studio**

Open Sanity Studio (dejajs-www `/studio` route) → confirm `promotion` document appears with correct content.

- [ ] **Step 5: Test Cloud app**

Run: `pnpm --filter=deja-cloud dev`

Expected: Green promo banner appears below the trial banner with "🚀 **Free Installation Support** — ..." and Discord/Email CTA buttons.

- [ ] **Step 6: Test Throttle app**

Run: `pnpm --filter=deja-throttle dev`

Expected: Same green promo banner appears below the app header.

- [ ] **Step 7: Test dejajs-www**

Run: `pnpm --filter=dejajs-www dev`

Expected: Hero section promo appears between HeroSection and QuickStartSection. Banner strip appears at the very top of all pages.

- [ ] **Step 8: Final commit**

```bash
git add promotions/launch-support.json
git commit -m "feat: push launch-support promo with real URLs"
```

---

## Task 12: Firebase Security Rules

- [ ] **Step 1: Add Firestore rules for promotions collection**

Add to your Firestore security rules:

```
match /promotions/{promoId} {
  allow read: if true;
  allow write: if false;  // Admin SDK bypasses rules; no client writes needed
}
```

- [ ] **Step 2: Deploy rules**

Deploy via Firebase Console or CLI:

```bash
firebase deploy --only firestore:rules
```

- [ ] **Step 3: Commit rules file if local**

```bash
git add firestore.rules
git commit -m "feat: add Firestore rules for promotions collection"
```
