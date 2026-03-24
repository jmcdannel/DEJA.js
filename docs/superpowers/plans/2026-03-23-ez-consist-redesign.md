# EZ Consist Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the EZ Consist UI in the throttle app with clearer direction indicators, streamlined editing, searchable loco picker, and "EZ Consist" branding.

**Architecture:** Five new Vue 3 components in `packages/ui/src/Consist/` replace the six existing ones. Leaf components (ConsistLeadCard, ConsistLocoCard, ConsistLocoPicker) are built first, then container components (ConsistEditor, ConsistIndicator). Data model and mutations are unchanged — all writes flow through `useLocos().updateConsist()`.

**Tech Stack:** Vue 3 (Composition API, `<script setup lang="ts">`), Vuetify 3, Tailwind CSS, Storybook, Firebase/Vuefire

**Spec:** `docs/superpowers/specs/2026-03-23-ez-consist-redesign-design.md`

**Key reference files:**
- Types: `packages/modules/locos/types.ts` — `ConsistLoco`, `Loco` interfaces
- Mutations: `packages/modules/locos/useLocos.ts` — `updateConsist(id, consist)`, `getLocos()`
- Constants: `packages/modules/locos/constants.ts` — `ROADNAMES` array
- Mock factories: `packages/ui/.storybook/mocks/data.ts` — `createLoco()`, `createConsistLoco()`

**Color constants used throughout:**
- Lead/purple: `#7c3aed` (bg), `rgba(124,58,237,0.1)` (card bg), `rgba(124,58,237,0.2)` (card border)
- Forward/green: `#059669` (bg), `rgba(5,150,105,0.1)` (card bg), `rgba(5,150,105,0.2)` (card border)
- Reversed/red: `#dc2626` (bg), `rgba(220,38,38,0.1)` (card bg), `rgba(220,38,38,0.2)` (card border)

---

### Task 1: ConsistLeadCard — Non-Editable Lead Loco Card

**Files:**
- Create: `packages/ui/src/Consist/ConsistLeadCard.vue`
- Create: `packages/ui/src/Consist/ConsistLeadCard.stories.ts`

This is a pure display component with no interactions. Build it first as a foundation.

- [ ] **Step 1: Create ConsistLeadCard.vue**

```vue
<script setup lang="ts">
import type { Loco } from '@repo/modules/locos'

defineProps<{
  loco: Loco
}>()
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-xl p-3"
    style="background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2)"
  >
    <span class="text-lg" style="color: #c4b5fd">◀</span>
    <v-avatar color="#7c3aed" size="40">
      <span class="text-white font-bold text-sm">{{ loco.address }}</span>
    </v-avatar>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-semibold text-slate-200 truncate">{{ loco.name }}</div>
      <div class="text-xs" style="color: #7c3aed">Lead Locomotive</div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Create ConsistLeadCard.stories.ts**

```typescript
import type { Meta, StoryObj } from '@storybook/vue3'
import ConsistLeadCard from './ConsistLeadCard.vue'
import { createLoco } from '../../.storybook/mocks/data'

