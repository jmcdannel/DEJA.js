# Track Diagram Editor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a node-based track diagram editor in the cloud app that generates structured SVGs for interactive route maps, usable by both cloud and throttle apps.

**Architecture:** Vue Flow provides the drag-and-drop node editor canvas. Pre-made SVG templates (extracted from existing tam layout SVGs) are stamped at node positions to generate the output SVG. Firebase Storage hosts the generated SVG/CSS files. Claude Vision API handles image-to-diagram conversion.

**Tech Stack:** Vue 3, Vue Flow, Vuetify 3, TypeScript, Firebase Firestore + Storage, Anthropic Claude API

**Spec:** `docs/superpowers/specs/2026-03-11-track-diagram-editor-design.md`

---

## File Structure

### New Files

```
packages/modules/trackDiagrams/
  types.ts                          # TrackDiagram, TrackDiagramNode, TrackDiagramEdge interfaces
  useTrackDiagrams.ts               # Firestore CRUD composable
  constants.ts                      # Node type definitions, default styles
  index.ts                          # Barrel export

packages/firebase-config/src/
  storage.ts                        # Firebase Storage initialization

apps/cloud/src/TrackDiagram/
  TrackDiagram.vue                  # Page shell -- list diagrams + create
  TrackDiagramList.vue              # VueFire collection list
  TrackDiagramListItem.vue          # Individual diagram card
  AddTrackDiagram.vue               # Create page
  EditTrackDiagram.vue              # Edit page (loads diagram, shows editor)
  TrackDiagramEditor.vue            # VueFlow canvas + toolbar + properties panel
  TrackDiagramPreview.vue           # Live SVG preview (reads generated SVG)
  TrackDiagramToolbar.vue           # Add node/edge tool palette
  TrackDiagramProperties.vue        # Property panel for selected node/edge
  TrackDiagramAIImport.vue          # AI image upload wizard (Phase 3)
  nodes/
    StationNode.vue                 # Custom VueFlow node -- route endpoint
    TurnoutNode.vue                 # Custom VueFlow node -- turnout with handles
    WaypointNode.vue                # Custom VueFlow node -- track routing point
  edges/
    TrackEdge.vue                   # Custom VueFlow edge -- colored track segment
  composables/
    useTrackDiagramEditor.ts        # Editor state (selected node, tool mode, etc.)
    useTrackDiagramSvg.ts           # Template-based SVG generation pipeline
    useTrackDiagramCss.ts           # CSS generation (route-styles pattern)
    useTrackDiagramStorage.ts       # Firebase Storage upload/download
    useTrackDiagramAI.ts            # Claude Vision API (Phase 3)
  templates/
    svgTemplates.ts                 # SVG fragment strings for turnout fork, label, route marker
  types.ts                          # Cloud-app-specific types (editor state, tool modes)
  constants.ts                      # Editor defaults (grid size, colors, node dimensions)
```

### Modified Files

```
packages/firebase-config/src/firebase.ts     # Add getStorage re-export
packages/modules/index.ts                    # Export trackDiagrams module
apps/cloud/src/router.ts                     # Add /track-diagrams routes
apps/cloud/src/Core/Menu/useMenu.ts          # Add Track Diagrams menu item
apps/cloud/package.json                      # Add @vue-flow/* dependencies
```

---

## Chunk 1: Foundation (Shared Module + Firebase Storage)

### Task 1: Add Firebase Storage to firebase-config

**Files:**
- Create: `packages/firebase-config/src/storage.ts`
- Modify: `packages/firebase-config/src/firebase.ts`

- [ ] **Step 1: Create storage.ts**

```typescript
// packages/firebase-config/src/storage.ts
import { getStorage } from 'firebase/storage'
import { firebaseApp } from './firebase'

export const storage = getStorage(firebaseApp)
```

- [ ] **Step 2: Re-export from firebase.ts**

Add to `packages/firebase-config/src/firebase.ts`:

```typescript
export { storage } from './storage'
```

- [ ] **Step 3: Verify build**

Run: `pnpm --filter @repo/firebase-config build` (or `pnpm check-types` if no build script)
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/firebase-config/src/storage.ts packages/firebase-config/src/firebase.ts
git commit -m "feat(firebase-config): add Firebase Storage export"
```

---

### Task 2: Create @repo/modules/trackDiagrams types

**Files:**
- Create: `packages/modules/trackDiagrams/types.ts`

- [ ] **Step 1: Write types**

```typescript
// packages/modules/trackDiagrams/types.ts
import type { Timestamp } from 'firebase/firestore'

export interface TrackDiagramNodeData {
  turnoutId?: string
  routePointId?: string
  trackLine?: string
  color?: string
}

export interface TrackDiagramNode {
  id: string
  type: 'station' | 'turnout' | 'waypoint'
  label: string
  position: { x: number; y: number }
  rotation: number
  data: TrackDiagramNodeData
}

export interface TrackDiagramEdgeData {
  trackLine: string
  color: string
  strokeWidth: number
  pathType: 'straight' | 'curve'
}

export interface TrackDiagramEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  data: TrackDiagramEdgeData
}

