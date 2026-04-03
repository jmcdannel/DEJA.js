<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { useDraggableFab } from './useDraggableFab'
import { useQuickMenu, SUBSCREEN_CONFIGS, GROUP_SCREEN_META } from './useQuickMenu'
import type { EntityScreen } from './useQuickMenu'
import { useQuickMenuData } from './useQuickMenuData'
import type { GroupItem } from './useQuickMenuData'
import type { Ref } from 'vue'
import { useFeatureFlags } from '@repo/modules'
import QuickMenuThrottles from './QuickMenuThrottles.vue'
import QuickMenuFavorites from './QuickMenuFavorites.vue'
import QuickMenuCloud from './QuickMenuCloud.vue'
import QuickMenuSubScreen from './QuickMenuSubScreen.vue'
import QuickMenuGroupList from './QuickMenuGroupList.vue'
import QuickMenuItemList from './QuickMenuItemList.vue'

const router = useRouter()
const wrapperRef = ref<HTMLElement | null>(null)

const {
  positionStyle,
  isDragging,
  wasDragging,
  isOnRight,
  onPointerDown,
  onPointerMove,
  onPointerUp,
} = useDraggableFab()

const {
  isOpen,
  quickMenuVisible,
  currentScreen,
  pushScreen,
  popScreen,
  closeAll,
} = useQuickMenu()

const {
  locosByRoadname,
  effectsByDevice, effectsByType, effectsByTag,
  routesByWaypoint,
  turnoutsByDevice, turnoutsByTag, turnoutLabels,
  signalsByDevice, signalsByAspect,
  sensorsByDevice, sensorAutomations,
  getFilteredItems,
  toggleItem,
} = useQuickMenuData()

const { isEnabled } = useFeatureFlags()
const showFavorites = computed(() => isEnabled('quickMenuFavorites'))

// Map group screen keys to their reactive computed refs
const groupData: Record<string, Ref<GroupItem[]>> = {
  'locos:by-roadname':  locosByRoadname,
  'effects:by-device':  effectsByDevice,
  'effects:by-type':    effectsByType,
  'effects:by-tag':     effectsByTag,
  'routes:by-waypoint': routesByWaypoint,
  'turnouts:by-device': turnoutsByDevice,
  'turnouts:by-tag':    turnoutsByTag,
  'turnouts:labels':    turnoutLabels,
  'signals:by-device':  signalsByDevice,
  'signals:by-aspect':  signalsByAspect,
  'sensors:by-device':  sensorsByDevice,
  'sensors:automations':sensorAutomations,
}

// Screen type detection
const subScreenConfig = computed(() => {
  const screen = currentScreen.value
  return SUBSCREEN_CONFIGS[screen as EntityScreen] ?? null
})

const groupScreenMeta = computed(() => {
  return GROUP_SCREEN_META[currentScreen.value] ?? null
})

const groupScreenData = computed(() => {
  const ref = groupData[currentScreen.value]
  return ref ? ref.value : []
})

// Item list screen: pattern is "entity:filter-type:filter-value" or "entity:all"
const itemScreenInfo = computed(() => {
  const screen = currentScreen.value
  const parts = screen.split(':')
  if (parts.length === 3) {
    // e.g. "effects:by-device:dccex"
    const groupKey = `${parts[0]}:${parts[1]}`
    return { entity: parts[0], groupKey, filterId: parts[2], title: parts[2] }
  }
  if (parts.length === 2 && parts[1] === 'all') {
    // e.g. "effects:all"
    return { entity: parts[0], groupKey: `${parts[0]}:all`, filterId: '', title: `All ${SUBSCREEN_CONFIGS[parts[0] as EntityScreen]?.title || parts[0]}` }
  }
  return null
})

const itemListData = computed(() => {
  const info = itemScreenInfo.value
  if (!info) return []
  return getFilteredItems(info.groupKey, info.filterId)
})

// Route map for navigation
const entityRoutes: Record<string, string> = {
  locos: 'roster',
  effects: 'effects',
  routes: 'routes',
  turnouts: 'turnouts',
  signals: 'signals',
  sensors: 'signals',
}

