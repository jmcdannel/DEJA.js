<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import SensorForm from '@/Sensors/SensorForm.vue'
import type { Sensor } from '@repo/modules/sensors'

const router = useRouter()
const defaultSensor = computed(() => ({
  id: '',
  name: '',
  device: '',
  index: 0,
  pin: undefined,
  type: 'digital' as const,
  inputType: 'ir' as const,
  state: false,
  enabled: true,
  invertState: false,
  pullup: false,
  debounceMs: undefined,
  cooldownMs: undefined,
  maxRetries: undefined,
  retryWindowMs: undefined,
  analogThreshold: undefined,
  effectId: '',
  automationId: '',
  description: '',
  tags: [] as string[],
  color: 'teal',
} satisfies Sensor & { color: string }))

function handleClose() {
  router.push({ name: 'Sensors' })
}
</script>
<template>
  <div class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <!-- ═══ HERO HEADER ═══ -->
    <div
      class="flex items-center gap-4 p-5 rounded-[14px] border"
      style="background: linear-gradient(135deg, rgba(20,184,166,0.08), transparent); border-color: rgba(20,184,166,0.15);"
    >
      <div class="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0 bg-teal-500/80">
        <v-icon size="28" color="white">mdi-access-point</v-icon>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-white/95 tracking-tight">New Sensor</h1>
        <span class="text-xs text-white/45">Add a sensor to your layout</span>
      </div>
      <v-btn variant="outlined" size="small" class="text-none" @click="handleClose">
        <v-icon start size="16">mdi-arrow-left</v-icon> Sensors
      </v-btn>
    </div>

    <SensorForm :sensor="defaultSensor" @close="handleClose" />
  </div>
</template>
