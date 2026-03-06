---
name: deja-component
description: "Scaffold a new Vue component with correct DEJA.js conventions."
disable-model-invocation: true
---

# Scaffold a DEJA.js Vue Component

Use this skill to create a new Vue component that follows DEJA.js conventions. Ask the user for these details before generating:

1. **Component name** (PascalCase, e.g. `TrainSchedule`)
2. **Location**: `packages/ui/src/` (shared) or `apps/{app}/src/components/` (app-specific)
3. **Purpose**: What does this component do?

## Pre-flight Checks

Before creating the component:

1. **Search `packages/ui/src/`** for existing components that might already do this — the UI package has 50+ components
2. **Check `@repo/modules`** for composables the component should use (`useLocos`, `useTurnouts`, `useEfx`, `useSignals`, `useLayout`, `useRoutes`)
3. **Check for existing types** in `@repo/modules` — prefer importing types over defining new ones

## Component Template

Generate the component following this structure:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
// Import composables from @repo/modules, not raw Firebase calls
// import { useLocos, type Loco } from '@repo/modules'

// TypeScript interface for props
interface Props {
  // Always support color prop for accent customization
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
})

// Use defineModel for two-way binding when needed
// const modelValue = defineModel<boolean>()

// Emits with typed payload
// const emit = defineEmits<{
//   update: [value: string]
// }>()
</script>

<template>
  <!-- Dark mode first. Use Vuetify components where they fit -->
  <v-card
    class="m-1 shadow-xl"
    :color="color"
    variant="tonal"
  >
    <v-card-title class="flex flex-row items-center gap-4">
      <v-icon>mdi-icon-name</v-icon>
      <h4 class="text-md font-bold">Title</h4>
    </v-card-title>

    <v-card-text class="text-sm">
      <!-- Content here -->
    </v-card-text>

    <v-card-actions class="flex justify-end">
      <!-- Actions here -->
    </v-card-actions>
  </v-card>
</template>
```

## Conventions Checklist

Apply these when generating the component:

- [ ] **`<script setup lang="ts">`** — always TypeScript, always `<script setup>`
- [ ] **Props as TypeScript interface** — use `defineProps<Props>()`, not runtime declaration
- [ ] **Color prop** — support `:color="item?.color || 'primary'"` pattern for accent colors
- [ ] **Composables from `@repo/modules`** — never import Firebase directly in components
- [ ] **Vuetify components** — use `v-card`, `v-btn`, `v-chip`, `v-icon` (mdi-* icons), `v-switch`, etc.
- [ ] **Tailwind for layout** — `flex`, `gap-4`, `text-sm`, `font-bold`, spacing utilities
- [ ] **Dark mode first** — design for dark backgrounds (`bg-[#0f172a]`, `text-[#e0f2fe]`)
- [ ] **Monitor app BEM classes** — if in monitor app, use `.monitor-card__[element]` naming
- [ ] **Transitions on interactive elements** — 120-150ms for hover, 300ms for state changes
- [ ] **`defineModel`** for two-way binding — not manual `modelValue` + `update:modelValue`

## Exporting from @repo/ui

If placing in `packages/ui/src/`, also update the package exports:

1. Add the component to `packages/ui/src/index.ts`:
   ```typescript
   export { default as ComponentName } from './ComponentName.vue'
   ```

2. If creating a component group (folder), follow the existing pattern:
   ```
   packages/ui/src/
     ComponentGroup/
       ComponentA.vue
       ComponentB.vue
   ```
   Export from the group's parent in `index.ts`.

## Type Patterns

```typescript
// Import types from @repo/modules, not defining new ones
import { type Loco, type Turnout, type Effect } from '@repo/modules'

// Use defineModel for v-model support
const state = defineModel('state', { type: Boolean })

// Computed for derived data
const displayName = computed(() => props.item?.name ?? 'Unknown')
```
