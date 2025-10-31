<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSignals, type Signal, type SignalAspect } from '@repo/modules/signals'

defineEmits(['edit'])

const { getSignals, setSignalAspect } = useSignals()
const signals = getSignals()

const color = ref('cyan')
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
  console.log('Toggling aspect', aspect, 'for signal', signal.id)
  if (!canToggle(signal, aspect)) return
  const nextAspect: SignalAspect = signal.aspect === aspect ? null : aspect
  await setSignalAspect(signal.id, nextAspect)
}

const wiring = (signal: Signal) => signal.commonAnode ? 'Common Anode' : 'Common Cathode'
const list = computed(() => signals.value || [])
</script>
<template>
  <v-container>
    <v-row>
      <v-col v-for="item in list" :key="item.id" 
        cols="auto">
        <v-card class="p-2 flex flex-col items-center bg-opacity-50" :color="color" variant="tonal" rounded>
          <v-card-title :color="color">{{ item.name || item.id }}</v-card-title>
          <v-card-text>
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
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</v-container>
</template>


