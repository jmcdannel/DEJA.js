<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useEfx, type Effect } from '@repo/modules/effects'
import { ListMenu } from '@repo/ui'
import EffectItem from './EffectItem.vue'
import EffectTable from './EffectTable.vue'

const viewAs = useStorage<string[]>('@DEJA/prefs/effects/View', ['button'])
const sortBy = useStorage<string[]>('@DEJA/prefs/effects/Sort', ['device'])

const { getEffects, runEffect } = useEfx()
const effects = getEffects()

async function handleEffect(effect: Effect) {
  await runEffect(effect)
}
</script>

<template>
  <v-toolbar color="amber-darken-4" :elevation="8">
    <template #prepend>
      <v-icon icon="mdi-lightning-bolt" class="text-xl md:text-3xl"></v-icon>
    </template>
    <template #append>
      <ListMenu :module-name="'effects'" />
    </template>
    <v-toolbar-title class="text-xl md:text-3xl">Effects</v-toolbar-title>
  </v-toolbar>
  <v-spacer class="my-4"></v-spacer>
  <EffectTable 
    v-if="viewAs?.[0] === 'table'"
    :effects="effects as Effect[]" 
    :sort-by="sortBy?.[0]" 
    @effect-change="handleEffect" 
  />
  <v-sheet v-else class="grid grid-cols-1 @[960px]:grid-cols-3 xlg:grid-cols-4 gap-2 w-full p-4">
    <EffectItem 
      v-for="item in effects as Effect[]"
      :key="item.id" 
      :state="item.state"
      :effect="item as Effect" 
      :effectId="item?.id"
      :viewAs="viewAs?.[0]"
    />
  </v-sheet>
</template>