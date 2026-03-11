<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CvProgrammingMode, CvResponse } from '@repo/modules'
import { validateCvNumber, validateCvValue, valueToBinary, getBit, setBit } from './cvHelpers'

const props = defineProps<{
  mode: CvProgrammingMode
  isBusy: boolean
  isConnected: boolean
}>()

const emit = defineEmits<{
  read: [cv: number]
  write: [cv: number, value: number]
  'write-bit': [cv: number, bit: number, value: 0 | 1]
  verify: [cv: number, expectedValue: number]
}>()

const cvNumber = ref(1)
const cvValue = ref(0)
const lastResult = ref<CvResponse | null>(null)
const isReading = ref(false)
const isWriting = ref(false)

const cvNumberValid = computed(() => validateCvNumber(cvNumber.value))
const cvValueValid = computed(() => validateCvValue(cvValue.value))
const canRead = computed(() => props.mode === 'service' && cvNumberValid.value && props.isConnected && !props.isBusy)
const canWrite = computed(() => cvNumberValid.value && cvValueValid.value && props.isConnected && !props.isBusy)

const binaryDisplay = computed(() => valueToBinary(cvValue.value))
const bits = computed(() =>
  Array.from({ length: 8 }, (_, i) => ({
    bit: i,
    label: `Bit ${i}`,
    value: getBit(cvValue.value, i),
  })).reverse()
)

async function handleRead() {
  isReading.value = true
  lastResult.value = null
  try {
    const response = await (emit('read', cvNumber.value) as unknown as Promise<CvResponse>)
    lastResult.value = response
    if (response?.success && response.value !== undefined) {
      cvValue.value = response.value
    }
  } finally {
    isReading.value = false
  }
}

async function handleWrite() {
  isWriting.value = true
  lastResult.value = null
  try {
    const response = await (emit('write', cvNumber.value, cvValue.value) as unknown as Promise<CvResponse>)
    lastResult.value = response
  } finally {
    isWriting.value = false
  }
}

async function handleVerify() {
  isReading.value = true
  lastResult.value = null
  try {
    const response = await (emit('verify', cvNumber.value, cvValue.value) as unknown as Promise<CvResponse>)
    lastResult.value = response
    if (response?.success && response.value !== undefined) {
      cvValue.value = response.value
    }
  } finally {
    isReading.value = false
  }
}

function toggleBit(bit: number) {
  const current = getBit(cvValue.value, bit)
  cvValue.value = setBit(cvValue.value, bit, !current)
}
</script>

<template>
  <v-card-text class="space-y-6">
    <!-- Input fields -->
    <div class="flex flex-wrap items-start gap-4">
      <v-text-field
        v-model.number="cvNumber"
        label="CV Number"
        type="number"
        :min="1"
        :max="1024"
        :rules="[() => cvNumberValid || 'CV must be 1-1024']"
        density="comfortable"
        variant="outlined"
        style="max-width: 200px"
        prepend-inner-icon="mdi-pound"
      />

      <v-text-field
        v-model.number="cvValue"
        label="Value"
        type="number"
        :min="0"
        :max="255"
        :rules="[() => cvValueValid || 'Value must be 0-255']"
        density="comfortable"
        variant="outlined"
        style="max-width: 200px"
        prepend-inner-icon="mdi-numeric"
      />

      <div class="flex gap-2 pt-1">
        <v-btn
          color="info"
          variant="flat"
          :disabled="!canRead"
          :loading="isReading"
          prepend-icon="mdi-book-open-variant"
          @click="handleRead"
        >
          Read
        </v-btn>

        <v-btn
          color="success"
          variant="flat"
          :disabled="!canWrite"
          :loading="isWriting"
          prepend-icon="mdi-content-save"
          @click="handleWrite"
        >
          Write
        </v-btn>

        <v-btn
          color="warning"
          variant="outlined"
          :disabled="!canRead || !cvValueValid"
          :loading="isReading"
          prepend-icon="mdi-check-circle"
          @click="handleVerify"
        >
          Verify
        </v-btn>
      </div>
    </div>

    <!-- POM mode alert -->
    <v-alert
      v-if="mode === 'pom'"
      type="info"
      variant="tonal"
      density="compact"
    >
      Programming on Main (POM) is write-only. The decoder cannot acknowledge writes on the main track.
    </v-alert>

    <!-- Result display -->
    <v-card v-if="lastResult" variant="outlined" class="pa-4">
      <div class="flex items-center gap-3">
        <v-icon :color="lastResult.success ? 'success' : 'error'" size="large">
          {{ lastResult.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <div>
          <div class="text-sm font-semibold">
            {{ lastResult.success ? 'Success' : 'Failed' }}
          </div>
          <div v-if="lastResult.success && lastResult.value !== undefined" class="text-sm text-slate-400">
            CV {{ lastResult.cv }} = {{ lastResult.value }} (0x{{ lastResult.value.toString(16).toUpperCase().padStart(2, '0') }})
          </div>
          <div v-if="lastResult.error" class="text-sm text-red-400">
            {{ lastResult.error }}
          </div>
        </div>
      </div>
    </v-card>

    <!-- Binary breakdown -->
    <v-card variant="outlined" class="pa-4">
      <div class="text-sm font-semibold mb-3">Binary Breakdown</div>
      <div class="flex items-center gap-2 mb-3">
        <span class="text-xs text-slate-400">Decimal:</span>
        <span class="font-mono text-sm">{{ cvValue }}</span>
        <span class="text-xs text-slate-400 ml-2">Hex:</span>
        <span class="font-mono text-sm">0x{{ cvValue.toString(16).toUpperCase().padStart(2, '0') }}</span>
        <span class="text-xs text-slate-400 ml-2">Binary:</span>
        <span class="font-mono text-sm">{{ binaryDisplay }}</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <v-chip
          v-for="b in bits"
          :key="b.bit"
          :color="b.value ? 'info' : 'default'"
          :variant="b.value ? 'flat' : 'outlined'"
          size="small"
          class="font-mono cursor-pointer"
          @click="toggleBit(b.bit)"
        >
          {{ b.label }}: {{ b.value ? '1' : '0' }}
        </v-chip>
      </div>
    </v-card>
  </v-card-text>
</template>
