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
  <v-list-item class="px-2">
    <template #prepend>
      <v-icon icon="mdi-flash" />
    </template>
    <v-list-item-title>{{event?.name}}</v-list-item-title>
    <v-list-item-subtitle v-if="event?.device">Device: {{event?.device}}</v-list-item-subtitle>
    <template #append>
      <v-switch
        v-model="state"
        :color="event?.color || 'purple'"
        :disabled="isRunning"
        @change="handleEvent"
      />
    </template>
  </v-list-item>
</template>