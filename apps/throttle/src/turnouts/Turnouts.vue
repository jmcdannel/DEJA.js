<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'
import TurnoutItem from '@/turnouts/TurnoutItem.vue'
import { ListMenu } from '@repo/ui'

const viewAs = useStorage<string[]>('@DEJA/prefs/turnouts/View', ['button'])
const sortBy = useStorage<string[]>('@DEJA/prefs/turnouts/Sort', ['device'])

const { getTurnouts, switchTurnout } = useTurnouts()
const turnouts = getTurnouts()

async function handleTurnout(turnout: Turnout) {
  console.log('handleTurnout', turnout)
  await switchTurnout(turnout)
}

</script>

<template>
  <v-toolbar color="blue-darken-4" :elevation="8">
    <template #prepend>
      <v-icon icon="mdi-call-split" class="text-xl md:text-3xl"></v-icon>
    </template>
    <template #append>
      <ListMenu :module-name="'turnouts'" />
    </template>
    <v-toolbar-title class="text-xl md:text-3xl">Turnouts</v-toolbar-title>
  </v-toolbar>
  <v-spacer class="my-4"></v-spacer>
   <v-table v-if="viewAs?.[0] === 'table'" :items="turnouts as Turnout[]" :sort-by="sortBy" class="w-full p-4">
    <thead>
      <tr>
        <th>Name</th>
        <th>Device</th>
        <th>Type</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in turnouts as Turnout[]" :key="item.id">
        <td>{{ item.name }}</td>
        <td>{{ item.device }}</td>
        <td>{{ item.type }}</td>
        <td>
          <v-switch v-model="item.state" @change="handleTurnout(item)" :color="item.color || 'primary'" hide-details />
        </td>
      </tr>
    </tbody>
  </v-table>
  <div v-else class="grid grid-cols-2 @[960px]:grid-cols-3 xlg:grid-cols-4 gap-2 w-full p-4">
    <TurnoutItem 
      v-for="item in turnouts"
      :key="item.id" 
      :turnout="item" 
      :turnoutId="item?.id"
      :viewAs="viewAs?.[0]"
    />
  </div>
</template>