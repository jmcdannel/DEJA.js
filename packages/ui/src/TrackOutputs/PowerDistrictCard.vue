<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PowerDistrict } from '@repo/modules'
import type { TrackOutput } from '@repo/dccex'

interface Props {
  district: PowerDistrict
  deviceName?: string
  trackOutput?: TrackOutput | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  deviceName: 'Unknown Device',
  trackOutput: null,
  disabled: false,
})

const emit = defineEmits<{
  togglePower: [district: PowerDistrict, newState: boolean]
  delete: [district: PowerDistrict]
}>()

const optimisticPower = ref<boolean>(false)

watch(
  () => props.trackOutput?.power,
  (val) => {
    if (typeof val === 'boolean') {
      optimisticPower.value = val
    }
  },
  { immediate: true },
)

const powerColor = computed(() => {
  if (props.trackOutput?.power === true) return 'success'
  if (props.trackOutput?.power === false) return 'error'
  return 'grey'
})

const modeLabel = computed(() => props.trackOutput?.mode ?? '—')

function togglePower() {
  const newState = !optimisticPower.value
  optimisticPower.value = newState
  emit('togglePower', props.district, newState)
}
</script>

<template>
  <v-card variant="outlined" class="mb-2">
    <v-card-text class="d-flex align-center gap-3 py-2 px-3">
      <v-avatar
        :color="district.color || 'primary'"
        size="32"
        variant="tonal"
      >
        <v-icon size="small">mdi-lightning-bolt</v-icon>
      </v-avatar>

      <div class="flex-grow-1">
        <div class="text-subtitle-2 font-weight-medium">{{ district.name }}</div>
        <div class="text-caption text-medium-emphasis">
          {{ deviceName }} · Output {{ district.output }} · {{ modeLabel }}
        </div>
      </div>

      <v-chip
        :color="powerColor"
        size="small"
        variant="tonal"
        label
        class="mr-2"
      >
        {{ trackOutput?.power === true ? 'ON' : trackOutput?.power === false ? 'OFF' : '—' }}
      </v-chip>

      <v-btn
        :color="optimisticPower ? 'success' : undefined"
        icon="mdi-power"
        variant="tonal"
        size="small"
        :disabled="disabled"
        @click="togglePower"
        title="Toggle power"
      />

      <v-btn
        icon="mdi-delete"
        variant="text"
        size="small"
        color="error"
        @click="emit('delete', district)"
        title="Remove district"
      />
    </v-card-text>
  </v-card>
</template>
