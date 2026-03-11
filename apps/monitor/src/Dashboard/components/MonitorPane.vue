<script setup lang="ts">
import { computed } from 'vue'
import { PANE_COLORS, type PaneColorKey, type PaneState } from '../../composables/usePaneManager'

interface Props {
  paneId: string
  name: string
  index: number
  icon: string
  color: PaneColorKey
  state?: PaneState
  messageCount?: number
  isLive?: boolean
  fullScreenRoute?: string
  hideClear?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  state: 'normal',
  messageCount: 0,
  isLive: false,
  fullScreenRoute: '',
  hideClear: false,
})

const emit = defineEmits<{
  minimize: []
  restore: []
  maximize: []
  clear: []
}>()

const colors = computed(() => PANE_COLORS[props.color])
</script>

<template>
  <div
    class="monitor-pane"
    :style="{ gridArea: paneId }"
  >
    <!-- Title Bar -->
    <div :class="['monitor-pane__title-bar', colors.titleBg, colors.titleBorder]">
      <div class="monitor-pane__title-left">
        <span class="monitor-pane__index">[{{ index }}]</span>
        <v-icon :icon="icon" size="14" :class="colors.text" />
        <span :class="['monitor-pane__name', colors.text]">{{ name }}</span>
        <span v-if="isLive" class="monitor-pane__live-badge">
          <span class="monitor-pane__live-dot" />
          LIVE
        </span>
        <span v-if="messageCount > 0" class="monitor-pane__message-count">
          {{ messageCount }} msgs
        </span>
      </div>
      <div class="monitor-pane__actions">
        <button
          v-if="!hideClear"
          class="monitor-pane__action-btn"
          aria-label="Clear"
          title="Clear"
          @click="emit('clear')"
        >
          <v-icon icon="mdi-delete-outline" size="14" />
        </button>
        <button
          v-if="state !== 'minimized'"
          class="monitor-pane__action-btn"
          aria-label="Minimize"
          title="Minimize"
          @click="emit('minimize')"
        >
          <v-icon icon="mdi-window-minimize" size="14" />
        </button>
        <button
          v-if="state === 'minimized' || state === 'maximized'"
          class="monitor-pane__action-btn"
          aria-label="Restore"
          title="Restore"
          @click="emit('restore')"
        >
          <v-icon icon="mdi-window-restore" size="14" />
        </button>
        <button
          v-if="state !== 'maximized'"
          class="monitor-pane__action-btn"
          aria-label="Fullscreen"
          title="Fullscreen"
          @click="emit('maximize')"
        >
          <v-icon icon="mdi-window-maximize" size="14" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="monitor-pane__content">
      <slot />
    </div>
  </div>
</template>