export interface TrackDiagram {
  id: string
  name: string
  layoutId: string
  nodes: TrackDiagramNode[]
  edges: TrackDiagramEdge[]
  viewBox: { width: number; height: number }
  svgUrl?: string
  cssUrl?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type TrackDiagramInput = Omit<TrackDiagram, 'id'>
```

- [ ] **Step 2: Commit**

```bash
git add packages/modules/trackDiagrams/types.ts
git commit -m "feat(modules): add trackDiagrams type definitions"
```

---

### Task 3: Create @repo/modules/trackDiagrams constants

**Files:**
- Create: `packages/modules/trackDiagrams/constants.ts`

- [ ] **Step 1: Write constants**

```typescript
// packages/modules/trackDiagrams/constants.ts
export const trackDiagramType = {
  value: 'trackDiagram',
  label: 'Track Diagram',
  icon: 'mdi-map-marker-path',
  color: 'indigo',
} as const

export const NODE_TYPES = {
  STATION: 'station',
  TURNOUT: 'turnout',
  WAYPOINT: 'waypoint',
} as const

export const DEFAULT_VIEWBOX = { width: 920, height: 480 }

export const DEFAULT_TRACK_COLORS: Record<string, string> = {
  Mainline: 'rgb(242,94,13)',
  Yard: 'rgb(143,217,38)',
  Storage: 'rgb(228,13,242)',
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/modules/trackDiagrams/constants.ts
git commit -m "feat(modules): add trackDiagrams constants"
```

---

### Task 4: Create useTrackDiagrams composable

**Files:**
- Create: `packages/modules/trackDiagrams/useTrackDiagrams.ts`

Reference pattern: `packages/modules/routes/useRoutes.ts`

- [ ] **Step 1: Write composable**

```typescript
// packages/modules/trackDiagrams/useTrackDiagrams.ts
import { collection, deleteDoc, doc, getDoc, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'
import type { TrackDiagram, TrackDiagramInput } from './types'

const log = createLogger('TrackDiagrams')

export const useTrackDiagrams = () => {
  const layoutId = useStorage<string | null>('@DEJA/layoutId', null)

  const trackDiagramsCol = () => {
    if (!layoutId.value) return null
    return query(
      collection(db, `layouts/${layoutId.value}/trackDiagrams`),
      orderBy('name')
    )
  }

  function getTrackDiagrams() {
    return useCollection<TrackDiagram>(trackDiagramsCol, { ssrKey: 'trackDiagrams' })
  }

  async function getTrackDiagram(id: string): Promise<TrackDiagram | undefined> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return
    }
    try {
      const docRef = doc(db, `layouts/${layoutId.value}/trackDiagrams`, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as TrackDiagram
      }
    } catch (error) {
      log.error('Error fetching track diagram:', error)
    }
  }

  async function setTrackDiagram(diagramId: string, diagram: TrackDiagramInput): Promise<boolean> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return false
    }
    try {
      await setDoc(
        doc(db, `layouts/${layoutId.value}/trackDiagrams`, diagramId),
        { ...diagram, id: diagramId, updatedAt: serverTimestamp() },
        { merge: true }
      )
      return true
    } catch (error) {
      log.error('Error saving track diagram:', error)
      return false
    }
  }

  async function deleteTrackDiagram(diagramId: string): Promise<void> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return
    }
    try {
      await deleteDoc(doc(db, `layouts/${layoutId.value}/trackDiagrams`, diagramId))
    } catch (error) {
      log.error('Error deleting track diagram:', error)
    }
  }

  return {
    getTrackDiagrams,
    getTrackDiagram,
    setTrackDiagram,
    deleteTrackDiagram,
    trackDiagramsCol,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/modules/trackDiagrams/useTrackDiagrams.ts
git commit -m "feat(modules): add useTrackDiagrams composable"
```

---

### Task 5: Create barrel export and wire into modules/index.ts

**Files:**
- Create: `packages/modules/trackDiagrams/index.ts`
- Modify: `packages/modules/index.ts`

- [ ] **Step 1: Write barrel export**

```typescript
// packages/modules/trackDiagrams/index.ts
export * from './types.js'
export * from './constants.js'
export { useTrackDiagrams } from './useTrackDiagrams.js'
```

- [ ] **Step 2: Add to modules/index.ts**

Add these lines to `packages/modules/index.ts`:

```typescript
export * from './trackDiagrams/index.js'
```

- [ ] **Step 3: Verify types compile**

Run: `pnpm check-types`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add packages/modules/trackDiagrams/index.ts packages/modules/index.ts
git commit -m "feat(modules): export trackDiagrams module"
```

---

## Chunk 2: Cloud App CRUD (List, Add, Edit pages)

### Task 6: Install Vue Flow dependencies

**Files:**
- Modify: `apps/cloud/package.json`

- [ ] **Step 1: Install packages**

```bash
pnpm --filter deja-cloud add @vue-flow/core @vue-flow/background @vue-flow/controls @vue-flow/minimap
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/package.json pnpm-lock.yaml
git commit -m "deps(cloud): add Vue Flow packages"
```

---

### Task 7: Create TrackDiagram list page

**Files:**
- Create: `apps/cloud/src/TrackDiagram/TrackDiagram.vue`
- Create: `apps/cloud/src/TrackDiagram/TrackDiagramList.vue`
- Create: `apps/cloud/src/TrackDiagram/TrackDiagramListItem.vue`

Reference: `apps/cloud/src/Routes/Routes.vue`, `RoutesList.vue`, `RouteListItem.vue`

- [ ] **Step 1: Create TrackDiagram.vue**

```vue
<!-- apps/cloud/src/TrackDiagram/TrackDiagram.vue -->
<script setup lang="ts">
import type { TrackDiagram } from '@repo/modules'
import { useRouter } from 'vue-router'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import TrackDiagramList from '@/TrackDiagram/TrackDiagramList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()

function handleEdit(diagram: TrackDiagram) {
  router.push({ name: 'Edit Track Diagram', params: { diagramId: diagram.id } })
}

function handleAdd() {
  router.push({ name: 'Add Track Diagram' })
}
</script>
<template>
  <ModuleTitle menu="Track Diagrams" />
  <TrackDiagramList @edit="handleEdit">
    <template #prepend>
      <AddTile @click="handleAdd" color="indigo" />
    </template>
  </TrackDiagramList>
</template>
```

- [ ] **Step 2: Create TrackDiagramList.vue**

```vue
<!-- apps/cloud/src/TrackDiagram/TrackDiagramList.vue -->
<script async setup lang="ts">
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { useCollection } from 'vuefire'
import type { TrackDiagram } from '@repo/modules'
import { useTrackDiagrams } from '@repo/modules/trackDiagrams/useTrackDiagrams'
import TrackDiagramListItem from '@/TrackDiagram/TrackDiagramListItem.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const emit = defineEmits(['edit'])
const { trackDiagramsCol } = useTrackDiagrams()
const list = useCollection<TrackDiagram>(trackDiagramsCol, { ssrKey: 'trackDiagrams' })

function handleEdit(item: TrackDiagram) {
  emit('edit', item)
}
</script>
<template>
  <v-container v-if="list?.length">
    <v-row v-auto-animate>
      <v-col cols="12"><slot name="prepend" /></v-col>
      <v-col
        v-for="item in list"
        :key="item.id"
        cols="12" sm="6" lg="4"
      >
        <TrackDiagramListItem :diagram="item" @edit="handleEdit" />
      </v-col>
    </v-row>
  </v-container>
  <EmptyState
    v-if="!list?.length"
    icon="mdi-map-marker-path"
    color="indigo"
    title="No Track Diagrams"
    description="Create visual track diagrams for your layout. Draw tracks, turnouts, and route endpoints that power interactive route maps."
    :use-cases="[
      { icon: 'mdi-pencil-ruler', text: 'Visual layout editor' },
      { icon: 'mdi-map', text: 'Interactive route maps' },
      { icon: 'mdi-robot', text: 'AI image import' },
    ]"
    action-label="Create Diagram"
    action-to="/track-diagrams/new"
  />
</template>
```

- [ ] **Step 3: Create TrackDiagramListItem.vue**

```vue
<!-- apps/cloud/src/TrackDiagram/TrackDiagramListItem.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { trackDiagramType, type TrackDiagram } from '@repo/modules'
import { useTrackDiagrams } from '@repo/modules/trackDiagrams/useTrackDiagrams'

const { deleteTrackDiagram } = useTrackDiagrams()

const props = defineProps<{ diagram: TrackDiagram }>()
defineEmits(['edit'])

const confirmDelete = ref(false)
const color = computed(() => props.diagram.color || trackDiagramType.color)

async function handleDelete() {
  if (!props.diagram.id) return
  await deleteTrackDiagram(props.diagram.id)
  confirmDelete.value = false
}
</script>
<template>
  <v-card class="mx-auto w-full h-full flex flex-col justify-between" :color="color" variant="tonal" density="compact">
    <template #title>
      <span class="text-md">{{ diagram.name }}</span>
    </template>
    <template #prepend>
      <v-icon :icon="trackDiagramType.icon" class="text-2xl m-3" />
    </template>
    <v-card-text class="min-h-8 flex py-2">
      <v-chip v-if="diagram.nodes?.length" size="small" class="mr-2">{{ diagram.nodes.length }} nodes</v-chip>
      <v-chip v-if="diagram.edges?.length" size="small">{{ diagram.edges.length }} edges</v-chip>
    </v-card-text>
    <v-spacer />
    <v-card-actions>
      <v-btn v-if="!confirmDelete" icon="mdi-delete" variant="tonal" size="small" @click="confirmDelete = true" />
      <template v-else>
        <v-btn text="Cancel" variant="outlined" size="small" @click="confirmDelete = false" />
        <v-btn text="Confirm" variant="tonal" size="small" prepend-icon="mdi-delete" @click="handleDelete" />
      </template>
      <v-spacer />
      <v-btn text="Edit" variant="tonal" prepend-icon="mdi-pencil" size="small" @click="$emit('edit', diagram)" />
    </v-card-actions>
  </v-card>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add apps/cloud/src/TrackDiagram/TrackDiagram.vue apps/cloud/src/TrackDiagram/TrackDiagramList.vue apps/cloud/src/TrackDiagram/TrackDiagramListItem.vue
git commit -m "feat(cloud): add track diagram list pages"
```

---

### Task 8: Create Add/Edit pages

**Files:**
- Create: `apps/cloud/src/TrackDiagram/AddTrackDiagram.vue`
- Create: `apps/cloud/src/TrackDiagram/EditTrackDiagram.vue`

Reference: `apps/cloud/src/Routes/AddRoute.vue`, `EditRoute.vue`

- [ ] **Step 1: Create AddTrackDiagram.vue**

```vue
<!-- apps/cloud/src/TrackDiagram/AddTrackDiagram.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { trackDiagramType, DEFAULT_VIEWBOX, type TrackDiagram } from '@repo/modules'
import { useTrackDiagrams } from '@repo/modules/trackDiagrams/useTrackDiagrams'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import { slugify } from '@repo/utils/slugify'
import { ref } from 'vue'

const router = useRouter()
const layoutId = useStorage<string | null>('@DEJA/layoutId', null)
const { setTrackDiagram } = useTrackDiagrams()
const name = ref('')
const loading = ref(false)

async function handleCreate() {
  if (!name.value || !layoutId.value) return
  loading.value = true
  const id = slugify(name.value)
  const diagram: Omit<TrackDiagram, 'id'> = {
    name: name.value,
    layoutId: layoutId.value,
    nodes: [],
    edges: [],
    viewBox: DEFAULT_VIEWBOX,
  }
  const success = await setTrackDiagram(id, diagram)
  loading.value = false
  if (success) {
    router.push({ name: 'Edit Track Diagram', params: { diagramId: id } })
  }
}
</script>
<template>
  <ModuleTitle menu="Track Diagrams" />
  <v-container>
    <v-card max-width="600" class="mx-auto" variant="tonal" color="indigo">
      <v-card-title>
        <v-icon :icon="trackDiagramType.icon" class="mr-2" />
        New Track Diagram
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="name" label="Diagram Name" variant="outlined" autofocus />
      </v-card-text>
      <v-card-actions>
        <v-btn text="Cancel" variant="outlined" @click="router.push({ name: 'Track Diagrams' })" />
        <v-spacer />
        <v-btn text="Create & Edit" color="indigo" :loading="loading" :disabled="!name" @click="handleCreate" />
      </v-card-actions>
    </v-card>
  </v-container>
</template>
```

- [ ] **Step 2: Create EditTrackDiagram.vue**

```vue
<!-- apps/cloud/src/TrackDiagram/EditTrackDiagram.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLogger } from '@repo/utils'
import type { TrackDiagram } from '@repo/modules'
import { useTrackDiagrams } from '@repo/modules/trackDiagrams/useTrackDiagrams'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import TrackDiagramEditor from '@/TrackDiagram/TrackDiagramEditor.vue'

const log = createLogger('EditTrackDiagram')
const route = useRoute()
const router = useRouter()
const { getTrackDiagram } = useTrackDiagrams()
const diagram = ref<TrackDiagram | null>(null)
const loading = ref(true)

async function loadDiagram() {
  loading.value = true
  const diagramId = route.params.diagramId as string
  try {
    const result = await getTrackDiagram(diagramId)
    if (result) {
      diagram.value = result
    }
  } catch (error) {
    log.error('Error loading diagram:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadDiagram)
</script>
<template>
  <ModuleTitle menu="Track Diagrams" />
  <div v-if="loading" class="p-6 flex justify-center">
    <v-progress-circular indeterminate color="indigo" />
  </div>
  <v-alert v-else-if="!diagram" type="error" class="ma-4" text="Diagram not found." closable @click:close="router.push({ name: 'Track Diagrams' })" />
  <TrackDiagramEditor v-else-if="diagram" :diagram="diagram" />
</template>
```

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/TrackDiagram/AddTrackDiagram.vue apps/cloud/src/TrackDiagram/EditTrackDiagram.vue
git commit -m "feat(cloud): add/edit track diagram pages"
```

---

### Task 9: Add routes and menu item

**Files:**
- Modify: `apps/cloud/src/router.ts`
- Modify: `apps/cloud/src/Core/Menu/useMenu.ts`

- [ ] **Step 1: Add routes to router.ts**

Add after the existing routes block (near the `/routes` entries). Use the same `beforeEnter` guards:

```typescript
{
  path: '/track-diagrams',
  name: 'Track Diagrams',
  component: () => import('./TrackDiagram/TrackDiagram.vue'),
  beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
},
{
  path: '/track-diagrams/new',
  name: 'Add Track Diagram',
  component: () => import('./TrackDiagram/AddTrackDiagram.vue'),
  beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
},
{
  path: '/track-diagrams/:diagramId',
  name: 'Edit Track Diagram',
  component: () => import('./TrackDiagram/EditTrackDiagram.vue'),
  beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
},
```

- [ ] **Step 2: Add menu item to useMenu.ts**

Add to the `menuConfig` array (after Routes):

```typescript
{
  color: 'indigo',
  icon: 'mdi-map-marker-path',
  label: 'Track Diagrams',
  name: 'track-diagrams',
},
```

- [ ] **Step 3: Verify cloud app loads**

Run: `pnpm --filter deja-cloud dev`
Navigate to `/track-diagrams` — should show empty state.

- [ ] **Step 4: Commit**

```bash
git add apps/cloud/src/router.ts apps/cloud/src/Core/Menu/useMenu.ts
git commit -m "feat(cloud): add track diagram routes and menu item"
```

---

## Chunk 3: Vue Flow Editor

### Task 10: Create editor state composable

**Files:**
- Create: `apps/cloud/src/TrackDiagram/composables/useTrackDiagramEditor.ts`
- Create: `apps/cloud/src/TrackDiagram/types.ts`
- Create: `apps/cloud/src/TrackDiagram/constants.ts`

- [ ] **Step 1: Create local types**

```typescript
// apps/cloud/src/TrackDiagram/types.ts
export type ToolMode = 'select' | 'station' | 'turnout' | 'waypoint' | 'edge'

export interface EditorState {
  toolMode: ToolMode
  selectedNodeId: string | null
  selectedEdgeId: string | null
  gridSnap: boolean
  gridSize: number
}
```

- [ ] **Step 2: Create local constants**

```typescript
// apps/cloud/src/TrackDiagram/constants.ts
import { NODE_TYPES, DEFAULT_TRACK_COLORS } from '@repo/modules'

export const GRID_SIZE = 20
export const NODE_WIDTH = 120
export const NODE_HEIGHT = 40
export const TURNOUT_WIDTH = 80
export const TURNOUT_HEIGHT = 60

export const TOOL_OPTIONS = [
  { mode: 'select' as const, icon: 'mdi-cursor-default', label: 'Select' },
  { mode: 'station' as const, icon: 'mdi-map-marker', label: 'Station' },
  { mode: 'turnout' as const, icon: 'mdi-call-split', label: 'Turnout' },
  { mode: 'waypoint' as const, icon: 'mdi-circle-small', label: 'Waypoint' },
] as const

export { DEFAULT_TRACK_COLORS }
```

- [ ] **Step 3: Create editor composable**

```typescript
// apps/cloud/src/TrackDiagram/composables/useTrackDiagramEditor.ts
import { ref, computed } from 'vue'
import type { ToolMode } from '../types'
import { GRID_SIZE } from '../constants'

const toolMode = ref<ToolMode>('select')
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)
const gridSnap = ref(true)
const gridSize = ref(GRID_SIZE)
const isDirty = ref(false)

