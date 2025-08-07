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
  <v-btn
    class="m-1"
    :color="event?.color || 'purple'"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
    @click="handleEvent"
  >
    <v-icon start icon="mdi-flash" />
    {{event?.name}}
  </v-btn>
</template>