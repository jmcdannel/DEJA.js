<script setup lang="ts">
import type { Effect } from '@repo/modules/effects'
import { useStorage } from '@vueuse/core'
import { useEfx } from '@repo/modules/effects'
import EffectItem from '@/effects/EffectItem.vue'
import ViewMenu from '@/core/ViewMenu.vue'
import SortMenu from '@/core/SortMenu.vue'
import FilterMenu from '@/core/FilterMenu.vue'

const sortBy = useStorage<string[]>('@DEJA/prefs/effects/Sort', ['device'])
const viewAs = useStorage('@DEJA/prefs/effects/View', ['grid'])
const selectedDevices = useStorage<string[]>('@DEJA/prefs/effects/Devices', [])
const { getEffects } = useEfx()
const list = getEffects()

function filter(efxList: Effect[]) {
  if (selectedDevices.value.length) {
    return efxList.filter((efx:Effect) => efx.device && selectedDevices.value.includes(efx.device))
  }
  return efxList
}

function sort(effects: Effect[]): Effect[] {
  console.log('sort', sortBy.value)
  return effects.sort((a, b) => {
    if (sortBy.value?.[0] === 'name') {
      return a.name.localeCompare(b.name)
    } else if (sortBy.value?.[0] === 'device') {
      return a.device.localeCompare(b.device)
    } else if (sortBy.value?.[0] === 'type') {
      return a.type.localeCompare(b.type)
    }
    return 0
  })
}

</script>
<template>
  <v-toolbar color="purple-darken-4" :elevation="8">
    <template #prepend>
      <v-icon icon="mdi-call-split" class="text-3xl"></v-icon>
    </template>
    <v-toolbar-title class="text-3xl">Effects</v-toolbar-title>
    <v-spacer></v-spacer>
    <template #append>
      <nav class="flex gap-4">
        <FilterMenu v-model="selectedDevices" />
        <ViewMenu v-model="viewAs" />
        <SortMenu v-model="sortBy" />
      </nav>
    </template>
    <template #extension>
        <v-chip-group class="p-4"
          color="purple-darken-4" 
          column
          multiple
          v-model="selectedDevices"
        >
          <v-chip 
            v-for="device in selectedDevices" 
            filter
            :key="device"
            :text="device" 
            :value="device" 
            prepend-icon="mdi-memory"
            closable
            color="pink" 
            size="small"
            variant="elevated"
          />
        </v-chip-group>
        <v-spacer></v-spacer>
        <v-chip-group class="p-4"
          base-color="purple"
          column
        >
          <v-chip
            :text="viewAs?.join(', ') || 'View as...'"
            color="blue"
            prepend-icon="mdi-eye"            
            size="small"
            variant="elevated"
          />
          <v-chip
            :text="sortBy?.join(', ') || 'Sort by...'"
            color="green"
            prepend-icon="mdi-sort"
            size="small"
            variant="elevated"
          />
        </v-chip-group>
    </template>
  </v-toolbar>
  <!-- <pre>{{ viewAs }}</pre> -->
 <v-table v-if="viewAs?.[0] === 'table'" :items="filter(sort(list as Effect[]))" :sort-by="sortBy" class="w-full p-4">
    <thead>
      <tr>
        <th>Name</th>
        <th>Device</th>
        <th>Type</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in filter(sort(list as Effect[]))" ::key="item.id">
        <td>{{ item.name }}</td>
        <td>{{ item.device }}</td>
        <td>{{ item.type }}</td>
        <td>
          <v-switch v-model="item.state" @change="handleEffect(item)" :color="item.color || 'primary'" hide-details />
        </td>
      </tr>
    </tbody>
  </v-table>
  <div v-else class="grid grid-cols-2 @[960px]:grid-cols-3 xlg:grid-cols-4 gap-2 w-full p-4">
    <EffectItem 
      v-for="item in filter(list)"
      :key="item.id" 
      :efx="item" 
      :efxId="item.id"
      :viewAs="viewAs"
    />
  </div>
</template>