export const useTrackDiagramEditor = () => {
  function setToolMode(mode: ToolMode) {
    toolMode.value = mode
  }

  function selectNode(id: string | null) {
    selectedNodeId.value = id
    selectedEdgeId.value = null
  }

  function selectEdge(id: string | null) {
    selectedEdgeId.value = id
    selectedNodeId.value = null
  }

  function snapToGrid(value: number): number {
    if (!gridSnap.value) return value
    return Math.round(value / gridSize.value) * gridSize.value
  }

  function markDirty() {
    isDirty.value = true
  }

  function markClean() {
    isDirty.value = false
  }

  return {
    toolMode,
    selectedNodeId,
    selectedEdgeId,
    gridSnap,
    gridSize,
    isDirty,
    setToolMode,
    selectNode,
    selectEdge,
    snapToGrid,
    markDirty,
    markClean,
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/cloud/src/TrackDiagram/composables/useTrackDiagramEditor.ts apps/cloud/src/TrackDiagram/types.ts apps/cloud/src/TrackDiagram/constants.ts
git commit -m "feat(cloud): add track diagram editor state composable"
```

---

### Task 11: Create custom VueFlow nodes

**Files:**
- Create: `apps/cloud/src/TrackDiagram/nodes/StationNode.vue`
- Create: `apps/cloud/src/TrackDiagram/nodes/TurnoutNode.vue`
- Create: `apps/cloud/src/TrackDiagram/nodes/WaypointNode.vue`

- [ ] **Step 1: Create StationNode.vue**

```vue
<!-- apps/cloud/src/TrackDiagram/nodes/StationNode.vue -->
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { TrackDiagramNodeData } from '@repo/modules'

const props = defineProps<{
  id: string
  data: TrackDiagramNodeData & { label: string }
}>()
</script>
<template>
  <div class="station-node rounded-lg border-2 border-green-500 bg-green-900/60 px-3 py-2 text-white text-xs font-bold min-w-[80px] text-center">
    <div>{{ data.label || 'Station' }}</div>
    <div v-if="data.routePointId" class="text-green-300 text-[10px]">{{ data.routePointId }}</div>
    <Handle type="target" :position="Position.Left" class="!bg-green-400" />
    <Handle type="source" :position="Position.Right" class="!bg-green-400" />
  </div>
</template>
```

- [ ] **Step 2: Create TurnoutNode.vue**

```vue
<!-- apps/cloud/src/TrackDiagram/nodes/TurnoutNode.vue -->
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { TrackDiagramNodeData } from '@repo/modules'

const props = defineProps<{
  id: string
  data: TrackDiagramNodeData & { label: string; rotation: number }
}>()
</script>
<template>
  <div class="turnout-node rounded border-2 border-amber-500 bg-amber-900/60 px-2 py-1 text-white text-xs min-w-[60px] text-center">
    <v-icon size="14" class="mr-1">mdi-call-split</v-icon>
    <span>{{ data.label || 'Turnout' }}</span>
    <div v-if="data.turnoutId" class="text-amber-300 text-[10px]">{{ data.turnoutId }}</div>
    <Handle id="input" type="target" :position="Position.Left" class="!bg-amber-400" />
    <Handle id="straight" type="source" :position="Position.Right" style="top: 30%" class="!bg-amber-400" />
    <Handle id="divergent" type="source" :position="Position.Right" style="top: 70%" class="!bg-amber-400" />
  </div>
</template>
```

- [ ] **Step 3: Create WaypointNode.vue**

```vue
<!-- apps/cloud/src/TrackDiagram/nodes/WaypointNode.vue -->
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { TrackDiagramNodeData } from '@repo/modules'

const props = defineProps<{
  id: string
  data: TrackDiagramNodeData & { label: string }
}>()
</script>
<template>
  <div class="waypoint-node w-4 h-4 rounded-full border-2 border-gray-400 bg-gray-700">
    <Handle type="target" :position="Position.Left" class="!bg-gray-400 !w-2 !h-2" />
    <Handle type="source" :position="Position.Right" class="!bg-gray-400 !w-2 !h-2" />
  </div>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add apps/cloud/src/TrackDiagram/nodes/
git commit -m "feat(cloud): add custom VueFlow node components"
```

---

### Task 12: Create custom track edge

**Files:**
- Create: `apps/cloud/src/TrackDiagram/edges/TrackEdge.vue`

- [ ] **Step 1: Create TrackEdge.vue**

```vue
<!-- apps/cloud/src/TrackDiagram/edges/TrackEdge.vue -->
<script setup lang="ts">
import { BezierEdge } from '@vue-flow/core'
import type { TrackDiagramEdgeData } from '@repo/modules'
import { DEFAULT_TRACK_COLORS } from '../constants'

const props = defineProps<{
  id: string
  source: string
  target: string
  data: TrackDiagramEdgeData
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: string
  targetPosition: string
}>()

const edgeColor = props.data?.color || DEFAULT_TRACK_COLORS[props.data?.trackLine] || '#888'
const strokeWidth = props.data?.strokeWidth || 3
</script>
<template>
  <BezierEdge
    :id="id"
    :source="source"
    :target="target"
    :source-x="sourceX"
    :source-y="sourceY"
    :target-x="targetX"
    :target-y="targetY"
    :source-position="sourcePosition"
    :target-position="targetPosition"
    :style="{ stroke: edgeColor, strokeWidth: `${strokeWidth}px` }"
  />
</template>
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/src/TrackDiagram/edges/TrackEdge.vue
git commit -m "feat(cloud): add custom track edge component"
```

---

### Task 13: Create toolbar and properties panel

**Files:**
- Create: `apps/cloud/src/TrackDiagram/TrackDiagramToolbar.vue`
- Create: `apps/cloud/src/TrackDiagram/TrackDiagramProperties.vue`

- [ ] **Step 1: Create TrackDiagramToolbar.vue**

```vue
<!-- apps/cloud/src/TrackDiagram/TrackDiagramToolbar.vue -->
<script setup lang="ts">
import { useTrackDiagramEditor } from './composables/useTrackDiagramEditor'
import { TOOL_OPTIONS } from './constants'

const { toolMode, setToolMode } = useTrackDiagramEditor()
</script>
<template>
  <div class="flex gap-1 p-2 bg-gray-900 rounded-lg">
    <v-btn
      v-for="tool in TOOL_OPTIONS"
      :key="tool.mode"
      :icon="tool.icon"
      :color="toolMode === tool.mode ? 'indigo' : undefined"
      :variant="toolMode === tool.mode ? 'flat' : 'text'"
      size="small"
      :title="tool.label"
      @click="setToolMode(tool.mode)"
    />
  </div>
</template>
```

- [ ] **Step 2: Create TrackDiagramProperties.vue**

```vue
<!-- apps/cloud/src/TrackDiagram/TrackDiagramProperties.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { TrackDiagramNode, TrackDiagramEdge } from '@repo/modules'
import { DEFAULT_TRACK_COLORS } from './constants'

const props = defineProps<{
  node?: TrackDiagramNode | null
  edge?: TrackDiagramEdge | null
}>()

const emit = defineEmits<{
  'update:node': [updates: Partial<TrackDiagramNode>]
  'update:edge': [updates: Partial<TrackDiagramEdge>]
}>()

const trackLineOptions = computed(() =>
  Object.keys(DEFAULT_TRACK_COLORS).map((name) => ({ title: name, value: name }))
)
</script>
<template>
  <v-card v-if="node" variant="tonal" color="indigo" class="pa-3">
    <v-card-title class="text-sm">Node Properties</v-card-title>
    <v-text-field
      :model-value="node.label"
      label="Label"
      variant="outlined"
      density="compact"
      @update:model-value="emit('update:node', { label: $event })"
    />
    <v-text-field
      v-if="node.type === 'station'"
      :model-value="node.data.routePointId"
      label="Route Point ID"
      variant="outlined"
      density="compact"
      hint="Maps to Route point1/point2"
      @update:model-value="emit('update:node', { data: { ...node.data, routePointId: $event } })"
    />
    <v-text-field
      v-if="node.type === 'turnout'"
      :model-value="node.data.turnoutId"
      label="Turnout ID"
      variant="outlined"
      density="compact"
      hint="Links to Firestore turnout document"
      @update:model-value="emit('update:node', { data: { ...node.data, turnoutId: $event } })"
    />
    <v-text-field
      v-if="node.type === 'turnout'"
      :model-value="node.rotation"
      label="Rotation (degrees)"
      type="number"
      variant="outlined"
      density="compact"
      @update:model-value="emit('update:node', { rotation: Number($event) })"
    />
  </v-card>

  <v-card v-else-if="edge" variant="tonal" color="indigo" class="pa-3">
    <v-card-title class="text-sm">Edge Properties</v-card-title>
    <v-select
      :model-value="edge.data.trackLine"
      :items="trackLineOptions"
      label="Track Line"
      variant="outlined"
      density="compact"
      @update:model-value="emit('update:edge', { data: { ...edge.data, trackLine: $event } })"
    />
    <v-text-field
      :model-value="edge.data.strokeWidth"
      label="Stroke Width"
      type="number"
      variant="outlined"
      density="compact"
      @update:model-value="emit('update:edge', { data: { ...edge.data, strokeWidth: Number($event) } })"
    />
  </v-card>

  <v-card v-else variant="outlined" class="pa-3 text-center text-gray-500">
    <p class="text-sm">Select a node or edge to edit its properties.</p>
  </v-card>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/TrackDiagram/TrackDiagramToolbar.vue apps/cloud/src/TrackDiagram/TrackDiagramProperties.vue
git commit -m "feat(cloud): add toolbar and properties panel"
```

---

### Task 14: Create main TrackDiagramEditor component

**Files:**
- Create: `apps/cloud/src/TrackDiagram/TrackDiagramEditor.vue`

This is the main editor that ties VueFlow, toolbar, properties, and preview together.

- [ ] **Step 1: Create TrackDiagramEditor.vue**

```vue
<!-- apps/cloud/src/TrackDiagram/TrackDiagramEditor.vue -->
<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import type { TrackDiagram, TrackDiagramNode, TrackDiagramEdge } from '@repo/modules'
import { useTrackDiagrams } from '@repo/modules/trackDiagrams/useTrackDiagrams'
import { createLogger } from '@repo/utils'

import { useTrackDiagramEditor } from './composables/useTrackDiagramEditor'
import TrackDiagramToolbar from './TrackDiagramToolbar.vue'
import TrackDiagramProperties from './TrackDiagramProperties.vue'
import TrackDiagramPreview from './TrackDiagramPreview.vue'
import StationNode from './nodes/StationNode.vue'
import TurnoutNode from './nodes/TurnoutNode.vue'
import WaypointNode from './nodes/WaypointNode.vue'
import TrackEdge from './edges/TrackEdge.vue'
import { DEFAULT_TRACK_COLORS, GRID_SIZE } from './constants'

const log = createLogger('TrackDiagramEditor')

const props = defineProps<{ diagram: TrackDiagram }>()
const { setTrackDiagram } = useTrackDiagrams()
const { toolMode, selectedNodeId, selectedEdgeId, selectNode, selectEdge, snapToGrid, isDirty, markDirty, markClean } = useTrackDiagramEditor()

const saving = ref(false)
const showPreview = ref(false)
let nodeCounter = ref(props.diagram.nodes.length)

// Convert diagram data to VueFlow format
const nodes = ref(props.diagram.nodes.map((n) => ({
  id: n.id,
  type: n.type,
  position: n.position,
  data: { ...n.data, label: n.label, rotation: n.rotation },
})))

const edges = ref(props.diagram.edges.map((e) => ({
  id: e.id,
  source: e.source,
  target: e.target,
  sourceHandle: e.sourceHandle,
  targetHandle: e.targetHandle,
  type: 'track',
  data: e.data,
})))

const selectedNode = computed(() => {
  if (!selectedNodeId.value) return null
  const vfNode = nodes.value.find((n) => n.id === selectedNodeId.value)
  if (!vfNode) return null
  return {
    id: vfNode.id,
    type: vfNode.type as TrackDiagramNode['type'],
    label: vfNode.data.label,
    position: vfNode.position,
    rotation: vfNode.data.rotation || 0,
    data: vfNode.data,
  } as TrackDiagramNode
})

const selectedEdge = computed(() => {
  if (!selectedEdgeId.value) return null
  const vfEdge = edges.value.find((e) => e.id === selectedEdgeId.value)
  if (!vfEdge) return null
  return {
    id: vfEdge.id,
    source: vfEdge.source,
    target: vfEdge.target,
    sourceHandle: vfEdge.sourceHandle,
    targetHandle: vfEdge.targetHandle,
    data: vfEdge.data,
  } as TrackDiagramEdge
})

function onNodeClick({ node }: { node: { id: string } }) {
  selectNode(node.id)
}

function onEdgeClick({ edge }: { edge: { id: string } }) {
  selectEdge(edge.id)
}

function onPaneClick() {
  if (toolMode.value !== 'select') {
    // Add a new node at click position
    addNode(toolMode.value)
  } else {
    selectNode(null)
    selectEdge(null)
  }
}

function addNode(type: 'station' | 'turnout' | 'waypoint') {
  nodeCounter.value++
  const id = `${type}-${nodeCounter.value}`
  const defaultLabel = type === 'station' ? `Station ${nodeCounter.value}` : type === 'turnout' ? `T${nodeCounter.value}` : `WP${nodeCounter.value}`
  const trackLine = Object.keys(DEFAULT_TRACK_COLORS)[0]

  nodes.value.push({
    id,
    type,
    position: { x: snapToGrid(200 + nodeCounter.value * 30), y: snapToGrid(200 + nodeCounter.value * 20) },
    data: { label: defaultLabel, rotation: 0, trackLine },
  })
  markDirty()
  selectNode(id)
}

function onConnect(connection: { source: string; target: string; sourceHandle?: string; targetHandle?: string }) {
  const id = `edge-${connection.source}-${connection.target}`
  const trackLine = Object.keys(DEFAULT_TRACK_COLORS)[0]
  edges.value.push({
    id,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'track',
    data: { trackLine, color: DEFAULT_TRACK_COLORS[trackLine], strokeWidth: 3, pathType: 'curve' as const },
  })
  markDirty()
}

function handleNodeUpdate(updates: Partial<TrackDiagramNode>) {
  if (!selectedNodeId.value) return
  const idx = nodes.value.findIndex((n) => n.id === selectedNodeId.value)
  if (idx === -1) return
  const node = nodes.value[idx]
  nodes.value[idx] = {
    ...node,
    data: { ...node.data, ...updates.data, label: updates.label ?? node.data.label, rotation: updates.rotation ?? node.data.rotation },
  }
  markDirty()
}

function handleEdgeUpdate(updates: Partial<TrackDiagramEdge>) {
  if (!selectedEdgeId.value) return
  const idx = edges.value.findIndex((e) => e.id === selectedEdgeId.value)
  if (idx === -1) return
  edges.value[idx] = { ...edges.value[idx], data: { ...edges.value[idx].data, ...updates.data } }
  markDirty()
}

async function handleSave() {
  saving.value = true
  const diagramNodes: TrackDiagramNode[] = nodes.value.map((n) => ({
    id: n.id,
    type: n.type as TrackDiagramNode['type'],
    label: n.data.label || '',
    position: n.position,
    rotation: n.data.rotation || 0,
    data: {
      turnoutId: n.data.turnoutId,
      routePointId: n.data.routePointId,
      trackLine: n.data.trackLine,
      color: n.data.color,
    },
  }))
  const diagramEdges: TrackDiagramEdge[] = edges.value.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    data: e.data,
  }))
  await setTrackDiagram(props.diagram.id, {
    ...props.diagram,
    nodes: diagramNodes,
    edges: diagramEdges,
  })
  markClean()
  saving.value = false
}
</script>
<template>
  <div class="flex flex-col h-[calc(100vh-120px)]">
    <!-- Top bar -->
    <div class="flex items-center justify-between p-2 bg-gray-900 rounded-t-lg">
      <div class="flex items-center gap-2">
        <v-icon icon="mdi-map-marker-path" color="indigo" />
        <span class="text-lg font-bold">{{ diagram.name }}</span>
      </div>
      <div class="flex items-center gap-2">
        <TrackDiagramToolbar />
        <v-btn icon="mdi-eye" :variant="showPreview ? 'flat' : 'text'" color="indigo" size="small" title="Toggle Preview" @click="showPreview = !showPreview" />
        <v-btn text="Save" prepend-icon="mdi-content-save" color="indigo" :loading="saving" :disabled="!isDirty" size="small" @click="handleSave" />
      </div>
    </div>

    <!-- Editor + Properties -->
    <div class="flex flex-1 overflow-hidden">
      <!-- VueFlow Canvas -->
      <div class="flex-1 relative">
        <VueFlow
          :nodes="nodes"
          :edges="edges"
          :node-types="{ station: StationNode, turnout: TurnoutNode, waypoint: WaypointNode }"
          :edge-types="{ track: TrackEdge }"
          :snap-to-grid="true"
          :snap-grid="[GRID_SIZE, GRID_SIZE]"
          fit-view-on-init
          @node-click="onNodeClick"
          @edge-click="onEdgeClick"
          @pane-click="onPaneClick"
          @connect="onConnect"
          @node-drag-stop="markDirty"
        >
          <Background :gap="GRID_SIZE" />
          <Controls />
          <MiniMap />
        </VueFlow>
      </div>

      <!-- Side panel -->
      <div class="w-72 p-2 bg-gray-950 overflow-y-auto border-l border-gray-800">
        <TrackDiagramProperties
          :node="selectedNode"
          :edge="selectedEdge"
          @update:node="handleNodeUpdate"
          @update:edge="handleEdgeUpdate"
        />
      </div>
    </div>

    <!-- Preview panel (toggleable) -->
    <div v-if="showPreview" class="h-64 border-t border-gray-800 bg-black">
      <TrackDiagramPreview :nodes="nodes" :edges="edges" :view-box="diagram.viewBox" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/src/TrackDiagram/TrackDiagramEditor.vue
