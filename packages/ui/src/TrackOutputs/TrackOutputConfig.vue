<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  TRACK_MODES,
  TRACK_OUTPUT_LETTERS,
  DEFAULT_MAX_OUTPUTS,
  requiresCabAddress,
  isBoostMode,
  isValidCabAddress,
  type TrackOutput,
  type TrackMode,
  type TrackOutputLetter,
} from '@repo/dccex'

interface Props {
  trackOutputs: Record<string, TrackOutput>
  maxOutputs?: number
  isDevice1?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxOutputs: DEFAULT_MAX_OUTPUTS,
  isDevice1: false,
  disabled: false,
})

const emit = defineEmits<{
  save: [outputs: Record<string, TrackOutput>]
}>()

// Local editable copy
const localOutputs = ref<Record<string, TrackOutput>>({})

watch(
  () => props.trackOutputs,
  (val) => {
    localOutputs.value = JSON.parse(JSON.stringify(val))
  },
  { immediate: true, deep: true },
)

const visibleLetters = computed<TrackOutputLetter[]>(() =>
  TRACK_OUTPUT_LETTERS.slice(0, props.maxOutputs),
)

function getOutput(letter: string): TrackOutput {
  return localOutputs.value[letter] ?? { mode: 'NONE', power: null }
}

function setMode(letter: string, mode: TrackMode) {
  if (!localOutputs.value[letter]) {
    localOutputs.value[letter] = { mode, power: null }
  } else {
    localOutputs.value[letter].mode = mode
  }
  // Clear cabAddress when switching away from DC modes
  if (!requiresCabAddress(mode)) {
    delete localOutputs.value[letter].cabAddress
  }
}

function setCabAddress(letter: string, address: number) {
  if (localOutputs.value[letter]) {
    localOutputs.value[letter].cabAddress = address
  }
}

function isProgDisabled(letter: string): boolean {
  // PROG only allowed on Device 1, Output B
  return !(props.isDevice1 && letter === 'B')
}

function getModeOptions(letter: string) {
  return TRACK_MODES.map((m) => ({
    ...m,
    disabled: m.value === 'PROG' && isProgDisabled(letter),
  }))
}

function powerColor(power: boolean | null): string {
  if (power === true) return 'success'
  if (power === false) return 'error'
  return 'grey'
}

function powerLabel(power: boolean | null): string {
  if (power === true) return 'ON'
  if (power === false) return 'OFF'
  return '—'
}

const hasChanges = computed(() => {
  return JSON.stringify(localOutputs.value) !== JSON.stringify(props.trackOutputs)
})

const hasValidationErrors = computed(() => {
  for (const letter of visibleLetters.value) {
    const output = getOutput(letter)
    if (requiresCabAddress(output.mode)) {
      if (!output.cabAddress || !isValidCabAddress(output.cabAddress)) {
        return true
      }
    }
  }
  return false
})

function save() {
  emit('save', { ...localOutputs.value })
}
</script>

<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-title class="text-subtitle-1 d-flex align-center gap-2">
      <v-icon size="small">mdi-resistor</v-icon>
      Track Outputs
    </v-card-title>
    <v-card-text class="pa-0">
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-center" style="width: 60px">Output</th>
            <th>Mode</th>
            <th style="width: 140px">Cab Address</th>
            <th class="text-center" style="width: 80px">Power</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="letter in visibleLetters" :key="letter">
            <td class="text-center">
              <v-avatar size="28" color="primary" variant="tonal">
                <span class="text-caption font-weight-bold">{{ letter }}</span>
              </v-avatar>
            </td>
            <td>
              <v-select
                :model-value="getOutput(letter).mode"
                @update:model-value="(val: TrackMode) => setMode(letter, val)"
                :items="getModeOptions(letter)"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                :disabled="disabled"
              >
                <template #item="{ item, props: itemProps }">
                  <v-list-item
                    v-bind="itemProps"
                    :disabled="item.raw.disabled"
                    :subtitle="item.raw.description"
                  >
                    <template v-if="item.raw.disabled" #append>
                      <v-tooltip location="end">
                        <template #activator="{ props: tipProps }">
                          <v-icon v-bind="tipProps" size="small" color="warning">mdi-information</v-icon>
                        </template>
                        Programming track is only supported on the first command station's second output (B)
                      </v-tooltip>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
              <div
                v-if="isBoostMode(getOutput(letter).mode)"
                class="text-caption text-warning mt-1"
              >
                ⚠️ ESP32 only
              </div>
            </td>
            <td>
              <v-text-field
                v-if="requiresCabAddress(getOutput(letter).mode)"
                type="number"
                :model-value="getOutput(letter).cabAddress"
                @update:model-value="(val: string | number) => setCabAddress(letter, Number(val))"
                :min="1"
                :max="10239"
                density="compact"
                variant="outlined"
                hide-details="auto"
                placeholder="1–10239"
                :disabled="disabled"
                :error="
                  requiresCabAddress(getOutput(letter).mode) &&
                  !!getOutput(letter).cabAddress &&
                  !isValidCabAddress(getOutput(letter).cabAddress!)
                "
              />
              <span v-else class="text-disabled text-caption">—</span>
            </td>
            <td class="text-center">
              <v-chip
                :color="powerColor(getOutput(letter).power)"
                size="small"
                variant="tonal"
                label
              >
                {{ powerLabel(getOutput(letter).power) }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        color="primary"
        variant="flat"
        size="small"
        :disabled="disabled || !hasChanges || hasValidationErrors"
        @click="save"
      >
        <v-icon start size="small">mdi-content-save</v-icon>
        Save Track Config
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
