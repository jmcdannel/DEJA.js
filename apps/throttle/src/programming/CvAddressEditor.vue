<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CvProgrammingMode, CvResponse } from '@repo/modules'

const props = defineProps<{
  mode: CvProgrammingMode
  isBusy: boolean
  isConnected: boolean
  longAddressToCv17Cv18: (address: number) => { cv17: number; cv18: number }
  cv17Cv18ToLongAddress: (cv17: number, cv18: number) => number
}>()

const emit = defineEmits<{
  read: [cv: number]
  write: [cv: number, value: number]
  readAddress: []
  writeAddress: [address: number]
}>()

const shortAddress = ref(3)
const longAddress = ref(128)
const lastResult = ref<CvResponse | null>(null)
const isLoading = ref(false)

const canRead = computed(() => props.mode === 'service' && props.isConnected && !props.isBusy)
const canWrite = computed(() => props.isConnected && !props.isBusy)

const shortAddressValid = computed(() => Number.isInteger(shortAddress.value) && shortAddress.value >= 1 && shortAddress.value <= 127)
const longAddressValid = computed(() => Number.isInteger(longAddress.value) && longAddress.value >= 128 && longAddress.value <= 9999)

const calculatedCvs = computed(() => props.longAddressToCv17Cv18(longAddress.value))

async function handleReadAddress() {
  isLoading.value = true
  lastResult.value = null
  try {
    const response = await (emit('readAddress') as unknown as Promise<CvResponse>)
    lastResult.value = response
    if (response?.success && response.address !== undefined) {
      if (response.address <= 127) {
        shortAddress.value = response.address
      } else {
        longAddress.value = response.address
      }
    }
  } finally {
    isLoading.value = false
  }
}

async function handleWriteShortAddress() {
  isLoading.value = true
  lastResult.value = null
  try {
    const response = await (emit('writeAddress', shortAddress.value) as unknown as Promise<CvResponse>)
    lastResult.value = response
  } finally {
    isLoading.value = false
  }
}

async function handleWriteLongAddress() {
  isLoading.value = true
  lastResult.value = null
  try {
    const response = await (emit('writeAddress', longAddress.value) as unknown as Promise<CvResponse>)
    lastResult.value = response
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <v-card-text class="space-y-6">
    <!-- Read current address -->
    <div class="flex items-center gap-3">
      <v-btn
        color="info"
        variant="flat"
        :disabled="!canRead"
        :loading="isLoading"
        prepend-icon="mdi-book-open-variant"
        @click="handleReadAddress"
      >
        Read Current Address
      </v-btn>
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
      {{ lastResult.success ? `Address: ${lastResult.address}` : lastResult.error }}
    </v-alert>

    <v-divider />

    <!-- Short Address -->
    <v-card variant="outlined" class="pa-4">
      <div class="text-sm font-semibold mb-3">Short Address (CV1)</div>
      <div class="flex items-start gap-4">
        <v-text-field
          v-model.number="shortAddress"
          label="Short Address"
          type="number"
          :min="1"
          :max="127"
          :rules="[() => shortAddressValid || 'Must be 1-127']"
          density="comfortable"
          variant="outlined"
          style="max-width: 200px"
          prepend-inner-icon="mdi-pound"
        />
        <v-btn
          color="success"
          variant="flat"
          :disabled="!canWrite || !shortAddressValid"
          :loading="isLoading"
          prepend-icon="mdi-content-save"
          @click="handleWriteShortAddress"
        >
          Write Short Address
        </v-btn>
      </div>
      <div class="text-xs opacity-50">
        Range: 1-127. Uses CV1. CV29 bit 5 will be set to 0 (short address mode).
      </div>
    </v-card>

    <!-- Long Address -->
    <v-card variant="outlined" class="pa-4">
      <div class="text-sm font-semibold mb-3">Long Address (CV17 + CV18)</div>
      <div class="flex items-start gap-4">
        <v-text-field
          v-model.number="longAddress"
          label="Long Address"
          type="number"
          :min="128"
          :max="9999"
          :rules="[() => longAddressValid || 'Must be 128-9999']"
          density="comfortable"
          variant="outlined"
          style="max-width: 200px"
          prepend-inner-icon="mdi-pound"
        />
        <v-btn
          color="success"
          variant="flat"
          :disabled="!canWrite || !longAddressValid"
          :loading="isLoading"
          prepend-icon="mdi-content-save"
          @click="handleWriteLongAddress"
        >
          Write Long Address
        </v-btn>
      </div>
      <div class="flex gap-4 mt-2">
        <v-chip size="small" variant="outlined" class="font-mono">
          CV17 = {{ calculatedCvs.cv17 }}
        </v-chip>
        <v-chip size="small" variant="outlined" class="font-mono">
          CV18 = {{ calculatedCvs.cv18 }}
        </v-chip>
      </div>
      <div class="text-xs opacity-50 mt-2">
        Range: 128-9999. Uses CV17/CV18. CV29 bit 5 will be set to 1 (long address mode).
        The <code>&lt;W address&gt;</code> command handles CV17, CV18, and CV29 automatically.
      </div>
    </v-card>

    <!-- Info -->
    <v-alert type="info" variant="tonal" density="compact" prepend-icon="mdi-information">
      DCC-EX's <code>&lt;W address&gt;</code> command automatically sets CV1 or CV17/CV18 and
      updates CV29 bit 5 based on whether the address is short (&lt;128) or long (&ge;128).
    </v-alert>
  </v-card-text>
</template>