git commit -m "feat(cloud): add main VueFlow track diagram editor"
```

---

## Chunk 4: SVG Generation Pipeline

### Task 15: Create SVG templates

**Files:**
- Create: `apps/cloud/src/TrackDiagram/templates/svgTemplates.ts`

Templates are extracted from `apps/throttle/src/routes/maps/tam/payette-sub.svg`.

- [ ] **Step 1: Create svgTemplates.ts**

```typescript
// apps/cloud/src/TrackDiagram/templates/svgTemplates.ts

export function turnoutForkSvg(id: string, x: number, y: number, rotation: number): string {
  return `<g id="${id}" transform="translate(${x},${y}) rotate(${rotation})">
  <g><path d="M0,0 L30,0" style="fill:none;stroke:rgb(129,128,128);stroke-width:3px;"/></g>
  <g><path d="M0,0 L25,-20" style="fill:none;stroke:rgb(129,128,128);stroke-width:3px;"/></g>
</g>`
}

export function turnoutLabelSvg(id: string, x: number, y: number, label: string): string {
  return `<g id="lbl${id}" transform="translate(${x},${y})">
  <circle cx="0" cy="0" r="13" style="fill:rgb(255,0,234);fill-opacity:0.21;"/>
  <text x="-10" y="4" style="font-family:sans-serif;font-weight:500;font-size:8px;fill:white;">${label}</text>
</g>`
}

