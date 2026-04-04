<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLogger } from '@repo/utils'
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
        <h1 class="text-xl font-bold text-white/95 tracking-tight">{{ sensor?.name || 'Edit Sensor' }}</h1>
        <span class="text-xs text-white/45">Configure sensor settings</span>
      </div>
      <v-btn variant="outlined" size="small" class="text-none" @click="handleClose">
        <v-icon start size="16">mdi-arrow-left</v-icon> Sensors
      </v-btn>
    </div>

    <div v-if="loading" class="p-6 flex justify-center">
      <v-progress-circular indeterminate color="teal" />
    </div>
    <v-alert v-else-if="error" type="error" class="ma-4" :text="error" closable @click:close="handleClose" />
    <SensorForm v-else-if="sensor" :sensor="sensor" @close="handleClose" />
  </div>
</template>
