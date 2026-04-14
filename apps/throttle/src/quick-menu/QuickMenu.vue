<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { onClickOutside, useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'
import { useDraggableFab } from './useDraggableFab'
import { useQuickMenu } from './useQuickMenu'
import { useFeatureFlags } from '@repo/modules'
import dejaLogo from '@repo/ui/src/assets/icons/deja.png'
import QuickMenuThrottles from './QuickMenuThrottles.vue'
import QuickMenuFavorites from './QuickMenuFavorites.vue'
import QuickMenuPrompt from './QuickMenuPrompt.vue'

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

const { isOpen, quickMenuVisible, closeAll } = useQuickMenu()

const { isEnabled } = useFeatureFlags()
const showFavorites = computed(() => isEnabled('quickMenuFavorites'))

const user = useCurrentUser()
const layoutId = useStorage('@DEJA/layoutId', '')
const canShow = computed(() => !!user.value && !!layoutId.value && quickMenuVisible.value)

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

onClickOutside(wrapperRef, () => {
  closeAll()
})
</script>

<template>
  <div
    v-if="canShow"
    ref="wrapperRef"
    class="quick-menu"
    :style="positionStyle"
    :class="{ 'quick-menu--dragging': isDragging }"
  >
    <Transition name="qm-panel">
      <v-card
        v-if="isOpen"
        class="qm-panel elevation-12"
        :class="isOnRight ? 'qm-panel--right' : 'qm-panel--left'"
        width="280"
      >
        <QuickMenuThrottles />
        <template v-if="showFavorites">
          <v-divider class="opacity-10" />
          <QuickMenuFavorites />
        </template>
        <v-divider class="opacity-10" />
        <QuickMenuPrompt />
      </v-card>
    </Transition>

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
      <v-icon v-if="isOpen" size="20" class="qm-fab__icon--open">mdi-close</v-icon>
      <img
        v-else
        :src="dejaLogo"
        alt="DEJA.js"
        class="qm-fab__logo"
      />
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

.qm-fab {
  touch-action: none;
  user-select: none;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.quick-menu--dragging .qm-fab {
  transform: scale(1.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35) !important;
}
.qm-fab__logo {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  pointer-events: none;
}
.qm-fab__icon--open {
  transition: transform 200ms ease;
  transform: rotate(90deg);
}

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
