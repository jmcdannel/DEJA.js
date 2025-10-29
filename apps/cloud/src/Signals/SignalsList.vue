<script setup lang="ts">
import { computed } from 'vue'
import { useSignals, type Signal, type SignalAspect } from '@repo/modules/signals'

const emit = defineEmits(['edit'])
const { getSignals, setSignalAspect } = useSignals()
const signals = getSignals()

const aspectLabels: Record<Exclude<SignalAspect, null>, string> = {
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
}

function canToggle(signal: Signal, aspect: Exclude<SignalAspect, null>): boolean {
  const pinMap: Record<Exclude<SignalAspect, null>, number | undefined> = {
    red: signal.red,
    yellow: signal.yellow,
    green: signal.green,
  }
  return typeof pinMap[aspect] === 'number'
}

async function toggleAspect(signal: Signal, aspect: Exclude<SignalAspect, null>) {
  if (!canToggle(signal, aspect)) return
  const nextAspect: SignalAspect = signal.aspect === aspect ? null : aspect
  await setSignalAspect(signal.id, nextAspect)
}

const wiring = (signal: Signal) => signal.commonAnode ? 'Common Anode' : 'Common Cathode'

const sortedSignals = computed(() => signals.value || [])

</script>
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <slot name="prepend"></slot>
      </v-col>
      <v-col
        v-for="item in sortedSignals"
        :key="item.id"
        cols="12" xs="12" sm="12" lg="12"
      >
        <v-card class="w-full">
          <v-card-title class="flex items-center justify-between">
            <span>{{ item.name || item.id }}</span>
            <v-btn icon="mdi-pencil" variant="text" size="small" @click="$emit('edit', item)" />
          </v-card-title>
          <v-card-text>
            <div class="flex flex-wrap gap-6 items-center">
              <div class="flex items-center gap-3">
                <div class="flex flex-col items-center p-3 rounded-lg bg-neutral-900 border border-neutral-700" style="width: 72px;">
                  <v-btn
                    icon="mdi-circle"
                    size="small"
                    :color="item.aspect === 'red' ? 'red-darken-1' : 'red'"
                    :variant="item.aspect === 'red' ? 'flat' : 'tonal'"
                    :disabled="!canToggle(item, 'red')"
                    @click="toggleAspect(item, 'red')"
                  />
                  <v-btn
                    icon="mdi-circle"
                    class="my-2"
                    size="small"
                    :color="item.aspect === 'yellow' ? 'amber-darken-2' : 'amber'"
                    :variant="item.aspect === 'yellow' ? 'flat' : 'tonal'"
                    :disabled="!canToggle(item, 'yellow')"
                    @click="toggleAspect(item, 'yellow')"
                  />
                  <v-btn
                    icon="mdi-circle"
                    size="small"
                    :color="item.aspect === 'green' ? 'green-darken-2' : 'green'"
                    :variant="item.aspect === 'green' ? 'flat' : 'tonal'"
                    :disabled="!canToggle(item, 'green')"
                    @click="toggleAspect(item, 'green')"
                  />
                </div>
                <div>
                  <div class="text-xs opacity-70">Pins</div>
                  <div class="text-sm">R: {{ item.red ?? '-' }} • Y: {{ item.yellow ?? '-' }} • G: {{ item.green ?? '-' }}</div>
                </div>
              </div>
              <v-chip variant="tonal" color="emerald">
                {{ wiring(item) }}
              </v-chip>
              <v-chip v-if="item.aspect" variant="tonal" color="blue">
                Active: {{ aspectLabels[item.aspect] }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

</template>


