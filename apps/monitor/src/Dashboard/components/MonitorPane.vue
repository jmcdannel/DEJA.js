<script setup lang="ts">
import { computed } from 'vue'
import { PANE_COLORS, type PaneColorKey } from '../../composables/usePaneManager'

interface Props {
  paneId: string
  name: string
  index: number
  icon: string
  color: PaneColorKey
  messageCount?: number
  isLive?: boolean
  fullScreenRoute?: string
}

const props = withDefaults(defineProps<Props>(), {
  messageCount: 0,
  isLive: false,
  fullScreenRoute: '',
})

const emit = defineEmits<{
  minimize: []
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
          class="monitor-pane__action-btn"
          aria-label="Clear"
          title="Clear"
          @click="emit('clear')"
        >
          <v-icon icon="mdi-delete-outline" size="14" />
        </button>
        <button
          class="monitor-pane__action-btn"
          aria-label="Minimize"
          title="Minimize"
          @click="emit('minimize')"
        >
          <v-icon icon="mdi-window-minimize" size="14" />
        </button>
        <button
          class="monitor-pane__action-btn"
          aria-label="Maximize"
          title="Maximize"
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
