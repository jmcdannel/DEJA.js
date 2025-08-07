<script setup lang="ts">
import { ref } from 'vue'
import { useEfx, type Effect } from '@repo/modules/effects'

const { runEffect } = useEfx()

interface Props {
  events: Effect[]
  sortBy?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  eventChange: [event: Effect]
}>()

const isRunning = ref<Record<string, boolean>>({})

async function handleEvent(event: Effect) {
  if (event.id) {
    isRunning.value[event.id] = true
  }
  
  await runEffect(event)
  emit('eventChange', event)
  
  if (event.id) {
    setTimeout(() => {
      isRunning.value[event.id] = false
    }, 1000)
  }
}
</script>

<template>
  <v-table class="w-full">
    <thead>
      <tr>
        <th>Name</th>
        <th>Device</th>
        <th>Type</th>
        <th>Pin</th>
        <th>State</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="event in events" :key="event.id">
        <td>{{event.name}}</td>
        <td>{{event.device}}</td>
        <td>{{event.type}}</td>
        <td>{{event.pin}}</td>
        <td>
          <v-switch
            :model-value="event.state"
            :color="event.color || 'purple'"
            :disabled="isRunning[event.id]"
            @update:model-value="handleEvent({...event, state: Boolean($event)})"
          />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>