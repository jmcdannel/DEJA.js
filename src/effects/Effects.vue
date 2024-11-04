<script setup lang="ts">
import { ref }  from 'vue'
import { useEfx } from '@/api/useEfx'
import EffectItem from '@/effects/Effect.vue'
import EffectFilters from '@/effects/EffectFilters.vue'

const showFilters = ref(false)
const deviceFilters = ref([])

const { getEffects } = useEfx()
const list = getEffects()

function handleDeviceFilter(devices) {
  console.log('handleDeviceFilter', devices)
  deviceFilters.value = devices
}

function filter(efxList) {
  if (deviceFilters.value.length) {
    return efxList.filter(efx => deviceFilters.value.includes(efx.device))
  }
  return efxList
}

</script>
<template>
  <header class="flex justify-between items-center">
    <h2 class="mb-4 placeholder:font-extrabold text-transparent text-4xl bg-clip-text bg-gradient-to-r from-purple-300 to-pink-600">
      <strong class="text-3xl text-purple-400">Effects</strong>
    </h2>  
    <v-btn @click="showFilters = !showFilters" color="secondary" icon="mdi-filter"></v-btn>
  </header>
  <EffectFilters @devices="handleDeviceFilter" :class="showFilters ? 'visible' : 'hidden'"></EffectFilters>
  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 w-full">
    <!-- <v-btn-toggle v-model="efxType" divided class="flex-wrap h-auto" size="x-large">
      <v-btn v-for="efxOpt in efxTypes" :value="efxOpt.value" :key="efxOpt.value"
        class="min-h-48 min-w-48 border"
        color="purple">
        <div class="flex flex-col">
          <component :is="efxOpt.icon" :color="efxOpt.color" class="w-16 h-16 stroke-none"></component>
          <div class="mt-4">{{ efxOpt.label }}</div>
        </div>
        
      </v-btn>
    </v-btn-toggle> -->
    <EffectItem v-for="item in filter(list)"
      :key="item.id" :efx="item" :efxId="item.id"></EffectItem>
  </div>
</template>