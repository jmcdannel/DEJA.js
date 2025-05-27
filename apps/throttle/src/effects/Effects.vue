<script setup lang="ts">
import { ref }  from 'vue'
import type { Effect } from '@repo/modules/effects'
import { useStorage } from '@vueuse/core'
import { useEfx } from '@repo/modules/effects'
import EffectItem from '@/effects/Effect.vue'
import EffectFilters from '@/effects/EffectFilters.vue'

const showViewMenu = ref(false)
const showFilters = ref(false)
const viewAs = useStorage('@DEJA/prefs/effectsView', ['grid'])
const selectedDevices = useStorage<string[]>('effects-filter-devices', [])
const { getEffects } = useEfx()
const list = getEffects()

const VIEW_OPTIONS = [
  { title: 'Grid', value: 'grid' },
  { title: 'List', value: 'list' },
  { title: 'Compact', value: 'card' },
  { title: 'Button', value: 'button' },
]

function filter(efxList: Effect[]) {
  if (selectedDevices.value.length) {
    return efxList.filter((efx:Effect) => efx.device && selectedDevices.value.includes(efx.device))
  }
  return efxList
}

</script>
<template>
  <v-toolbar 
    class="bg-clip-text bg-gradient-to-r from-purple-300 to-pink-600"  
    color="purple" 
    variant="tonal"
  >
    <v-toolbar-title class="text-3xl text-purple-400">Effects</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items color="purple">
      <v-btn @click="showViewMenu = !showViewMenu" icon="mdi-eye"></v-btn>
      <v-btn @click="showFilters = !showFilters" icon="mdi-filter"></v-btn>
    </v-toolbar-items>
  </v-toolbar>
  <v-dialog v-model="showViewMenu" max-width="290">
    <v-card title="View As" color="purple-darken-4" variant="elevated">
      <v-list :items="VIEW_OPTIONS" v-model:selected="viewAs" select-strategy="single-independent">
      </v-list>
    </v-card>
  </v-dialog>
  <EffectFilters v-model:show="showFilters" v-model:selected="selectedDevices"></EffectFilters>
  <!-- <pre>{{ viewAs }}</pre> -->
  <div class="grid grid-cols-1 @[960px]:grid-cols-2 w-full gap-x-4">
    <EffectItem 
      v-for="item in filter(list)"
      :key="item.id" 
      :efx="item" 
      :efxId="item.id"
      :viewAs="viewAs"
    />
  </div>
</template>