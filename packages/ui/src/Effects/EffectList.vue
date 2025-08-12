<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useEfx, type Effect } from '@repo/modules/effects'
import EffectItem from './EffectItem.vue'
import EffectTable from './EffectTable.vue'
import { ListMenu } from '@repo/ui'

const viewAs = useStorage('@DEJA/prefs/effects/View', ['button'])
const sortBy = useStorage<string[]>('@DEJA/prefs/effects/Sort', ['device'])

const { getEffects } = useEfx()
const list = getEffects()
</script>

<template>
  <v-toolbar color="purple-darken-4" :elevation="8">
    <template #prepend>
      <v-icon icon="mdi-magic-staff" class="text-xl md:text-3xl"></v-icon>
    </template>
    <template #append>
      <ListMenu :module-name="'effects'" />
    </template>
    <v-toolbar-title class="text-xl md:text-3xl">Effects</v-toolbar-title>    
  </v-toolbar>
  
  <EffectTable 
    v-if="viewAs?.[0] === 'table'" 
    :items="list as Effect[]" 
    :sort-by="sortBy"
  />
  
  <div v-else class="grid grid-cols-1 @[960px]:grid-cols-3 xlg:grid-cols-4 gap-2 w-full p-4">
    <EffectItem 
      v-for="item in list as Effect[]"
      :key="item.id" 
      :effect="item as Effect" 
      :effect-id="item.id"
      :view-as="viewAs?.[0]"
    />
  </div>
</template>