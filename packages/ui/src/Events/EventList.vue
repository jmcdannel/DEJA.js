<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useEfx, type Effect } from '@repo/modules/effects'
import { ListMenu } from '@repo/ui'
import EventItem from './EventItem.vue'
import EventTable from './EventTable.vue'

const viewAs = useStorage<string[]>('@DEJA/prefs/events/View', ['button'])
const sortBy = useStorage<string[]>('@DEJA/prefs/events/Sort', ['device'])

const { getEffects, runEffect } = useEfx()
const events = getEffects()

async function handleEvent(event: Effect) {
  await runEffect(event)
}
</script>

<template>
  <v-toolbar color="purple-darken-4" :elevation="8">
    <template #prepend>
      <v-icon icon="mdi-flash" class="text-xl md:text-3xl"></v-icon>
    </template>
    <template #append>
      <ListMenu :module-name="'events'" />
    </template>
    <v-toolbar-title class="text-xl md:text-3xl">Events</v-toolbar-title>
  </v-toolbar>
  <v-spacer class="my-4"></v-spacer>
  <EventTable 
    v-if="viewAs?.[0] === 'table'"
    :events="events as Effect[]" 
    :sort-by="sortBy?.[0]" 
    @event-change="handleEvent" 
  />
  <v-sheet v-else class="grid grid-cols-1 @[960px]:grid-cols-3 xlg:grid-cols-4 gap-2 w-full p-4">
    <EventItem 
      v-for="item in events as Effect[]"
      :key="item.id" 
      :event="item as Effect" 
      :eventId="item?.id"
      :viewAs="viewAs?.[0]"
    />
  </v-sheet>
</template>