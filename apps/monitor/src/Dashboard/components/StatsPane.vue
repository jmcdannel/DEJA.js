<script setup lang="ts">
import { computed } from 'vue'
import { useLayout, useLocos, useTurnouts, useEfx, useSignals } from '@repo/modules'

const { getDevices } = useLayout()
const { getThrottles } = useLocos()
const { getTurnouts } = useTurnouts()
const { getEffects } = useEfx()
const { getSignals } = useSignals()

const devices = getDevices()
const throttles = getThrottles()
const turnouts = getTurnouts()
const effects = getEffects()
const signals = getSignals()

function toArray(ref: unknown): unknown[] {
  if (Array.isArray(ref)) return ref
  const candidate = ref as { value?: unknown }
  if (candidate && Array.isArray(candidate.value)) return candidate.value
  return []
}

const resolvedDevices = computed(() => toArray(devices))
const resolvedThrottles = computed(() => toArray(throttles))
const resolvedTurnouts = computed(() => toArray(turnouts))
const resolvedEffects = computed(() => toArray(effects))
const resolvedSignals = computed(() => toArray(signals))

const connectedDeviceCount = computed(() =>
  resolvedDevices.value.filter((d) => (d as Record<string, unknown>).connected).length
)

const activeLocos = computed(() =>
  resolvedThrottles.value.filter((t) => ((t as Record<string, unknown>).speed as number) > 0).length
)

const stats = computed(() => [
  { label: 'Active Locos', value: `${activeLocos.value} / ${resolvedThrottles.value.length}` },
  { label: 'Turnouts', value: `${resolvedTurnouts.value.length}` },
  { label: 'Effects', value: `${resolvedEffects.value.length}` },
  { label: 'Signals', value: `${resolvedSignals.value.length}` },
  { label: 'Devices', value: `${connectedDeviceCount.value} / ${resolvedDevices.value.length}` },
  { label: 'Total', value: `${resolvedThrottles.value.length + resolvedTurnouts.value.length + resolvedEffects.value.length + resolvedSignals.value.length}` },
])
</script>

<template>
  <div class="monitor-pane__stats-grid h-full">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="monitor-pane__stat-row"
    >
      <span class="monitor-pane__stat-label">{{ stat.label }}</span>
      <span class="monitor-pane__stat-value">{{ stat.value }}</span>
    </div>
  </div>
</template>