const meta: Meta<typeof ConsistLeadCard> = {
  title: 'Consist/ConsistLeadCard',
  component: ConsistLeadCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConsistLeadCard>

export const Default: Story = {
  args: {
    loco: createLoco({ address: 23, name: 'BNSF 5801' }),
  },
}

export const LongName: Story = {
  args: {
    loco: createLoco({ address: 4014, name: 'Union Pacific Big Boy 4014 Steam Locomotive' }),
  },
}
```

- [ ] **Step 3: Verify in Storybook**

Run: `pnpm --filter=@repo/ui storybook` (or existing storybook command)
Expected: ConsistLeadCard renders with purple styling, ◀ arrow, avatar with address, name, and "Lead Locomotive" subtitle.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/Consist/ConsistLeadCard.vue packages/ui/src/Consist/ConsistLeadCard.stories.ts
git commit -m "feat(ui): add ConsistLeadCard component"
```

---

### Task 2: ConsistLocoCard — Expandable Member Card

**Files:**
- Create: `packages/ui/src/Consist/ConsistLocoCard.vue`
- Create: `packages/ui/src/Consist/ConsistLocoCard.stories.ts`

Leaf component with expand/collapse action bar. Color and arrow direction are determined by `cloco.direction`.

- [ ] **Step 1: Create ConsistLocoCard.vue**

```vue
<script setup lang="ts">
import type { ConsistLoco } from '@repo/modules/locos'

defineProps<{
  cloco: ConsistLoco
  expanded: boolean
}>()

defineEmits<{
  'toggle-expand': []
  flip: [cloco: ConsistLoco]
  trim: [cloco: ConsistLoco, delta: number]
  remove: [cloco: ConsistLoco]
}>()
</script>

<template>
  <div
    class="rounded-xl overflow-hidden cursor-pointer"
    :style="{
      background: cloco.direction ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)',
      border: `1px solid ${cloco.direction ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`,
    }"
  >
    <!-- Card header — tap to expand -->
    <div
      class="flex items-center gap-3 p-3"
      @click="$emit('toggle-expand')"
    >
      <!-- Forward: arrow left of avatar. Reversed: avatar left of arrow -->
      <template v-if="cloco.direction">
        <span class="text-lg" style="color: #6ee7b7">◀</span>
      </template>
      <v-avatar :color="cloco.direction ? '#059669' : '#dc2626'" size="40">
        <span class="text-white font-bold text-sm">{{ cloco.address }}</span>
      </v-avatar>
      <template v-if="!cloco.direction">
        <span class="text-lg" style="color: #fca5a5">▶</span>
      </template>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold text-slate-200 truncate">{{ cloco.address }}</div>
        <div class="text-xs" :style="{ color: cloco.direction ? '#34d399' : '#f87171' }">
          {{ cloco.direction ? 'Forward' : 'Reversed' }} • Trim: {{ cloco.trim }}
        </div>
      </div>
    </div>

    <!-- Expandable action bar -->
    <div
      v-if="expanded"
      class="flex items-center justify-around py-2 px-3"
      :style="{
        background: 'rgba(0,0,0,0.2)',
        borderTop: `1px solid ${cloco.direction ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`,
      }"
    >
      <!-- Flip -->
      <button
        class="flex flex-col items-center gap-0.5"
        @click.stop="$emit('flip', cloco)"
      >
        <span class="text-lg">🔄</span>
        <span class="text-[10px] text-gray-400">Flip</span>
      </button>

      <!-- Trim -->
      <div class="flex items-center gap-2">
        <button
          class="w-7 h-7 rounded-lg flex items-center justify-center text-red-400"
          style="background: rgba(255,255,255,0.1)"
          @click.stop="$emit('trim', cloco, -1)"
        >−</button>
        <div class="flex flex-col items-center">
          <span class="text-[10px] text-gray-400">Trim</span>
          <span class="text-base font-bold font-mono text-slate-200">{{ cloco.trim }}</span>
        </div>
        <button
          class="w-7 h-7 rounded-lg flex items-center justify-center text-green-400"
          style="background: rgba(255,255,255,0.1)"
          @click.stop="$emit('trim', cloco, 1)"
        >+</button>
      </div>

      <!-- Remove -->
      <button
        class="flex flex-col items-center gap-0.5"
        @click.stop="$emit('remove', cloco)"
      >
        <span class="text-lg text-red-400">🗑</span>
        <span class="text-[10px] text-red-400">Remove</span>
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Create ConsistLocoCard.stories.ts**

```typescript
import type { Meta, StoryObj } from '@storybook/vue3'
import ConsistLocoCard from './ConsistLocoCard.vue'
import { createConsistLoco } from '../../.storybook/mocks/data'

const meta: Meta<typeof ConsistLocoCard> = {
  title: 'Consist/ConsistLocoCard',
  component: ConsistLocoCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConsistLocoCard>

export const ForwardCollapsed: Story = {
  args: {
    cloco: createConsistLoco({ address: 17, direction: true, trim: 0 }),
    expanded: false,
  },
}

export const ForwardExpanded: Story = {
  args: {
    cloco: createConsistLoco({ address: 17, direction: true, trim: 0 }),
    expanded: true,
  },
}

export const ReversedCollapsed: Story = {
  args: {
    cloco: createConsistLoco({ address: 24, direction: false, trim: -2 }),
    expanded: false,
  },
}

export const ReversedExpanded: Story = {
  args: {
    cloco: createConsistLoco({ address: 24, direction: false, trim: -2 }),
    expanded: true,
  },
}

export const HighTrim: Story = {
  args: {
    cloco: createConsistLoco({ address: 50, direction: true, trim: 8 }),
    expanded: true,
  },
}
```

- [ ] **Step 3: Verify in Storybook**

Expected: Forward cards are green with ◀ arrow on left. Reversed cards are red with ▶ arrow on right. Expanded shows action bar with Flip, Trim ±, Remove.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/Consist/ConsistLocoCard.vue packages/ui/src/Consist/ConsistLocoCard.stories.ts
git commit -m "feat(ui): add ConsistLocoCard expandable member component"
```

---

### Task 3: ConsistLocoPicker — Search + Inline Direction Add

**Files:**
- Create: `packages/ui/src/Consist/ConsistLocoPicker.vue`
- Create: `packages/ui/src/Consist/ConsistLocoPicker.stories.ts`

The picker needs to import `ROADNAMES` from `@repo/modules/locos` for roadname color lookups. Search is a simple computed filter, no debounce needed.

- [ ] **Step 1: Create ConsistLocoPicker.vue**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ROADNAMES, type Loco } from '@repo/modules/locos'

const props = defineProps<{
  locos: Loco[]
  loco: Loco
}>()

defineEmits<{
  add: [address: number, direction: boolean]
  close: []
}>()

const search = ref('')

function getRoadnameColor(roadname: string | undefined): string {
  if (!roadname) return '#ec4899'
  return ROADNAMES.find(rn => rn.value === roadname)?.color || '#ec4899'
}

function getRoadnameLabel(roadname: string | undefined): string {
  if (!roadname) return 'Unknown'
  return ROADNAMES.find(rn => rn.value === roadname)?.label || roadname
}

function isInConsist(address: number): boolean {
  if (address === props.loco.address) return true
  return !!props.loco.consist?.some(c => c.address === address)
}

function isLead(address: number): boolean {
  return address === props.loco.address
}

const filteredLocos = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return props.locos
  return props.locos.filter(l =>
    l.address.toString().includes(q) ||
    l.name.toLowerCase().includes(q) ||
    (l.meta?.roadname?.toLowerCase().includes(q) ?? false)
  )
})
</script>

<template>
  <v-card class="bg-[#1e1b2e] h-full">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-purple-500/20">
      <h3 class="text-base font-semibold text-slate-200">Add to Consist</h3>
      <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('close')" />
    </div>

    <!-- Search -->
    <div class="px-4 pt-3 pb-2">
      <v-text-field
        v-model="search"
        placeholder="Search by name, address, or road..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="text-sm"
      />
    </div>

    <!-- Loco list -->
    <div class="px-4 pb-4 flex flex-col gap-1.5 overflow-y-auto max-h-[60vh]">
      <div
        v-for="aloco in filteredLocos"
        :key="aloco.address"
        class="flex items-center gap-2.5 py-2.5 px-3 rounded-lg"
        :class="isInConsist(aloco.address) ? 'opacity-35' : ''"
        :style="{
          background: isInConsist(aloco.address) ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isInConsist(aloco.address) ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)'}`,
        }"
      >
        <v-avatar
          :color="aloco.meta?.color || getRoadnameColor(aloco.meta?.roadname)"
          size="36"
        >
          <span class="text-white text-xs font-bold">{{ aloco.address }}</span>
        </v-avatar>
        <div class="flex-1 min-w-0">
          <div class="text-[13px] font-semibold text-slate-200 truncate">{{ aloco.name }}</div>
          <div class="text-[11px] text-gray-400" v-if="isInConsist(aloco.address)">
            {{ isLead(aloco.address) ? 'In consist (lead)' : 'Already in consist' }}
          </div>
          <div class="text-[11px] text-gray-400" v-else>
            {{ getRoadnameLabel(aloco.meta?.roadname) }}
          </div>
        </div>
        <div v-if="!isInConsist(aloco.address)" class="flex gap-1">
          <button
            class="h-9 px-2.5 rounded-lg flex items-center gap-1 text-xs font-semibold"
            style="background: rgba(5,150,105,0.2); border: 1px solid rgba(5,150,105,0.3); color: #34d399"
            @click="$emit('add', aloco.address, true)"
          >◀ Fwd</button>
          <button
            class="h-9 px-2.5 rounded-lg flex items-center gap-1 text-xs font-semibold"
            style="background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.25); color: #f87171"
            @click="$emit('add', aloco.address, false)"
          >Rev ▶</button>
        </div>
      </div>

      <!-- Empty search results -->
      <div v-if="filteredLocos.length === 0" class="text-center py-8 text-gray-500 text-sm">
        No locomotives match "{{ search }}"
      </div>
    </div>
  </v-card>
