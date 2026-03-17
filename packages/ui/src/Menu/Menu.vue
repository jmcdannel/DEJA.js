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
// Colors match each app's brand color from dejajs.com
// Monitor has no production URL — it runs locally alongside the server
const DEJA_SUITE_APPS = [
  { label: 'Cloud',    icon: 'mdi-cloud',             href: 'https://cloud.dejajs.com/',    color: 'text-fuchsia-500' },
  { label: 'Throttle', icon: 'mdi-train-variant',     href: 'https://throttle.dejajs.com/', color: 'text-lime-500' },
  { label: 'Monitor',  icon: 'mdi-monitor-dashboard', href: 'http://localhost:4014/',        color: 'text-red-500' },
  { label: 'Tour',     icon: 'mdi-map-marker-path',   href: 'https://www.dejajs.com/',      color: 'text-cyan-400' },
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
              'py-0.5 min-h-8 transition-colors duration-150',
              isActive(item) ? '!bg-white/10' : 'hover:!bg-white/5',
            ]"
            link
            @click="onHandleMenu(item)"
          >
            <template #prepend>
              <v-icon
                size="20"
                :class="`text-${item.color}-500 dark:text-${item.color}-400 stroke-none mr-2`"
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
          class="py-0.5 min-h-8"
          link
          @click="onHandleMenu(item)"
        >
          <template #prepend>
            <v-icon
              size="20"
              :class="`text-${item.color}-500 dark:text-${item.color}-400 stroke-none mr-2`"
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
                :href="app.href"
                target="_blank"
                size="small"
                :class="app.color"
              >
                <v-icon size="20">{{ app.icon }}</v-icon>
              </v-btn>
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
