<script setup lang="ts">
import { ref } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useEfx, type Effect } from '@repo/modules/effects'

const { runEffect } = useEfx()

interface Props {
  event: Effect
  eventId?: string
}

const props = defineProps<Props>()

const state = ref(props.event?.state)
const isRunning = ref(false)

async function handleEvent(event: Event) {
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  await runEffect({...props.event, id: props.eventId || props.event.id, state: state.value})
}
</script>

<template>
  <v-card 
    class="m-1 shadow-xl"
    :color="event?.color || 'purple'"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
    @click="handleEvent"
  >
    <v-card-title class="flex flex-row items-center gap-4">
      <v-icon icon="mdi-flash" class="w-6 h-6" />
      <h4 class="text-md font-bold">{{event?.name}}</h4>
    </v-card-title>
    <v-card-text class="text-sm">
      <p class="my-4">{{event?.name}}</p>
      <div class="flex flex-wrap gap-2">
        <v-chip 
          v-if="event?.device" 
          class="ml-2 text-xs"
          prepend-icon="mdi-memory"
          variant="outlined"
        >
          {{event?.device}}
        </v-chip>
        <v-chip 
          v-if="event?.type" 
          class="ml-2 text-xs"
          prepend-icon="mdi-cog"
          variant="outlined"
        >
          {{event?.type}}
        </v-chip>
        <v-chip 
          v-if="event?.pin" 
          class="ml-2 text-xs"
          prepend-icon="mdi-resistor"
          variant="outlined"
        >
          Pin: {{event?.pin}}
        </v-chip>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-switch
        v-model="state"
        :label="state ? 'ON' : 'OFF'"
        :color="event?.color || 'purple'"
        @change="handleEvent"
      />
    </v-card-actions>
  </v-card>
</template>