<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSignals, type Signal, type SignalAspect } from '@repo/modules/signals'

defineEmits(['edit'])

const { getSignals, setSignalAspect, deleteSignal } = useSignals()
const signals = getSignals()

const color = ref('cyan')
const confirmDelete = ref('')
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
const list = computed(() => signals.value || [])
</script>
<template>
  <v-container>
    <v-row>
      <v-col 
        cols="12"
        xs="12"
        sm="6"
        lg="4">
        <slot name="prepend"></slot>
      </v-col>
      <v-col v-for="item in list" :key="item.id" 
        cols="12"
        xs="12"
        sm="6"
        lg="4">
        <v-card c
          class="mx-auto w-full h-full justify-between flex flex-col"
          :color="color"
          variant="tonal"
          density="compact">
          <v-card-title class="flex items-center justify-between">
            <span>{{ item.name || item.id }}</span>
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
                  <ul class="text-sm m-0 p-0 space-y-1">
                    <li>R: {{ item.red ?? '-' }}</li>
                    <li>Y: {{ item.yellow ?? '-' }}</li>
                    <li>G: {{ item.green ?? '-' }}</li>
                  </ul>
                </div>
              </div>
              <!-- <v-chip variant="tonal" color="emerald">
                {{ wiring(item) }}
              </v-chip>
              <v-chip v-if="item.aspect" variant="tonal" color="blue">
                Active: {{ aspectLabels[item.aspect] }}
              </v-chip> -->
            </div>
          </v-card-text>
          <v-card-actions>
            <template v-if="confirmDelete === item?.id">
              <v-btn
                class="ma-2"
                text="Cancel"
                variant="outlined"
                size="small"
                @click="confirmDelete = ''" />
              <v-btn
                class="ma-2"
                text="Confirm"
                variant="tonal"
                size="small"
                prepend-icon="mdi-delete"
                @click="deleteSignal(item?.id)" />
            </template>
            <v-btn
              v-else
              class="ma-2"
              icon="mdi-delete"
              variant="tonal"
              size="small"
              @click="confirmDelete = item?.id"
            ></v-btn>
            <v-spacer></v-spacer>

            <v-btn
              text="Edit"
              variant="tonal"
              prepend-icon="mdi-pencil"
              size="small"
              @click="$emit('edit', item)"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


