<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/Core/UI/PageHeader.vue'
import SensorForm from '@/Sensors/SensorForm.vue'
import type { Sensor } from '@repo/modules/sensors'

const router = useRouter()
const defaultSensor = computed<Sensor>(() => ({
  id: '',
  name: '',
  device: '',
  index: undefined,
  pin: undefined,
  type: 'digital',
  inputType: 'normally-open',
  state: false,
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
  tags: [],
  color: 'teal',
}))

function handleClose() {
  router.push({ name: 'Sensors' })
}
</script>
<template>
  <PageHeader menu="Sensors" />
  <SensorForm :sensor="defaultSensor" @close="handleClose" />
</template>
