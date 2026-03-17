<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CvProgrammingMode, Cv29Flags, CvResponse } from '@repo/modules'

const props = defineProps<{
  mode: CvProgrammingMode
  isBusy: boolean
  isConnected: boolean
  decodeCv29: (value: number) => Cv29Flags
  encodeCv29: (flags: Cv29Flags) => number
}>()

const emit = defineEmits<{
  read: [cv: number]
  write: [cv: number, value: number]
}>()

const flags = ref<Cv29Flags>({
  direction: false,
  speedSteps28: true,
  analogConversion: true,
  railcomEnabled: false,
  speedTable: false,
  longAddress: false,
})

const cv29Value = computed(() => props.encodeCv29(flags.value))
const isReading = ref(false)
const isWriting = ref(false)
const lastResult = ref<CvResponse | null>(null)

const canRead = computed(() => props.mode === 'service' && props.isConnected && !props.isBusy)
const canWrite = computed(() => props.isConnected && !props.isBusy)

const flagDefinitions = [
  { key: 'direction' as const, label: 'Direction Reversed', description: 'Reverse locomotive direction', bit: 0 },
  { key: 'speedSteps28' as const, label: '28/128 Speed Steps', description: '28-step mode (off = 14-step)', bit: 1 },
  { key: 'analogConversion' as const, label: 'Analog (DC) Conversion', description: 'Allow running on DC power', bit: 2 },
  { key: 'railcomEnabled' as const, label: 'RailCom Enabled', description: 'Enable RailCom feedback', bit: 3 },
  { key: 'speedTable' as const, label: 'Speed Table Active', description: 'Use CV67-94 speed curve instead of Vstart/Vmid/Vhigh', bit: 4 },
  { key: 'longAddress' as const, label: 'Long Address', description: 'Use extended address (CV17/18) instead of short address (CV1)', bit: 5 },
]

async function handleRead() {
  isReading.value = true
  lastResult.value = null
  try {
    const response = await (emit('read', 29) as unknown as Promise<CvResponse>)
    lastResult.value = response
    if (response?.success && response.value !== undefined) {
      flags.value = props.decodeCv29(response.value)
    }
  } finally {
    isReading.value = false
  }
}

async function handleWrite() {
  isWriting.value = true
  lastResult.value = null
  try {
    const response = await (emit('write', 29, cv29Value.value) as unknown as Promise<CvResponse>)
    lastResult.value = response
  } finally {
    isWriting.value = false
  }
}
</script>

<template>
  <v-card-text class="space-y-4">
    <div class="flex items-center gap-3 mb-4">
      <v-btn
        color="info"
        variant="flat"
        :disabled="!canRead"
        :loading="isReading"
        prepend-icon="mdi-book-open-variant"
        @click="handleRead"
      >
        Read CV29
      </v-btn>
      <v-btn
        color="success"
        variant="flat"
        :disabled="!canWrite"
        :loading="isWriting"
        prepend-icon="mdi-content-save"
        @click="handleWrite"
      >
        Write CV29
      </v-btn>
      <v-chip variant="outlined" class="font-mono">
        Value: {{ cv29Value }} (0x{{ cv29Value.toString(16).toUpperCase().padStart(2, '0') }})
      </v-chip>
    </div>

    <!-- Result -->
    <v-alert
      v-if="lastResult"
      :type="lastResult.success ? 'success' : 'error'"
      variant="tonal"
      density="compact"
      closable
      @click:close="lastResult = null"
    >
      {{ lastResult.success ? `CV29 = ${lastResult.value}` : lastResult.error }}
    </v-alert>

    <!-- Flag toggles -->
    <v-card variant="outlined">
      <v-list>
        <v-list-item v-for="flag in flagDefinitions" :key="flag.key">
          <template #prepend>
            <v-chip size="x-small" variant="outlined" class="font-mono mr-3">
              Bit {{ flag.bit }}
            </v-chip>
          </template>
          <v-list-item-title>{{ flag.label }}</v-list-item-title>
          <v-list-item-subtitle>{{ flag.description }}</v-list-item-subtitle>
          <template #append>
            <v-switch
              v-model="flags[flag.key]"
              color="info"
              density="compact"
              hide-details
            />
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Long address warning -->
    <v-alert
      v-if="flags.longAddress"
      type="warning"
      variant="tonal"
      density="compact"
      prepend-icon="mdi-alert"
    >
      Long address mode is enabled. Make sure CV17 and CV18 are set correctly before writing CV29.
      Use the Address tab to configure the long address.
    </v-alert>
  </v-card-text>
</template>
