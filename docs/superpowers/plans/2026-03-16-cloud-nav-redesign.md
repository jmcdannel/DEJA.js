# Cloud App Left Nav Redesign — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Cloud app's left navigation to use Vercel-style grouped sections with muted section headers, neutral active states, and a pinned icon-only app switcher footer.

**Architecture:** Add an optional `section` field to the shared `MenuItem` type, update the cloud app's menu config with sections, then refactor `Menu.vue` to group items by section and replace the full-list suite links with an icon-only footer row. Backward compatibility for other apps using `Menu.vue` without sections is preserved via an `ungroupedItems` fallback.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Vuetify 3, Tailwind CSS, TypeScript strict mode

**Spec:** `docs/superpowers/specs/2026-03-16-cloud-nav-redesign.md`

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `packages/ui/src/Menu/types.ts` | Modify | Add optional `section` field to `MenuItem`; add `SuiteApp` interface |
| `apps/cloud/src/Core/Menu/useMenu.ts` | Modify | Add `section` to all 11 menu item definitions |
| `packages/ui/src/Menu/Menu.vue` | Modify | Grouped sections rendering, scoped CSS, icon-only footer |
| `apps/cloud/tailwind.config.js` | Modify | Add safelist for `text-{color}-500` dynamic icon classes |

---

## Task 1: Add `section` to the `MenuItem` type

**Files:**
- Modify: `packages/ui/src/Menu/types.ts`

- [ ] **Step 1: Update the type**

Open `packages/ui/src/Menu/types.ts`. Replace the entire file with:

```typescript
export interface MenuItem {
  color: string;
  icon: string;
  label: string;
  name: string;
  section?: 'modules' | 'hardware' | 'system';
  isFavorite?: boolean;
}

export interface SuiteApp {
  label: string;
  icon: string;
  href: string;
}
```

`section` is optional so other apps that pass menu items without sections continue to work.

- [ ] **Step 2: Verify type-check passes**

Run from repo root:
```bash
pnpm --filter=@repo/ui check-types
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/Menu/types.ts
git commit -m "feat(ui): add optional section field to MenuItem type"
```

---

## Task 2: Add `section` to cloud app menu items

**Files:**
- Modify: `apps/cloud/src/Core/Menu/useMenu.ts`

- [ ] **Step 1: Update all 11 menu items**

Open `apps/cloud/src/Core/Menu/useMenu.ts`. Replace the `menuConfig` array with the following (keeping `handleMenu` and `getMenuItem` functions unchanged):

```typescript
const menuConfig: MenuItem[] = [
  // Dashboard commented out — leave as-is
  // { label: 'Dashboard', icon: 'mdi-view-dashboard', color: 'violet' },

  // Modules
  { color: 'pink',    icon: 'mdi-train',           label: 'Roster',   name: 'roster',   section: 'modules' },
  { color: 'amber',   icon: 'mdi-call-split',      label: 'Turnouts', name: 'turnouts', section: 'modules' },
  { color: 'purple',  icon: 'mdi-map',             label: 'Routes',   name: 'routes',   section: 'modules' },
  { color: 'indigo',  icon: 'mdi-rocket-launch',   label: 'Effects',  name: 'effects',  section: 'modules' },
  { color: 'emerald', icon: 'mdi-traffic-light',   label: 'Signals',  name: 'signals',  section: 'modules' },
  { color: 'sky',     icon: 'mdi-volume-high',     label: 'Sounds',   name: 'sounds',   section: 'modules' },

  // Hardware
  { color: 'teal',    icon: 'mdi-access-point',    label: 'Sensors',  name: 'sensors',  section: 'hardware' },
  { color: 'cyan',    icon: 'mdi-developer-board', label: 'Devices',  name: 'devices',  section: 'hardware' },
  { color: 'lime',    icon: 'mdi-cpu-64-bit',      label: 'DCC-EX',   name: 'dcc-ex',   section: 'hardware' },

  // System
  { color: 'blue',    icon: 'mdi-cog',             label: 'Settings', name: 'settings', section: 'system' },
  { color: 'rose',    icon: 'mdi-console',         label: 'Emulator', name: 'emulator', section: 'system' },
]
```

- [ ] **Step 2: Verify type-check passes**

