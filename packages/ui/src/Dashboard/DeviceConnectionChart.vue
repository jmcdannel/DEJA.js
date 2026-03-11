<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  connected: number
  disconnected: number
}

const props = defineProps<Props>()

const total = computed(() => props.connected + props.disconnected)
const percentage = computed(() => {
  if (total.value === 0) return 0
  return Math.round((props.connected / total.value) * 100)
})

const connectedDeg = computed(() => {
  if (total.value === 0) return 0
  return (props.connected / total.value) * 360
})
</script>

<template>
  <v-card variant="tonal" class="pa-4">
    <div class="text-overline text-medium-emphasis mb-3">Device Connections</div>
    <div class="d-flex align-center ga-4" style="min-height: 80px">
      <!-- Donut -->
      <div
        v-if="total > 0"
        class="donut-chart"
        :style="{
          background: `conic-gradient(
            rgb(var(--v-theme-device-connected)) 0deg ${connectedDeg}deg,
            rgb(var(--v-theme-device-disconnected)) ${connectedDeg}deg 360deg
          )`,
        }"
      >
        <div class="donut-center text-h6 font-weight-bold">
          {{ percentage }}%
        </div>
      </div>
      <div v-else class="donut-chart donut-empty">
        <div class="donut-center text-caption text-medium-emphasis">&mdash;</div>
      </div>

      <!-- Legend -->
      <div>
        <div class="d-flex align-center ga-2 mb-1">
          <div class="legend-dot bg-success" />
          <span class="text-caption">{{ connected }} Connected</span>
        </div>
        <div class="d-flex align-center ga-2">
          <div class="legend-dot bg-error" />
          <span class="text-caption">{{ disconnected }} Disconnected</span>
        </div>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.donut-chart {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.donut-empty {
  background: rgba(var(--v-theme-on-surface), 0.1);
}

.donut-center {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgb(var(--v-theme-surface));
  display: flex;
  align-items: center;
  justify-content: center;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}
</style>
