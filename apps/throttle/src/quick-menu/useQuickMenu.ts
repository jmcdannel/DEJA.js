import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import type { SubScreenItem } from './QuickMenuSubScreen.vue'

// Top-level entity screens
export type EntityScreen = 'locos' | 'effects' | 'routes' | 'turnouts' | 'signals' | 'sensors'

export const SUBSCREEN_CONFIGS: Record<EntityScreen, { title: string; items: SubScreenItem[] }> = {
  locos: {
    title: 'Locos',
    items: [
      { id: 'all', label: 'All', icon: 'mdi-view-grid', color: 'pink' },
      { id: 'active', label: 'Active', icon: 'mdi-speedometer', color: 'green' },
      { id: 'by-roadname', label: 'By Roadname', icon: 'mdi-highway', color: 'cyan' },
      { id: 'new', label: 'New', icon: 'mdi-plus-circle', color: 'green' },
    ],
  },
  effects: {
    title: 'Effects',
    items: [
      { id: 'all', label: 'All', icon: 'mdi-view-grid', color: 'indigo' },
      { id: 'by-device', label: 'By Device', icon: 'mdi-developer-board', color: 'cyan' },
      { id: 'by-type', label: 'By Type', icon: 'mdi-shape', color: 'purple' },
      { id: 'by-tag', label: 'By Tag', icon: 'mdi-tag-multiple', color: 'teal' },
      { id: 'new', label: 'New', icon: 'mdi-plus-circle', color: 'green' },
    ],
  },
  routes: {
    title: 'Routes',
    items: [
      { id: 'all', label: 'All', icon: 'mdi-view-grid', color: 'purple' },
      { id: 'by-waypoint', label: 'By Waypoint', icon: 'mdi-map-marker-path', color: 'cyan' },
      { id: 'new', label: 'New', icon: 'mdi-plus-circle', color: 'green' },
    ],
  },
  turnouts: {
    title: 'Turnouts',
    items: [
      { id: 'all', label: 'All', icon: 'mdi-view-grid', color: 'amber' },
      { id: 'by-device', label: 'By Device', icon: 'mdi-developer-board', color: 'cyan' },
      { id: 'by-tag', label: 'By Tag', icon: 'mdi-tag-multiple', color: 'teal' },
      { id: 'labels', label: 'Labels', icon: 'mdi-label', color: 'purple' },
      { id: 'new', label: 'New', icon: 'mdi-plus-circle', color: 'green' },
    ],
  },
  signals: {
    title: 'Signals',
    items: [
      { id: 'all', label: 'All', icon: 'mdi-view-grid', color: 'emerald' },
      { id: 'by-device', label: 'By Device', icon: 'mdi-developer-board', color: 'cyan' },
      { id: 'by-aspect', label: 'By Aspect', icon: 'mdi-circle-slice-4', color: 'purple' },
      { id: 'new', label: 'New', icon: 'mdi-plus-circle', color: 'green' },
    ],
  },
  sensors: {
    title: 'Sensors',
    items: [
      { id: 'all', label: 'All', icon: 'mdi-view-grid', color: 'teal' },
      { id: 'by-device', label: 'By Device', icon: 'mdi-developer-board', color: 'cyan' },
      { id: 'automations', label: 'Automations', icon: 'mdi-robot', color: 'orange' },
      { id: 'new', label: 'New', icon: 'mdi-plus-circle', color: 'green' },
    ],
  },
}

// Group list metadata for screens like "effects:by-device"
export const GROUP_SCREEN_META: Record<string, { title: string; icon: string; color: string }> = {
  // Locos
  'locos:by-roadname':   { title: 'By Roadname', icon: 'mdi-highway', color: 'cyan' },
  // Effects
  'effects:by-device':   { title: 'Effects by Device', icon: 'mdi-developer-board', color: 'cyan' },
  'effects:by-type':     { title: 'Effects by Type', icon: 'mdi-shape', color: 'purple' },
  'effects:by-tag':      { title: 'Effects by Tag', icon: 'mdi-tag-multiple', color: 'teal' },
  // Routes
  'routes:by-waypoint':  { title: 'Routes by Waypoint', icon: 'mdi-map-marker-path', color: 'cyan' },
  // Turnouts
  'turnouts:by-device':  { title: 'Turnouts by Device', icon: 'mdi-developer-board', color: 'cyan' },
  'turnouts:by-tag':     { title: 'Turnouts by Tag', icon: 'mdi-tag-multiple', color: 'teal' },
  'turnouts:labels':     { title: 'Turnout Labels', icon: 'mdi-label', color: 'purple' },
  // Signals
  'signals:by-device':   { title: 'Signals by Device', icon: 'mdi-developer-board', color: 'cyan' },
  'signals:by-aspect':   { title: 'Signals by Aspect', icon: 'mdi-circle-slice-4', color: 'purple' },
  // Sensors
  'sensors:by-device':   { title: 'Sensors by Device', icon: 'mdi-developer-board', color: 'cyan' },
  'sensors:automations': { title: 'Automations', icon: 'mdi-robot', color: 'orange' },
}

export function useQuickMenu() {
  const isOpen = ref(false)
  const quickMenuVisible = useStorage('@DEJA/quickMenu/visible', true)
  const screenStack = ref<string[]>(['home'])

  const currentScreen = computed(() => screenStack.value[screenStack.value.length - 1])

  function pushScreen(screen: string) {
    screenStack.value = [...screenStack.value, screen]
  }

  function popScreen() {
    if (screenStack.value.length > 1) {
      screenStack.value = screenStack.value.slice(0, -1)
    }
  }

  function closeAll() {
    isOpen.value = false
    screenStack.value = ['home']
  }

  return {
    isOpen,
    quickMenuVisible,
    currentScreen,
    pushScreen,
    popScreen,
    closeAll,
  }
}
