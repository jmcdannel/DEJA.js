<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLogger } from '@repo/utils'
import { PageHeader } from '@repo/ui'
import SensorForm from '@/Sensors/SensorForm.vue'
import type { Sensor } from '@repo/modules/sensors'
import { useSensors } from '@repo/modules/sensors'
import { useNotification } from '@repo/ui'

const log = createLogger('EditSensor')

const route = useRoute()
const router = useRouter()
const { getSensor } = useSensors()
const { notify } = useNotification()
const sensor = ref<Sensor | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function loadSensor() {
  loading.value = true
  error.value = null
  const sensorId = route.params.sensorId as string
  try {
    const result = await getSensor(sensorId)
    if (result) {
      sensor.value = result
    } else {
      error.value = 'Sensor not found.'
    }
  } catch (err) {
    log.error(err)
    notify.error('Unable to load sensor.')
    error.value = 'Unable to load sensor.'
  } finally {
    loading.value = false
  }
}

function handleClose() {
  router.push({ name: 'Sensors' })
}

onMounted(loadSensor)
</script>
<template>
  <PageHeader title="Sensors" icon="mdi-access-point" color="teal" />
  <div v-if="loading" class="p-6 flex justify-center">
    <v-progress-circular indeterminate color="teal" />
  </div>
  <v-alert v-else-if="error" type="error" class="ma-4" :text="error" closable @click:close="handleClose" />
  <SensorForm v-else-if="sensor" :sensor="sensor" @close="handleClose" />
</template>
