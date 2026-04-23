<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useRoute } from 'vue-router'
import type { MenuItem } from './types'
import AppSwitcher from '../AppSwitcher.vue'

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
const isDev = import.meta.env.DEV

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

</script>

<template>
  <v-navigation-drawer
    v-model="boundDrawer"
    :mobile="mobile"
    mobile-breakpoint="md"
    :temporary="temporary || mobile"
    class="menu-drawer backdrop-blur-sm"
  >
    <div class="flex flex-col h-full">
      <!-- Scrollable menu area -->
      <div class="flex-1 min-h-0 overflow-y-auto">
        <v-list density="compact" class="py-0 menu-list">

          <!-- Grouped sections (items with section field) -->
          <template v-for="group in groupedMenu" :key="group.section">
            <div class="text-[10px] uppercase tracking-wider opacity-50 px-3 pt-3 pb-0.5">
              {{ group.label }}
            </div>
            <v-list-item
              v-for="item in group.items"
              :key="item.name"
              :active="false"
              :class="[
                'min-h-0 transition-colors duration-150 menu-item',
                isActive(item) ? 'menu-item--active' : '',
              ]"
              link
              @click="onHandleMenu(item)"
            >
              <template #prepend>
                <v-icon
                  size="18"
                  :class="`text-${item.color}-500 dark:text-${item.color}-400 stroke-none mr-1`"
                >
                  {{ item.icon }}
                </v-icon>
              </template>
              <v-list-item-title :class="['text-sm leading-tight flex items-center gap-1.5', isActive(item) ? 'menu-item__title--active' : '']">
                {{ item.label }}
                <span v-if="item.feature && isDev" class="feature-badge">DEV</span>
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
            class="min-h-0 menu-item"
            link
            @click="onHandleMenu(item)"
          >
            <template #prepend>
              <v-icon
                size="18"
                :class="`text-${item.color}-500 dark:text-${item.color}-400 stroke-none mr-1`"
              >
                {{ item.icon }}
              </v-icon>
            </template>
          </v-list-item>

        </v-list>
      </div>

      <!-- Pinned app switcher footer -->
      <div>
        <v-divider class="menu-divider" />
        <div class="px-2 py-1">
          <AppSwitcher />
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
/* Neutralize Vuetify's built-in hover and active overlays for grouped items. */
:deep(.v-list-item:hover > .v-list-item__overlay) {
  opacity: 0;
}
:deep(.v-list-item--active > .v-list-item__overlay) {
  opacity: 0;
}

/* Tighten menu item vertical rhythm — override Vuetify's compact density defaults */
.menu-list :deep(.v-list-item) {
  min-height: 28px;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 12px;
  padding-right: 12px;
}
.menu-list :deep(.v-list-item__prepend) {
  align-self: center;
}
.menu-list :deep(.v-list-item__prepend > .v-icon) {
  margin-inline-end: 8px;
  opacity: 1;
}

/* ═══════ Dark mode (default) ═══════ */
.menu-drawer {
  background: rgba(15, 23, 42, 0.95);
}
.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
.menu-item--active {
  background: rgba(255, 255, 255, 0.1) !important;
}
.menu-item__title--active {
  color: #FFFFFF;
}
.menu-divider {
  border-color: rgb(51, 65, 85);
}

/* ═══════ 🌞 Light mode ═══════ */
:root:not(.dark) .menu-drawer {
  background: rgba(255, 255, 255, 0.97);
}
:root:not(.dark) .menu-item:hover {
  background: rgba(0, 0, 0, 0.05) !important;
}
:root:not(.dark) .menu-item--active {
  background: rgba(0, 0, 0, 0.08) !important;
}
:root:not(.dark) .menu-item__title--active {
  color: #1E293B;
  font-weight: 600;
}
:root:not(.dark) .menu-divider {
  border-color: rgb(226, 232, 240);
}

.feature-badge {
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(139, 92, 246, 0.25);
  color: rgb(167, 139, 250);
  border: 1px solid rgba(139, 92, 246, 0.35);
  line-height: 1.4;
  vertical-align: middle;
  flex-shrink: 0;
}

/* ═══════ ⬛⬜ High-contrast ═══════ */
.high-contrast .menu-drawer {
  background: #000000;
  border-right: 2px solid #FFFFFF;
}
.high-contrast .menu-item:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}
.high-contrast .menu-item--active {
  background: rgba(255, 255, 255, 0.2) !important;
  border-left: 3px solid #FFFFFF;
}
.high-contrast .menu-item__title--active {
  color: #FFFFFF;
  font-weight: 700;
}
.high-contrast .menu-divider {
  border-color: #FFFFFF;
}
</style>
