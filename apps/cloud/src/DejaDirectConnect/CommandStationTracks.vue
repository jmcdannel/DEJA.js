<script setup lang="ts">
import { computed } from 'vue'
import type { Device } from '@repo/modules'
import type { TrackOutput } from '@repo/dccex'
import { TRACK_OUTPUT_LETTERS } from '@repo/dccex'

interface Props {
  devices: Device[]
  /** @deprecated Legacy prop — only used when no devices have trackOutputs */
  dccEx?: { trackA?: string; trackB?: string }
}

const props = defineProps<Props>()

interface OutputRow {
  deviceId: string
  deviceName: string
  output: string
  mode: string
  power: boolean | null
}

const outputRows = computed<OutputRow[]>(() => {
  const rows: OutputRow[] = []

  // Build rows from all DCC-EX devices with trackOutputs
  for (const device of props.devices) {
    if (device.type !== 'dcc-ex') continue
    const outputs = device.trackOutputs
    if (!outputs || Object.keys(outputs).length === 0) continue

    for (const letter of TRACK_OUTPUT_LETTERS) {
      const config = outputs[letter]
      if (!config) continue
      rows.push({
        deviceId: device.id,
        deviceName: device.name || device.id,
        output: letter,
        mode: config.cabAddress ? `${config.mode} ${config.cabAddress}` : config.mode,
        power: config.power,
      })
    }
  }

  // Fallback to legacy dccEx prop if no trackOutputs found
  if (rows.length === 0 && props.dccEx) {
    if (props.dccEx.trackA) {
      rows.push({ deviceId: '', deviceName: '', output: 'A', mode: props.dccEx.trackA, power: null })
    }
    if (props.dccEx.trackB) {
      rows.push({ deviceId: '', deviceName: '', output: 'B', mode: props.dccEx.trackB, power: null })
    }
  }

  return rows
})

function powerColor(power: boolean | null): string {
  if (power === true) return 'text-green-500'
  if (power === false) return 'text-red-500'
  return 'text-grey-500'
}
</script>

<template>
  <div v-if="outputRows.length > 0" class="flex-grow flex flex-col max-w-64">
    <div
      v-for="row in outputRows"
      :key="`${row.deviceId}-${row.output}`"
      class="flex py-1 min-w-48 justify-between bg-purple-500 border-purple-500 border my-1 items-center py-1 px-2 rounded-full bg-opacity-20"
    >
      <v-avatar class="bg-purple-700" size="small">{{ row.output }}</v-avatar>
      <h3 class="text-sm">{{ row.mode }}</h3>
      <v-icon
        :class="powerColor(row.power)"
        size="small"
      >
        mdi-power
      </v-icon>
    </div>
  </div>
</template>