export function routeMarkerSvg(id: string, x: number, y: number, label: string, color: string = 'rgb(143,217,38)'): string {
  const width = Math.max(40, label.length * 9 + 12)
  const halfW = width / 2
  const r = 4
  return `<g id="${id}" transform="translate(${x},${y})">
  <path d="M${halfW},${-8}C${halfW},${-8 - r} ${halfW - r},${-12} ${halfW - r},${-12}L${-(halfW - r)},${-12}C${-halfW},${-12} ${-halfW},${-8 - r} ${-halfW},${-8}L${-halfW},${8 - r}C${-halfW},${8} ${-(halfW - r)},${12} ${-(halfW - r)},${12}L${halfW - r},${12}C${halfW},${12} ${halfW},${8} ${halfW},${8 - r}Z" style="fill:${color};fill-opacity:0.42;"/>
  <text x="${-halfW + 6}" y="4" style="font-family:sans-serif;font-weight:500;font-size:13px;fill:white;">${label}</text>
</g>`
}

export function backgroundSvg(width: number, height: number): string {
  return `<g id="Background"><rect x="0" y="0" width="${width}" height="${height}" style="fill:rgb(0,0,0);"/></g>`
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/src/TrackDiagram/templates/svgTemplates.ts
git commit -m "feat(cloud): add SVG fragment templates"
```

---

### Task 16: Create SVG generation composable

**Files:**
- Create: `apps/cloud/src/TrackDiagram/composables/useTrackDiagramSvg.ts`

- [ ] **Step 1: Create useTrackDiagramSvg.ts**

```typescript
// apps/cloud/src/TrackDiagram/composables/useTrackDiagramSvg.ts
import type { TrackDiagramNode, TrackDiagramEdge } from '@repo/modules'
import { DEFAULT_TRACK_COLORS } from '../constants'
import { backgroundSvg, turnoutForkSvg, turnoutLabelSvg, routeMarkerSvg } from '../templates/svgTemplates'

interface VueFlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

interface VueFlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  data: { trackLine: string; color: string; strokeWidth: number; pathType: string }
}

