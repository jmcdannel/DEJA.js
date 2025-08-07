<script setup lang="ts">
import type { Effect } from '@repo/modules/effects'
import { useStorage } from '@vueuse/core'
import { useEfx } from '@repo/modules/effects'
import EffectItem from '@/effects/EffectItem.vue'
import { ListMenu } from '@repo/ui'

const viewAs = useStorage('@DEJA/prefs/effects/View', ['button'])
const sortBy = useStorage<string[]>('@DEJA/prefs/effects/Sort', ['device'])

const { getEffects, runEffect } = useEfx()
const list = getEffects()

function handleEffect(efx: Effect) {
  console.log('handleEffect', efx)
  runEffect(efx)
}

</script>
<template>
  <v-toolbar color="purple-darken-4" :elevation="8">
    <template #prepend>
      <v-icon icon="mdi-call-split" class="text-xl md:text-3xl"></v-icon>
    </template>
    <template #append>
      <ListMenu :module-name="'effects'" />
    </template>
    <v-toolbar-title class="text-xl md:text-3xl">Effects</v-toolbar-title>    
  </v-toolbar>
 <v-table v-if="viewAs?.[0] === 'table'" :items="list as Effect[]" :sort-by="sortBy" class="w-full p-4">
    <thead>
      <tr>
        <th>Name</th>
        <th>Device</th>
        <th>Type</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in list as Effect[]" :key="item.id">
        <td>{{ item.name }}</td>
        <td>{{ item.device }}</td>
        <td>{{ item.type }}</td>
        <td>
          <v-switch v-model="item.state" @change="handleEffect(item as Effect)" :color="item.color || 'primary'" hide-details />
        </td>
      </tr>
    </tbody>
  </v-table>
  <div v-else class="grid grid-cols-1 @[960px]:grid-cols-3 xlg:grid-cols-4 gap-2 w-full p-4">
    <EffectItem 
      v-for="item in list as Effect[]"
      :key="item.id" 
      :efx="item as Effect" 
      :efxId="item.id"
      :viewAs="viewAs"
    />
  </div>
</template>