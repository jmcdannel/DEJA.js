<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  data: readonly { timestamp: number; count: number }[]
}

const props = defineProps<Props>()

const maxCount = computed(() => {
  if (props.data.length === 0) return 1
  return Math.max(...props.data.map((d) => d.count), 1)
})

const bars = computed(() => {
  return props.data.map((d) => ({
    ...d,
    heightPercent: (d.count / maxCount.value) * 100,
  }))
})

const timeLabel = computed(() => {
  if (props.data.length === 0) return { start: '', end: '' }
  const start = new Date(props.data[0].timestamp)
  const end = new Date(props.data[props.data.length - 1].timestamp)
  const fmt = (d: Date) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  return { start: fmt(start), end: fmt(end) }
})
</script>

<template>
  <v-card variant="tonal" class="pa-4">
    <div class="text-overline text-medium-emphasis mb-3">Command Activity</div>
    <div
      v-if="data.length > 0"
      class="d-flex align-end ga-1"
      style="height: 80px"
    >
      <div
        v-for="(bar, i) in bars"
        :key="i"
        class="activity-bar rounded-t-sm"
        :style="{ height: `${bar.heightPercent}%`, flex: 1 }"
      />
    </div>
    <div v-else class="d-flex align-center justify-center" style="height: 80px">
      <span class="text-caption text-medium-emphasis">No activity data yet</span>
    </div>
    <div v-if="data.length > 0" class="d-flex justify-space-between mt-1">
      <span class="text-caption text-medium-emphasis">{{ timeLabel.start }}</span>
      <span class="text-caption text-medium-emphasis">{{ timeLabel.end }}</span>
    </div>
  </v-card>
</template>

<style scoped>
.activity-bar {
  background: rgba(var(--v-theme-primary), 0.4);
  transition: height 0.3s ease;
  min-width: 4px;
}

.activity-bar:hover {
  background: rgba(var(--v-theme-primary), 0.7);
}
</style>