function buildEdgePath(
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number },
  pathType: string
): string {
  if (pathType === 'straight') {
    return `M${sourcePos.x},${sourcePos.y} L${targetPos.x},${targetPos.y}`
  }
  // Bezier curve
  const cx1 = sourcePos.x + (targetPos.x - sourcePos.x) * 0.5
  const cy1 = sourcePos.y
  const cx2 = sourcePos.x + (targetPos.x - sourcePos.x) * 0.5
  const cy2 = targetPos.y
  return `M${sourcePos.x},${sourcePos.y} C${cx1},${cy1} ${cx2},${cy2} ${targetPos.x},${targetPos.y}`
}

export function generateSvg(
  nodes: VueFlowNode[],
  edges: VueFlowEdge[],
  viewBox: { width: number; height: number }
): string {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  // 1. Background
  const background = backgroundSvg(viewBox.width, viewBox.height)

  // 2. Lines -- group edges by trackLine
  const edgesByLine = new Map<string, string[]>()
  for (const edge of edges) {
    const trackLine = edge.data?.trackLine || 'Mainline'
    const source = nodeMap.get(edge.source)
    const target = nodeMap.get(edge.target)
    if (!source || !target) continue

    const color = edge.data?.color || DEFAULT_TRACK_COLORS[trackLine] || '#888'
    const sw = edge.data?.strokeWidth || 3
    const d = buildEdgePath(source.position, target.position, edge.data?.pathType || 'curve')
    const path = `<path d="${d}" style="fill:none;stroke:${color};stroke-width:${sw}px;stroke-linecap:round;"/>`

    if (!edgesByLine.has(trackLine)) edgesByLine.set(trackLine, [])
    edgesByLine.get(trackLine)!.push(path)
  }

  let linesGroup = '<g id="Lines">'
  for (const [lineName, paths] of edgesByLine) {
    linesGroup += `\n  <g id="${lineName}">\n    ${paths.join('\n    ')}\n  </g>`
  }
  linesGroup += '\n</g>'

  // 3. Turnouts
  const turnoutNodes = nodes.filter((n) => n.type === 'turnout')
  let turnoutsGroup = '<g id="Turnouts">'
  for (const node of turnoutNodes) {
    const id = (node.data.turnoutId as string) || node.id
    const rotation = (node.data.rotation as number) || 0
    turnoutsGroup += `\n  ${turnoutForkSvg(id, node.position.x, node.position.y, rotation)}`
  }
  turnoutsGroup += '\n</g>'

  // 4. TurnoutLabels
  let turnoutLabelsGroup = '<g id="TurnoutLabels">'
  for (const node of turnoutNodes) {
    const id = (node.data.turnoutId as string) || node.id
    const label = (node.data.label as string) || id
    turnoutLabelsGroup += `\n  ${turnoutLabelSvg(id, node.position.x, node.position.y - 25, label)}`
  }
  turnoutLabelsGroup += '\n</g>'

  // 5. Routes
  const stationNodes = nodes.filter((n) => n.type === 'station')
  let routesGroup = '<g id="Routes">'
  for (const node of stationNodes) {
    const id = (node.data.routePointId as string) || node.id
    const label = (node.data.label as string) || id
    const color = (node.data.color as string) || 'rgb(143,217,38)'
    routesGroup += `\n  ${routeMarkerSvg(id, node.position.x, node.position.y, label, color)}`
  }
  routesGroup += '\n</g>'

  // 6. Assembly
  return `<svg width="100%" height="100%" viewBox="0 0 ${viewBox.width} ${viewBox.height}" xmlns="http://www.w3.org/2000/svg" style="fill-rule:evenodd;clip-rule:evenodd;">
${background}
${linesGroup}
${turnoutsGroup}
${turnoutLabelsGroup}
${routesGroup}
</svg>`
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/src/TrackDiagram/composables/useTrackDiagramSvg.ts
git commit -m "feat(cloud): add SVG generation pipeline"
```

---

### Task 17: Create CSS generation composable

**Files:**
- Create: `apps/cloud/src/TrackDiagram/composables/useTrackDiagramCss.ts`

Reference: `apps/server/src/scripts/gen-route-styles.ts`

- [ ] **Step 1: Create useTrackDiagramCss.ts**

```typescript
// apps/cloud/src/TrackDiagram/composables/useTrackDiagramCss.ts

interface CssNode {
  type: string
  data: { turnoutId?: string; routePointId?: string }
}

export function generateCss(nodes: CssNode[]): string {
  const turnoutIds = nodes
    .filter((n) => n.type === 'turnout' && n.data.turnoutId)
    .map((n) => n.data.turnoutId!)

  const routePointIds = nodes
    .filter((n) => n.type === 'station' && n.data.routePointId)
    .map((n) => n.data.routePointId!)

  let css = `:root {
  --turnout-hover-fill: rgb(253, 35, 253);
  --route-selected-fill: rgb(0, 255, 17);
  --route-available-fill: rgb(254, 217, 33);
  --route-hover-fill: rgb(254, 217, 33);
}

#TurnoutLabels > g,
#Routes > g {
  cursor: pointer;
}
#TurnoutLabels > g:hover {
  fill-opacity: .8;
}
#TurnoutLabels > g:hover circle {
  fill: var(--turnout-hover-fill) !important;
  fill-opacity: .8 !important;
}

#Routes > g:hover path {
  fill: var(--route-hover-fill) !important;
  fill-opacity: .8 !important;
}

.p1-selected #Routes > g path {
  fill-opacity: .1 !important;
}
.p1-selected #Routes > g text {
  opacity: .05 !important;
}
`

  for (const id of turnoutIds) {
    css += `
.${id}-straight #Turnouts #${id} > g:last-child { visibility: hidden; }
.${id}-straight #Turnouts #${id} > g:first-child path { stroke: black !important; }
.${id}-divergent #Turnouts #${id} > g:first-child { visibility: hidden; }
.${id}-divergent #Turnouts #${id} > g:last-child path { stroke: black !important; }
`
  }

  for (const point of routePointIds) {
    const P = point.toUpperCase().replace(/\s+/g, '')
    css += `
.selected-${P} #Routes > g#${P} path { fill: var(--route-selected-fill) !important; fill-opacity: .8 !important; }
.selected-${P} #Routes > g#${P} text { opacity: 1 !important; }
.available-${P} #Routes > g#${P} path { fill: var(--route-available-fill) !important; fill-opacity: .8 !important; }
.available-${P} #Routes > g#${P} text { opacity: 1 !important; }
`
  }

  return css
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/src/TrackDiagram/composables/useTrackDiagramCss.ts
git commit -m "feat(cloud): add CSS generation composable"
```

---

### Task 18: Create SVG preview component

**Files:**
- Create: `apps/cloud/src/TrackDiagram/TrackDiagramPreview.vue`

- [ ] **Step 1: Create TrackDiagramPreview.vue**

```vue
<!-- apps/cloud/src/TrackDiagram/TrackDiagramPreview.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { generateSvg } from './composables/useTrackDiagramSvg'

const props = defineProps<{
  nodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> }>
  edges: Array<{ id: string; source: string; target: string; sourceHandle?: string; targetHandle?: string; data: { trackLine: string; color: string; strokeWidth: number; pathType: string } }>
  viewBox: { width: number; height: number }
}>()

const svgHtml = computed(() => generateSvg(props.nodes, props.edges, props.viewBox))
</script>
<template>
  <div class="h-full w-full flex flex-col">
    <div class="text-xs text-gray-500 p-1 flex items-center gap-2">
      <v-icon icon="mdi-eye" size="14" /> SVG Preview
    </div>
    <div class="flex-1 overflow-auto bg-black" v-html="svgHtml" />
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/src/TrackDiagram/TrackDiagramPreview.vue
git commit -m "feat(cloud): add live SVG preview component"
```

---

### Task 19: Create Firebase Storage upload composable

**Files:**
- Create: `apps/cloud/src/TrackDiagram/composables/useTrackDiagramStorage.ts`

- [ ] **Step 1: Create useTrackDiagramStorage.ts**

```typescript
// apps/cloud/src/TrackDiagram/composables/useTrackDiagramStorage.ts
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage'
import { storage } from '@repo/firebase-config'
import { useStorage } from '@vueuse/core'
import { createLogger } from '@repo/utils'

const log = createLogger('TrackDiagramStorage')

export const useTrackDiagramStorage = () => {
  const layoutId = useStorage<string | null>('@DEJA/layoutId', null)

  async function uploadSvg(diagramId: string, svgContent: string): Promise<string | null> {
    if (!layoutId.value) return null
    try {
      const path = `layouts/${layoutId.value}/maps/${diagramId}.svg`
      const fileRef = storageRef(storage, path)
      await uploadString(fileRef, svgContent, 'raw', { contentType: 'image/svg+xml' })
      return await getDownloadURL(fileRef)
    } catch (error) {
      log.error('Error uploading SVG:', error)
      return null
    }
  }

  async function uploadCss(diagramId: string, cssContent: string): Promise<string | null> {
    if (!layoutId.value) return null
    try {
      const path = `layouts/${layoutId.value}/maps/${diagramId}.css`
      const fileRef = storageRef(storage, path)
      await uploadString(fileRef, cssContent, 'raw', { contentType: 'text/css' })
      return await getDownloadURL(fileRef)
    } catch (error) {
      log.error('Error uploading CSS:', error)
      return null
    }
  }

  return { uploadSvg, uploadCss }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/cloud/src/TrackDiagram/composables/useTrackDiagramStorage.ts
git commit -m "feat(cloud): add Firebase Storage upload composable"
```

---

### Task 20: Wire up export (SVG + CSS generation + Storage upload) in editor

**Files:**
- Modify: `apps/cloud/src/TrackDiagram/TrackDiagramEditor.vue`

- [ ] **Step 1: Add export button and logic**

Add imports to `TrackDiagramEditor.vue`:

```typescript
import { generateSvg } from './composables/useTrackDiagramSvg'
import { generateCss } from './composables/useTrackDiagramCss'
import { useTrackDiagramStorage } from './composables/useTrackDiagramStorage'
```

Add to setup:

```typescript
const { uploadSvg, uploadCss } = useTrackDiagramStorage()
const exporting = ref(false)

async function handleExport() {
  exporting.value = true
  const svg = generateSvg(nodes.value, edges.value, props.diagram.viewBox)
  const css = generateCss(nodes.value.map((n) => ({ type: n.type, data: n.data as Record<string, unknown> })))

  const svgUrl = await uploadSvg(props.diagram.id, svg)
  const cssUrl = await uploadCss(props.diagram.id, css)

  if (svgUrl && cssUrl) {
    await setTrackDiagram(props.diagram.id, {
      ...props.diagram,
      nodes: nodes.value.map((n) => ({
        id: n.id,
        type: n.type as TrackDiagramNode['type'],
        label: (n.data.label as string) || '',
        position: n.position,
        rotation: (n.data.rotation as number) || 0,
        data: n.data as TrackDiagramNode['data'],
      })),
      edges: edges.value.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        data: e.data,
      })),
      svgUrl,
      cssUrl,
    })
  }
  exporting.value = false
}
```

Add export button in template (next to Save button):

```html
<v-btn text="Export SVG" prepend-icon="mdi-export" color="green" :loading="exporting" size="small" @click="handleExport" />
```

- [ ] **Step 2: Verify the full editor flow**

Run: `pnpm --filter deja-cloud dev`
1. Navigate to `/track-diagrams/new`, create a diagram
2. In the editor, use toolbar to add station/turnout/waypoint nodes
3. Connect nodes with edges
4. Toggle the preview panel to see generated SVG
5. Click Save, then Export SVG

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/TrackDiagram/TrackDiagramEditor.vue
git commit -m "feat(cloud): add SVG/CSS export with Firebase Storage upload"
```

---

### Task 21: Lint and type-check

- [ ] **Step 1: Run lint**

```bash
pnpm lint
```

Fix any lint errors.

- [ ] **Step 2: Run type-check**

```bash
pnpm check-types
```

Fix any type errors.

- [ ] **Step 3: Commit fixes**

```bash
git add -A
git commit -m "fix: resolve lint and type-check errors for track diagram editor"
```

---

## Verification

1. **Cloud app editor**: Navigate to `/track-diagrams`, create a diagram, add nodes, connect edges, verify live preview
2. **SVG structure**: Click "Export SVG", download from Firebase Storage, verify `#Routes`, `#Turnouts`, `#TurnoutLabels`, `#Lines`, `#Background` groups
3. **CSS output**: Verify `.{turnoutId}-straight`/`.{turnoutId}-divergent` and `.selected-{pointId}` rules
4. **Save/Load**: Save a diagram, refresh, verify it loads correctly
5. **Lint + types**: `pnpm lint && pnpm check-types` passes
