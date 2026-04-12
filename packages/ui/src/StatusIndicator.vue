<script setup lang="ts">
import { computed } from 'vue'
import type { SignalAspect } from '@repo/modules'

/** Canonical state vocabulary for status indicators. Use `aspect` for signal heads. */
export type IndicatorStatus = 'active' | 'inactive' | 'idle' | 'pending'

interface StatusDef {
  icon: string
  color: string
  pulse?: boolean
}

const STATUS_MAP: Record<IndicatorStatus, StatusDef> = {
  active:   { icon: 'mdi-circle',         color: 'success' },
  inactive: { icon: 'mdi-circle',         color: 'error' },
  idle:     { icon: 'mdi-circle-outline', color: 'on-surface-variant' },
  pending:  { icon: 'mdi-circle',         color: 'warning', pulse: true },
}

const ASPECT_MAP: Record<Exclude<SignalAspect, null>, StatusDef> = {
  red:    { icon: 'mdi-circle', color: 'error' },
  yellow: { icon: 'mdi-circle', color: 'warning' },
  green:  { icon: 'mdi-circle', color: 'success' },
}

interface Props {
  /** Canonical status. Mutually exclusive with `aspect`. */
  status?: IndicatorStatus
  /** Signal aspect (red/yellow/green). Mutually exclusive with `status`. */
  aspect?: SignalAspect
  /** Icon size (Vuetify v-icon size). */
  size?: string | number
  /** Optional label rendered next to the indicator. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small',
})

const def = computed<StatusDef>(() => {
  if (props.aspect) return ASPECT_MAP[props.aspect]
  return STATUS_MAP[props.status ?? 'idle']
})
</script>

<template>
  <span class="inline-flex items-center gap-1.5">
    <v-icon
      :icon="def.icon"
      :color="def.color"
      :size="size"
      :class="def.pulse ? 'status-indicator-pulse' : ''"
    />
    <span v-if="label" class="text-sm opacity-80">{{ label }}</span>
  </span>
</template>

<style scoped>
.status-indicator-pulse {
  animation: status-pulse 1.4s ease-in-out infinite;
}

@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
</style>