</template>
```

- [ ] **Step 2: Create ConsistLocoPicker.stories.ts**

```typescript
import type { Meta, StoryObj } from '@storybook/vue3'
import ConsistLocoPicker from './ConsistLocoPicker.vue'
import { createLoco, createConsistLoco } from '../../.storybook/mocks/data'

const meta: Meta<typeof ConsistLocoPicker> = {
  title: 'Consist/ConsistLocoPicker',
  component: ConsistLocoPicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConsistLocoPicker>

const roster = [
  createLoco({ address: 10, name: 'BNSF 1000', meta: { roadname: 'BNSF', color: '#b91c1c' } }),
  createLoco({ address: 11, name: 'BN 3511', meta: { roadname: 'Burlington Northern', color: '#15803d' } }),
  createLoco({ address: 17, name: 'Great Northern 17', meta: { roadname: 'Great Northern', color: '#059669' } }),
  createLoco({ address: 23, name: 'BNSF 5801', meta: { roadname: 'BNSF', color: '#b91c1c' } }),
  createLoco({ address: 25, name: 'CP 9625', meta: { roadname: 'Canadian Pacific', color: '#dc2626' } }),
]

const leadLoco = createLoco({
  address: 23,
  name: 'BNSF 5801',
  consist: [createConsistLoco({ address: 17, direction: true, trim: 0 })],
})

export const Default: Story = {
  args: {
    locos: roster,
    loco: leadLoco,
  },
}

export const EmptyRoster: Story = {
  args: {
    locos: [],
    loco: createLoco({ address: 23, name: 'BNSF 5801' }),
  },
}

export const NoConsistMembers: Story = {
  args: {
    locos: roster,
    loco: createLoco({ address: 23, name: 'BNSF 5801', consist: [] }),
  },
}
```

- [ ] **Step 3: Verify in Storybook**

Expected: Search bar filters locos. Lead loco (23) and already-added loco (17) are grayed out. Available locos show ◀ Fwd and Rev ▶ buttons in green/red.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/Consist/ConsistLocoPicker.vue packages/ui/src/Consist/ConsistLocoPicker.stories.ts
git commit -m "feat(ui): add ConsistLocoPicker with search and inline direction"
```

---

### Task 4: ConsistEditor — Full-Screen Panel

**Files:**
- Create: `packages/ui/src/Consist/ConsistEditor.vue`
- Create: `packages/ui/src/Consist/ConsistEditor.stories.ts`

Container component that orchestrates the lead card, member cards, and picker. Owns all mutation logic internally via `useLocos()`.

- [ ] **Step 1: Create ConsistEditor.vue**

This component internalizes all the mutation logic currently in `EditConsist.vue`. It calls `useLocos().getLocos()` for the roster and `useLocos().updateConsist()` for all mutations.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { type ConsistLoco, type Loco, useLocos } from '@repo/modules/locos'
import { createLogger } from '@repo/utils'
import ConsistLeadCard from './ConsistLeadCard.vue'
import ConsistLocoCard from './ConsistLocoCard.vue'
import ConsistLocoPicker from './ConsistLocoPicker.vue'

const log = createLogger('ConsistEditor')

const props = defineProps<{
  loco: Loco
}>()

defineEmits<{
  close: []
}>()

const { getLocos, updateConsist } = useLocos()
const locos = getLocos()

const expandedAddress = ref<number | null>(null)
const showPicker = ref(false)

function toggleExpand(address: number) {
  expandedAddress.value = expandedAddress.value === address ? null : address
}

async function handleFlip(cloco: ConsistLoco) {
  if (!props.loco.id) return
  const newConsist = (props.loco.consist || []).map(l =>
    l.address === cloco.address ? { ...l, direction: !l.direction } : l
  )
  log.debug('handleFlip', newConsist)
  await updateConsist(props.loco.id, newConsist)
}

async function handleTrim(cloco: ConsistLoco, delta: number) {
  if (!props.loco.id) return
  const newConsist = (props.loco.consist || []).map(l =>
    l.address === cloco.address ? { ...l, trim: l.trim + delta } : l
  )
  log.debug('handleTrim', newConsist)
  await updateConsist(props.loco.id, newConsist)
}

async function handleRemove(cloco: ConsistLoco) {
  if (!props.loco.id) return
  const newConsist = (props.loco.consist || []).filter(l => l.address !== cloco.address)
  log.debug('handleRemove', newConsist)
  await updateConsist(props.loco.id, newConsist)
  if (expandedAddress.value === cloco.address) {
    expandedAddress.value = null
  }
}

async function handleAddLoco(address: number, direction: boolean) {
  if (!props.loco.id) return
  const newLoco: ConsistLoco = { address, direction, trim: 0 }
  const newConsist = [...(props.loco.consist || []), newLoco]
  log.debug('handleAddLoco', newConsist)
  await updateConsist(props.loco.id, newConsist)
  showPicker.value = false
}

// Helper to get the direction-aware color for the consist bar badges
function badgeBg(cloco: ConsistLoco): string {
  return cloco.direction ? 'rgba(5,150,105,0.3)' : 'rgba(220,38,38,0.3)'
}
function badgeColor(cloco: ConsistLoco): string {
  return cloco.direction ? '#059669' : '#dc2626'
}
function arrowColor(cloco: ConsistLoco): string {
  return cloco.direction ? '#6ee7b7' : '#fca5a5'
}
</script>

<template>
  <!-- Main editor (when picker is closed) -->
  <v-card v-if="!showPicker" class="bg-[#1e1b2e] h-full">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-purple-500/20">
      <div>
        <h3 class="text-base font-semibold text-slate-200">EZ Consist</h3>
        <span class="text-[11px] opacity-60" style="color: #7c3aed">Software-based consisting by DEJA.js</span>
      </div>
      <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('close')" />
    </div>

    <!-- Consist visualization bar -->
    <div class="flex items-center gap-1.5 px-4 py-3" style="background: rgba(0,0,0,0.3)">
      <!-- Lead badge -->
      <div
        class="flex items-center gap-1 rounded-full py-1 pl-2.5 pr-1.5"
        style="background: rgba(124,58,237,0.3)"
      >
        <span class="text-xs" style="color: #c4b5fd">◀</span>
        <div
          class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style="background: #7c3aed"
        >{{ loco.address }}</div>
      </div>
      <!-- Member badges -->
      <div
        v-for="cloco in loco.consist"
        :key="cloco.address"
        class="flex items-center gap-1 rounded-full py-1"
        :class="cloco.direction ? 'pl-2.5 pr-1.5' : 'pl-1.5 pr-2.5'"
        :style="{ background: badgeBg(cloco) }"
      >
        <span v-if="cloco.direction" class="text-xs" :style="{ color: arrowColor(cloco) }">◀</span>
        <div
          class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
          :style="{ background: badgeColor(cloco) }"
        >{{ cloco.address }}</div>
        <span v-if="!cloco.direction" class="text-xs" :style="{ color: arrowColor(cloco) }">▶</span>
      </div>
    </div>

    <!-- Loco card list -->
    <div class="p-4 flex flex-col gap-2 overflow-y-auto">
      <!-- Lead card -->
      <ConsistLeadCard v-if="loco.consist?.length" :loco="loco" />

      <!-- Member cards -->
      <ConsistLocoCard
        v-for="cloco in loco.consist"
        :key="cloco.address"
        :cloco="cloco"
        :expanded="expandedAddress === cloco.address"
        @toggle-expand="toggleExpand(cloco.address)"
        @flip="handleFlip"
        @trim="handleTrim"
        @remove="handleRemove"
      />

      <!-- Add button -->
      <button
        class="w-full mt-1 py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
        style="background: rgba(139,92,246,0.15); border: 1px dashed rgba(139,92,246,0.4); color: #a78bfa"
        @click="showPicker = true"
      >
        <span class="text-lg">+</span> Add Locomotive
      </button>
    </div>
  </v-card>

  <!-- Picker (replaces editor content when open) -->
  <ConsistLocoPicker
    v-else
    :locos="(locos as Loco[])"
    :loco="loco"
    @add="handleAddLoco"
    @close="showPicker = false"
  />
</template>
```

- [ ] **Step 2: Create ConsistEditor.stories.ts**

```typescript
import type { Meta, StoryObj } from '@storybook/vue3'
import ConsistEditor from './ConsistEditor.vue'
import { createLoco, createConsistLoco } from '../../.storybook/mocks/data'

const meta: Meta<typeof ConsistEditor> = {
  title: 'Consist/ConsistEditor',
  component: ConsistEditor,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConsistEditor>

export const WithMembers: Story = {
  args: {
    loco: createLoco({
      address: 23,
      name: 'BNSF 5801',
      consist: [
        createConsistLoco({ address: 17, direction: true, trim: 0 }),
        createConsistLoco({ address: 24, direction: false, trim: -2 }),
      ],
    }),
  },
}

export const EmptyConsist: Story = {
  args: {
    loco: createLoco({ address: 23, name: 'BNSF 5801', consist: [] }),
  },
}

export const SingleMember: Story = {
  args: {
    loco: createLoco({
      address: 23,
      name: 'BNSF 5801',
      consist: [createConsistLoco({ address: 17, direction: true, trim: 3 })],
    }),
  },
}
```

- [ ] **Step 3: Verify in Storybook**

Expected: Header shows "EZ Consist" with subtitle. Consist bar shows badge chain. Lead card is purple, member cards are green/red. Add button visible at bottom. Note: `useLocos()` calls will be mocked by the existing storybook module mock — mutations won't persist but the UI should render.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/Consist/ConsistEditor.vue packages/ui/src/Consist/ConsistEditor.stories.ts
git commit -m "feat(ui): add ConsistEditor full-panel component"
```

---

### Task 5: ConsistIndicator — Always-Visible Badge Bar

**Files:**
- Create: `packages/ui/src/Consist/ConsistIndicator.vue`
- Create: `packages/ui/src/Consist/ConsistIndicator.stories.ts`

The top-level component used in `Throttle.vue`. Shows the badge bar and manages the editor dialog.

- [ ] **Step 1: Create ConsistIndicator.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { Loco, ConsistLoco } from '@repo/modules/locos'
import ConsistEditor from './ConsistEditor.vue'

defineProps<{
  loco: Loco
}>()

const editorOpen = ref(false)

// Badge color helpers
function badgeBg(cloco: ConsistLoco): string {
  return cloco.direction ? 'rgba(5,150,105,0.3)' : 'rgba(220,38,38,0.3)'
}
function badgeColor(cloco: ConsistLoco): string {
  return cloco.direction ? '#059669' : '#dc2626'
}
function arrowColor(cloco: ConsistLoco): string {
  return cloco.direction ? '#6ee7b7' : '#fca5a5'
}
</script>

<template>
  <!-- Badge bar -->
  <div
    class="flex items-center gap-1.5 py-2 px-3.5 rounded-2xl cursor-pointer overflow-x-auto"
    style="background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.25)"
    @click="editorOpen = true"
  >
    <!-- EZ label -->
    <span
      v-if="loco.consist?.length"
      class="text-[10px] font-semibold tracking-wide opacity-70 mr-0.5"
      style="color: #7c3aed"
    >EZ</span>
    <span
      v-else
      class="text-[11px] font-semibold tracking-wide opacity-60"
      style="color: #7c3aed"
    >EZ Consist</span>

    <!-- Lead loco badge (only when consist has members) -->
    <div
      v-if="loco.consist?.length"
      class="flex items-center gap-1 rounded-full py-1 pl-2.5 pr-1.5 flex-shrink-0"
      style="background: rgba(124,58,237,0.3)"
    >
      <span class="text-sm" style="color: #c4b5fd">◀</span>
      <div
        class="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
        style="background: #7c3aed"
      >{{ loco.address }}</div>
    </div>

    <!-- Member badges -->
    <div
      v-for="cloco in loco.consist"
      :key="cloco.address"
      class="flex items-center gap-1 rounded-full py-1 flex-shrink-0"
      :class="cloco.direction ? 'pl-2.5 pr-1.5' : 'pl-1.5 pr-2.5'"
      :style="{ background: badgeBg(cloco) }"
    >
      <span v-if="cloco.direction" class="text-sm" :style="{ color: arrowColor(cloco) }">◀</span>
      <div
        class="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold text-white"
        :style="{ background: badgeColor(cloco) }"
      >{{ cloco.address }}</div>
      <span v-if="!cloco.direction" class="text-sm" :style="{ color: arrowColor(cloco) }">▶</span>
    </div>

    <!-- Edit pencil -->
    <div
      class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] flex-shrink-0"
      :class="loco.consist?.length ? 'ml-0.5' : ''"
      style="background: rgba(139,92,246,0.3); color: #a78bfa"
    >
      <v-icon icon="mdi-pencil" size="14" />
    </div>
  </div>

  <!-- Editor dialog -->
  <v-dialog
    v-model="editorOpen"
    :fullscreen="$vuetify.display.smAndDown"
    max-width="480"
    transition="dialog-bottom-transition"
  >
    <ConsistEditor :loco="loco" @close="editorOpen = false" />
  </v-dialog>
</template>
```

- [ ] **Step 2: Create ConsistIndicator.stories.ts**

```typescript
import type { Meta, StoryObj } from '@storybook/vue3'
import ConsistIndicator from './ConsistIndicator.vue'
import { createLoco, createConsistLoco } from '../../.storybook/mocks/data'

const meta: Meta<typeof ConsistIndicator> = {
  title: 'Consist/ConsistIndicator',
  component: ConsistIndicator,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConsistIndicator>

export const WithMembers: Story = {
  args: {
    loco: createLoco({
      address: 23,
      name: 'BNSF 5801',
      consist: [
        createConsistLoco({ address: 17, direction: true, trim: 0 }),
        createConsistLoco({ address: 24, direction: false, trim: -2 }),
      ],
    }),
  },
}

export const EmptyConsist: Story = {
  args: {
    loco: createLoco({ address: 23, name: 'BNSF 5801', consist: [] }),
  },
}

export const NoConsist: Story = {
  args: {
    loco: createLoco({ address: 23, name: 'BNSF 5801', consist: undefined }),
  },
}

export const SingleMember: Story = {
  args: {
    loco: createLoco({
      address: 23,
      name: 'BNSF 5801',
      consist: [createConsistLoco({ address: 17, direction: true, trim: 0 })],
    }),
  },
}

export const LargeConsist: Story = {
  args: {
    loco: createLoco({
      address: 23,
      name: 'BNSF 5801',
      consist: [
        createConsistLoco({ address: 100, direction: true, trim: 0 }),
        createConsistLoco({ address: 200, direction: false, trim: -3 }),
        createConsistLoco({ address: 300, direction: true, trim: 5 }),
        createConsistLoco({ address: 400, direction: false, trim: 1 }),
        createConsistLoco({ address: 500, direction: true, trim: 0 }),
      ],
    }),
  },
}
```

- [ ] **Step 3: Verify in Storybook**

Expected: Badge bar shows "EZ" + lead badge + member badges with correct arrows/colors. Empty/undefined consist shows "EZ Consist" text. Large consist scrolls horizontally. Clicking opens the editor dialog.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/Consist/ConsistIndicator.vue packages/ui/src/Consist/ConsistIndicator.stories.ts
git commit -m "feat(ui): add ConsistIndicator badge bar with editor dialog"
```

---

### Task 6: Update Exports and Consumers

**Files:**
- Modify: `packages/ui/src/index.ts:7-9`
- Modify: `apps/throttle/src/throttle/Throttle.vue:11,64,87`
- Modify: `apps/throttle/src/throttle/SimpleThrottle.vue:6,41`

- [ ] **Step 1: Update `packages/ui/src/index.ts` exports**

Replace lines 7-9:
```typescript
// OLD:
export { default as Consist } from './Consist/Consist.vue'
export { default as EditConsist } from './Consist/EditConsist.vue'
export { default as MiniConsist } from './Consist/MiniConsist.vue'

// NEW:
export { default as ConsistIndicator } from './Consist/ConsistIndicator.vue'
export { default as ConsistEditor } from './Consist/ConsistEditor.vue'
```

Only `ConsistIndicator` and `ConsistEditor` need to be exported — the leaf components (`ConsistLeadCard`, `ConsistLocoCard`, `ConsistLocoPicker`) are internal to the Consist directory and imported directly by `ConsistEditor`.

- [ ] **Step 2: Update `apps/throttle/src/throttle/Throttle.vue`**

Line 11 — update import:
```typescript
// OLD:
import { Consist, LocoAvatar, MiniConsist, FunctionsSpeedDial } from '@repo/ui'

// NEW:
import { ConsistIndicator, LocoAvatar, FunctionsSpeedDial } from '@repo/ui'
```

Line 64 — remove MiniConsist from header:
```vue
<!-- OLD: -->
<MiniConsist v-if="loco" :loco="loco" />

<!-- REMOVE this line — ConsistIndicator replaces both Consist and MiniConsist -->
```

Line 87 — replace Consist with ConsistIndicator:
```vue
<!-- OLD: -->
<Consist v-if="loco" :loco="loco" />

<!-- NEW: -->
<ConsistIndicator v-if="loco" :loco="loco" />
```

- [ ] **Step 3: Update `apps/throttle/src/throttle/SimpleThrottle.vue`**

Line 6 — update import:
```typescript
// OLD:
import { LocoAvatar, MiniConsist } from '@repo/ui'

// NEW:
import { LocoAvatar, ConsistIndicator } from '@repo/ui'
```

Line 41 — replace component:
```vue
<!-- OLD: -->
<MiniConsist v-if="loco" :loco="loco" />

<!-- NEW: -->
<ConsistIndicator v-if="loco" :loco="loco" />
```

- [ ] **Step 4: Verify type-check passes**

Run: `pnpm check-types`
Expected: No errors related to Consist imports.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/index.ts apps/throttle/src/throttle/Throttle.vue apps/throttle/src/throttle/SimpleThrottle.vue
git commit -m "feat(throttle): wire up ConsistIndicator, replace old Consist imports"
```

---

### Task 7: Delete Old Components and Cleanup

**Files:**
- Delete: `packages/ui/src/Consist/Consist.vue`
- Delete: `packages/ui/src/Consist/EditConsist.vue`
- Delete: `packages/ui/src/Consist/MiniConsist.vue`
- Delete: `packages/ui/src/Consist/ConsistLoco.vue`
- Delete: `packages/ui/src/Consist/AddConsistLoco.vue`
- Delete: `packages/ui/src/Consist/LeadLoco.vue`
- Delete: `packages/ui/src/Consist/Consist.stories.ts`
- Delete: `packages/ui/src/Consist/EditConsist.stories.ts`
- Delete: `packages/ui/src/Consist/MiniConsist.stories.ts`
- Delete: `packages/ui/src/Consist/ConsistLoco.stories.ts`
- Delete: `packages/ui/src/Consist/AddConsistLoco.stories.ts`
- Delete: `packages/ui/src/Consist/LeadLoco.stories.ts`
- Modify: `apps/throttle/src/throttle/types.ts:11-14` — remove `ConsistSettingsProps`

- [ ] **Step 1: Delete old component files**

```bash
rm packages/ui/src/Consist/Consist.vue \
   packages/ui/src/Consist/EditConsist.vue \
   packages/ui/src/Consist/MiniConsist.vue \
   packages/ui/src/Consist/ConsistLoco.vue \
   packages/ui/src/Consist/AddConsistLoco.vue \
   packages/ui/src/Consist/LeadLoco.vue
```

- [ ] **Step 2: Delete old story files**

```bash
rm packages/ui/src/Consist/Consist.stories.ts \
   packages/ui/src/Consist/EditConsist.stories.ts \
   packages/ui/src/Consist/MiniConsist.stories.ts \
   packages/ui/src/Consist/ConsistLoco.stories.ts \
   packages/ui/src/Consist/AddConsistLoco.stories.ts \
   packages/ui/src/Consist/LeadLoco.stories.ts
```

- [ ] **Step 3: Remove orphaned `ConsistSettingsProps` from throttle types**

In `apps/throttle/src/throttle/types.ts`, remove lines 11-14:
```typescript
// REMOVE:
export interface ConsistSettingsProps {
  locos: Loco[]
  loco: Loco
}
```

Also check if the `Loco` import on line 1 is still needed after removing this interface. If `Throttle` interface doesn't use it, remove the import too.

- [ ] **Step 4: Verify type-check passes**

Run: `pnpm check-types`
Expected: No errors. No remaining references to deleted components.

- [ ] **Step 5: Verify lint passes**

Run: `pnpm lint`
Expected: No errors related to missing imports or unused references.

- [ ] **Step 6: Commit**

```bash
git add -A packages/ui/src/Consist/ apps/throttle/src/throttle/types.ts
git commit -m "chore(ui): delete old consist components and orphaned types"
```

---

### Task 8: EZ Consist Documentation (dejajs.com)

**Files:**
- Create: `docs/features/ez-consist/overview.mdx`

The documentation page for the dejajs.com docs site explaining EZ Consist to users.

- [ ] **Step 1: Check docs directory structure**

Run: `ls docs/features/ 2>/dev/null || ls docs/` to find the correct location for feature docs. If `docs/features/` doesn't exist, check the existing docs structure and adjust the path.

- [ ] **Step 2: Create `docs/features/ez-consist/overview.mdx`**

Write the MDX documentation covering all six sections from the spec:
1. What is EZ Consist?
2. How to Build a Consist (step-by-step)
3. Direction Explained (forward vs. reversed)
4. Trim Adjustment
5. Common Consist Patterns (standard, helper, mid-train, push-pull)
6. EZ Consist vs. DCC Consisting (comparison table)

Include placeholder image references for screenshots that will be captured with `/capture-screenshots` after the UI is built:
```mdx
![EZ Consist indicator](/screenshots/throttle_desktop_ez-consist-indicator.png)
```

- [ ] **Step 3: Commit**

```bash
git add docs/features/ez-consist/overview.mdx
git commit -m "docs: add EZ Consist user documentation"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Run full type-check**

Run: `pnpm check-types`
Expected: Clean pass, no errors.

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: Clean pass.

- [ ] **Step 3: Verify no remaining references to deleted components**

Search for any remaining imports of old component names:
```bash
grep -r "Consist\|EditConsist\|MiniConsist\|AddConsistLoco\|LeadLoco" --include="*.vue" --include="*.ts" apps/throttle/src/ packages/ui/src/
```
Expected: Only references should be to the new components (`ConsistIndicator`, `ConsistEditor`, `ConsistLocoCard`, `ConsistLocoPicker`, `ConsistLeadCard`). The cloud app (`apps/cloud/src/Roster/Consist/`) will still have old references — that's expected (out of scope).

- [ ] **Step 4: Dev server smoke test**

Run: `pnpm --filter=deja-throttle dev`
Open the throttle app and navigate to a loco's throttle view. Verify:
- ConsistIndicator badge bar renders in the center column
- Tapping opens the ConsistEditor dialog
- Add, flip, trim, remove all function correctly

- [ ] **Step 5: Commit any fixes and final commit**

If any issues were found and fixed, commit them. Then:
```bash
git log --oneline -10
```
Verify the commit history tells a clean story.