// Handle sub-screen item selection
function handleSubScreenSelect(itemId: string) {
  const entity = currentScreen.value as EntityScreen
  const screenKey = `${entity}:${itemId}`

  // Group screens → push to group list
  if (GROUP_SCREEN_META[screenKey]) {
    pushScreen(screenKey)
    return
  }

  // "all" or "active" → push item list directly
  if (itemId === 'all' || itemId === 'active') {
    pushScreen(`${entity}:${itemId}`)
    return
  }

  // "new" → navigate to entity page
  if (itemId === 'new') {
    const routeName = entityRoutes[entity]
    if (routeName) {
      router.push({ name: routeName })
      closeAll()
    }
    return
  }

  // Remaining items without group screens → navigate to entity page
  const routeName = entityRoutes[entity]
  if (routeName) {
    router.push({ name: routeName })
    closeAll()
  }
}

// Handle group item selection → push item list screen
function handleGroupSelect(groupId: string) {
  const screen = currentScreen.value
  pushScreen(`${screen}:${groupId}`)
}

// Handle toggle
function handleToggle(id: string, state: boolean) {
  const info = itemScreenInfo.value
  if (info) {
    toggleItem(info.entity, id, state)
  }
}

// Close when dragging starts
watch(isDragging, (dragging) => {
  if (dragging) closeAll()
})

function handleFabClick() {
  if (wasDragging.value) {
    wasDragging.value = false
    return
  }
  isOpen.value = !isOpen.value
}

function handleDrill(screen: string) {
  pushScreen(screen)
}

// Close on outside click
onClickOutside(wrapperRef, () => {
  closeAll()
})
</script>

<template>
  <div
    v-if="quickMenuVisible"
    ref="wrapperRef"
    class="quick-menu"
    :style="positionStyle"
    :class="{ 'quick-menu--dragging': isDragging }"
  >
    <!-- Panel -->
    <Transition name="qm-panel">
      <v-card
        v-if="isOpen"
        class="qm-panel elevation-12"
        :class="isOnRight ? 'qm-panel--right' : 'qm-panel--left'"
        width="280"
      >
        <!-- Home screen -->
        <template v-if="currentScreen === 'home'">
          <QuickMenuThrottles />
          <template v-if="showFavorites">
            <v-divider class="opacity-10" />
            <QuickMenuFavorites />
          </template>
          <v-divider class="opacity-10" />
          <QuickMenuCloud @navigate="closeAll" @drill="handleDrill" />
        </template>

        <!-- Entity menu (effects, turnouts, etc.) -->
        <QuickMenuSubScreen
          v-else-if="subScreenConfig"
          :title="subScreenConfig.title"
          :items="subScreenConfig.items"
          @back="popScreen"
          @select="handleSubScreenSelect"
        />

        <!-- Group list (by device, by type, by tag) -->
        <QuickMenuGroupList
          v-else-if="groupScreenMeta"
          :title="groupScreenMeta.title"
          :groups="groupScreenData"
          :icon="groupScreenMeta.icon"
          :color="groupScreenMeta.color"
          @back="popScreen"
          @select="handleGroupSelect"
        />

        <!-- Item list with toggles -->
        <QuickMenuItemList
          v-else-if="itemScreenInfo"
          :title="itemScreenInfo.title"
          :items="itemListData"
          @back="popScreen"
          @toggle="handleToggle"
        />
      </v-card>
    </Transition>

    <!-- FAB (drag handle) -->
    <v-btn
      icon
      size="small"
      :color="isOpen ? 'primary' : undefined"
      class="qm-fab elevation-8"
      :class="{
        'cursor-pointer': !isDragging,
        'cursor-grabbing': isDragging,
      }"
      @pointerdown.prevent="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @click.stop="handleFabClick"
    >
      <v-icon size="20" :class="{ 'qm-fab__icon--open': isOpen }">
        {{ isOpen ? 'mdi-close' : 'mdi-train' }}
      </v-icon>
    </v-btn>
  </div>
</template>

<style scoped>
.quick-menu {
  position: fixed;
  z-index: 9999;
  width: 40px;
  height: 40px;
}

.quick-menu--dragging {
  cursor: grabbing;
}

/* FAB */
.qm-fab {
  touch-action: none;
  user-select: none;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.quick-menu--dragging .qm-fab {
  transform: scale(1.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35) !important;
}
.qm-fab__icon--open {
  transition: transform 200ms ease;
  transform: rotate(90deg);
}

/* Panel */
.qm-panel {
  position: absolute;
  bottom: 0;
  border-radius: 12px !important;
  overflow: hidden;
  backdrop-filter: blur(16px);
}
.qm-panel--left {
  left: calc(100% + 12px);
}
.qm-panel--right {
  right: calc(100% + 12px);
}

.qm-panel-enter-active,
.qm-panel-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}
.qm-panel-enter-from,
.qm-panel-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
