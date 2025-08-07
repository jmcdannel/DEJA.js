<script setup lang="ts">
import type { Effect } from '@repo/modules/effects'
import EventCard from './EventCard.vue'
import EventButton from './EventButton.vue'
import EventSwitch from './EventSwitch.vue'

interface Props {
  event: Effect
  eventId?: string
  viewAs?: string
}

const props = defineProps<Props>()
</script>

<template>
  <EventCard 
    v-if="viewAs === 'card'"
    :event="event" 
    :eventId="eventId"
  />
  <EventSwitch 
    v-else-if="viewAs === 'switch'"
    :event="event" 
    :eventId="eventId"
  />
  <EventButton 
    v-else
    :event="event" 
    :eventId="eventId"
  />
</template>