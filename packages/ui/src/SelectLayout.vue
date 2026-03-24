<script setup lang="ts">
import { computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useLayout } from '@repo/modules'

const props = withDefaults(
  defineProps<{
    /** Currently selected layoutId (to show active indicator) */
    layoutId?: string | null
    /** 'page' for fullscreen gate, 'compact' for dialog/inline use */
    variant?: 'page' | 'compact'
  }>(),
  {
    layoutId: null,
    variant: 'page',
  },
)

const emit = defineEmits<{
  selected: [layoutId: string]
}>()

const user = useCurrentUser()
const { getLayouts } = useLayout()

// Use a computed email so the query re-runs reactively when auth resolves
const email = computed(() => user.value?.email ?? null)
const layouts = getLayouts(email)
</script>

<template>
  <div
    class="flex flex-col items-center w-full"
    :class="variant === 'page' ? 'min-h-[60vh] justify-center py-12 px-4' : 'py-1'"
  >
    <!-- 🏠 Hero section (page variant only) -->
    <template v-if="variant === 'page'">
      <v-icon size="48" color="primary" class="mb-4 animate-fade-in-up">mdi-home-city</v-icon>
      <h1 class="text-h4 font-weight-bold text-white mb-2 animate-fade-in-up">
        Choose Your Layout
      </h1>
      <p class="text-body-1 text-medium-emphasis mb-8 animate-fade-in-up">
        Select a layout to get started
      </p>
    </template>

    <!-- ⏳ Loading state -->
    <template v-if="!layouts">
      <div class="w-full space-y-3">
        <v-skeleton-loader v-for="n in 2" :key="n" type="list-item-two-line" class="rounded-xl" />
      </div>
    </template>

    <!-- 📋 Layout list -->
    <div v-else-if="layouts.length > 0" class="w-full space-y-2">
      <div
        v-for="layout in layouts"
        :key="layout.id"
        class="layout-item"
        :class="{ 'layout-item--active': layoutId === layout.id }"
        @click="emit('selected', layout.id)"
      >
        <div class="flex items-center gap-3 min-w-0">
          <v-icon
            :color="layoutId === layout.id ? 'primary' : undefined"
            size="20"
          >
            {{ layoutId === layout.id ? 'mdi-check-circle' : 'mdi-home-outline' }}
          </v-icon>
          <div class="min-w-0">
            <div class="font-medium text-sm truncate">
              {{ layout.name || 'Unnamed Layout' }}
            </div>
            <div class="text-xs opacity-50">{{ layout.id }}</div>
          </div>
        </div>
        <v-icon v-if="layoutId === layout.id" size="16" color="primary">mdi-chevron-right</v-icon>
      </div>
    </div>

    <!-- 🚫 Empty state -->
    <div v-else class="text-center py-6">
      <v-icon size="36" color="grey" class="mb-3">mdi-home-off-outline</v-icon>
      <p class="text-body-2 text-medium-emphasis">
        No layouts found. Create one to get started.
      </p>
    </div>
  </div>
</template>

<style scoped>
.layout-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  background: rgba(var(--v-theme-surface), 0.4);
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
}

.layout-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  background: rgba(var(--v-theme-primary), 0.05);
}

.layout-item--active {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background: rgba(var(--v-theme-primary), 0.08);
}
</style>