```bash
pnpm --filter=deja-cloud check-types
```
Expected: no errors (TypeScript should accept the optional `section` field).

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/Core/Menu/useMenu.ts
git commit -m "feat(cloud): add section grouping to menu items"
```

---

## Task 3: Safelist dynamic icon color classes in Tailwind

**Files:**
- Modify: `apps/cloud/tailwind.config.js`

**Why this matters:** `Menu.vue` uses `:class="\`text-${item.color}-500\`"` — a dynamic template expression. Tailwind's JIT compiler cannot statically detect these class names and will purge them from the production build. Adding a safelist ensures they are always included.

- [ ] **Step 1: Add the safelist**

Open `apps/cloud/tailwind.config.js`. Add a `safelist` array at the top level of the config object:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  safelist: [
    'text-pink-500',
    'text-amber-500',
    'text-purple-500',
    'text-indigo-500',
    'text-emerald-500',
    'text-sky-500',
    'text-teal-500',
    'text-cyan-500',
    'text-lime-500',
    'text-blue-500',
    'text-rose-500',
  ],
  presets: [require('../../packages/ui/src/tailwind/animation-preset').default],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          cyan: '#00E5FF',
          magenta: '#D500F9',
          lime: '#C6FF00',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(0, 229, 255, 0.4)',
        'glow-magenta': '0 0 15px -3px rgba(213, 0, 249, 0.4)',
        'glow-lime': '0 0 15px -3px rgba(198, 255, 0, 0.4)',
        'soft-dark': '0 10px 40px -10px rgba(0,0,0,0.5)',
      }
    },
    darkMode: 'class',
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/tailwind.config.js
git commit -m "feat(cloud): safelist dynamic icon color classes for Tailwind JIT"
```

---

## Task 4: Refactor Menu.vue — grouped sections + icon footer

**Files:**
- Modify: `packages/ui/src/Menu/Menu.vue`

This is the core change. Replace the flat item list and full-list suite links with grouped sections and an icon-only footer.

- [ ] **Step 1: Replace Menu.vue with the new implementation**

Replace the entire file content of `packages/ui/src/Menu/Menu.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useRoute } from 'vue-router'
import type { MenuItem, SuiteApp } from './types'

const props = defineProps<{
  drawer: boolean
  menu?: MenuItem[]
  temporary?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:drawer', value: boolean): void
  (e: 'handleMenu', item: MenuItem): void
}>()

const boundDrawer = computed({
  get: () => props.drawer,
  set: (val: boolean) => emit('update:drawer', val),
})

const { mobile } = useDisplay()
const route = useRoute()

function onHandleMenu(item: MenuItem) {
  emit('handleMenu', item)
  if (mobile.value) {
    emit('update:drawer', false)
  }
}

function isActive(item: MenuItem): boolean {
  return route.name === item.name
}

// Section grouping — order and labels are explicit constants
const SECTION_ORDER = ['modules', 'hardware', 'system'] as const
const SECTION_LABELS: Record<string, string> = {
  modules: 'Modules',
  hardware: 'Hardware',
  system: 'System',
}

// Items that have a section field — rendered as grouped sections
const groupedMenu = computed(() =>
  SECTION_ORDER
    .map(section => ({
      section,
      label: SECTION_LABELS[section],
      items: props.menu?.filter(item => item.section === section) ?? [],
    }))
    .filter(group => group.items.length > 0)
)

// Items without a section — rendered as a flat list for backward compat
const ungroupedItems = computed(() =>
  props.menu?.filter(item => !item.section) ?? []
)

// Pinned footer: icon-only links to other DEJA apps
// Monitor has no production URL — it runs locally alongside the server
const DEJA_SUITE_APPS: SuiteApp[] = [
  { label: 'Cloud',    icon: 'mdi-cloud',             href: 'https://cloud.dejajs.com/' },
  { label: 'Throttle', icon: 'mdi-train-variant',     href: 'https://throttle.dejajs.com/' },
  { label: 'Monitor',  icon: 'mdi-monitor-dashboard', href: 'http://localhost:4014/' },
  { label: 'Tour',     icon: 'mdi-map-marker-path',   href: 'https://www.dejajs.com/' },
]
</script>

<template>
  <v-navigation-drawer
    v-model="boundDrawer"
    :mobile="mobile"
    mobile-breakpoint="md"
    :temporary="temporary || mobile"
    class="bg-slate-900/95 backdrop-blur-sm"
  >
    <div class="flex flex-col h-full">
      <v-list density="compact" class="py-1">

        <!-- Grouped sections (items with section field) -->
        <template v-for="group in groupedMenu" :key="group.section">
          <div class="text-xs uppercase tracking-wider opacity-50 px-3 pt-4 pb-1">
            {{ group.label }}
          </div>
          <v-list-item
            v-for="item in group.items"
            :key="item.name"
            :active="false"
            :class="[
              'py-1 min-h-10 transition-colors duration-150',
              isActive(item) ? '!bg-white/10' : 'hover:!bg-white/5',
            ]"
            link
            @click="onHandleMenu(item)"
          >
            <template #prepend>
              <v-icon
                size="20"
                :class="`text-${item.color}-500 dark:text-${item.color}-400 stroke-none mr-3`"
              >
                {{ item.icon }}
              </v-icon>
            </template>
            <v-list-item-title :class="isActive(item) ? 'text-white' : ''">
              {{ item.label }}
            </v-list-item-title>
          </v-list-item>
        </template>

        <!-- Ungrouped flat list (backward compat for other apps) -->
        <v-list-item
          v-for="item in ungroupedItems"
          :key="item.name"
          :title="item.label"
          :color="item.color || 'primary'"
          :active="route.name === item.name"
          class="py-1 min-h-10"
          link
          @click="onHandleMenu(item)"
        >
          <template #prepend>
            <v-icon
              size="20"
              :class="`text-${item.color}-500 dark:text-${item.color}-400 stroke-none mr-3`"
            >
              {{ item.icon }}
            </v-icon>
          </template>
        </v-list-item>

      </v-list>

      <!-- Spacer pushes footer to bottom -->
      <div class="flex-1" />

      <!-- Pinned app switcher footer -->
      <div>
        <v-divider class="border-slate-700" />
        <div class="flex justify-around px-2 py-2">
          <v-tooltip
            v-for="app in DEJA_SUITE_APPS"
            :key="app.label"
            :text="app.label"
            location="end"
          >
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                variant="text"
                :icon="app.icon"
                :href="app.href"
                target="_blank"
                size="small"
              />
            </template>
          </v-tooltip>
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
/* Neutralize Vuetify's built-in hover and active overlays for grouped items.
   We apply our own Tailwind-based hover/active backgrounds instead. */
:deep(.v-list-item:hover > .v-list-item__overlay) {
  opacity: 0;
}
:deep(.v-list-item--active > .v-list-item__overlay) {
  opacity: 0;
}
</style>
```

