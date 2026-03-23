<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/Core/UI/PageHeader.vue'
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
  <PageHeader menu="Sensors" />
  <SensorForm :sensor="defaultSensor" @close="handleClose" />
</template>
