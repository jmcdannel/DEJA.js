<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'
import { ListMenu } from '@repo/ui'
import TurnoutItem from './TurnoutItem.vue'
import TurnoutTable from './TurnoutTable.vue'

const viewAs = useStorage<string[]>('@DEJA/prefs/turnouts/View', ['button'])
const sortBy = useStorage<string[]>('@DEJA/prefs/turnouts/Sort', ['device'])

const {  getTurnouts, setTurnout } = useTurnouts()
const turnouts = getTurnouts()

async function handleTurnout(turnout: Turnout) {
  await setTurnout(turnout.id, turnout)
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
  <TurnoutTable 
    v-if="viewAs?.[0] === 'table'"
    :turnouts="turnouts as Turnout[]" 
    :sort-by="sortBy?.[0]" 
    @turnout-change="handleTurnout" 
  />
  <v-sheet v-else class="grid grid-cols-1 @[960px]:grid-cols-3 xlg:grid-cols-4 gap-2 w-full p-4">
    <TurnoutItem 
      v-for="item in turnouts as Turnout[]"
      :key="item.id" 
      :state="item.state"
      :turnout="item as Turnout" 
      :turnoutId="item?.id"
      :viewAs="viewAs?.[0]"
    />
  </v-sheet>
</template>