- [ ] **Step 2: Run type-check on the UI package**

```bash
pnpm --filter=@repo/ui check-types
```
Expected: no errors.

- [ ] **Step 3: Run type-check on the cloud app**

```bash
pnpm --filter=deja-cloud check-types
```
Expected: no errors.

- [ ] **Step 4: Run lint**

```bash
pnpm --filter=@repo/ui lint
pnpm --filter=deja-cloud lint
```
Expected: no errors or warnings.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/Menu/Menu.vue
git commit -m "feat(ui): redesign nav with grouped sections and pinned app switcher"
```

---

## Task 5: Verify visually and finalize

- [ ] **Step 1: Start the cloud app dev server**

```bash
pnpm --filter=deja-cloud dev
```

Open the app in a browser. Sign in and navigate to the layout.

- [ ] **Step 2: Verify section headers appear**

In the nav drawer you should see:
- `MODULES` label above Roster, Turnouts, Routes, Effects, Signals, Sounds
- `HARDWARE` label above Sensors, Devices, DCC-EX
- `SYSTEM` label above Settings, Emulator

- [ ] **Step 3: Verify active state**

Click on different nav items. The active item should show a subtle semi-transparent white background (`bg-white/10`). The icon retains its per-item color. No colored background flash from Vuetify.

- [ ] **Step 4: Verify footer**

Scroll down or look at the bottom of the drawer. Four icon buttons (Cloud, Throttle, Monitor, Tour) should appear in a row. Hovering each shows a tooltip with the app name.

- [ ] **Step 5: Verify other apps are unaffected**

If you have the throttle or monitor apps available, confirm their nav still works (uses `ungroupedItems` fallback since those menu configs won't have `section` fields).

- [ ] **Step 6: Run full monorepo lint and type-check**

```bash
pnpm lint && pnpm check-types
```
Expected: clean.

- [ ] **Step 7: Create changeset**

Run `/changelog` to generate a changeset entry for this PR.

- [ ] **Step 8: Commit and open PR**

Run `/commit-push-pr` to push the branch and open a pull request.

---

## Rollback

If anything breaks, the changes are isolated to three files. Revert with:
```bash
git revert HEAD~4..HEAD
```
Or revert individual commits as needed. No schema changes, no data migrations, no new packages.
