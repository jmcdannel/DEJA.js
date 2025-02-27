<script setup lang="ts">
import { ref }  from 'vue'
import type { IEfx } from '@/effects/types'
import { useStorage } from '@vueuse/core'
import { useEfx } from '@/effects/useEfx'
import EffectItem from '@/effects/Effect.vue'
import EffectFilters from '@/effects/EffectFilters.vue'

const showFilters = ref(false)
const selectedDevices = useStorage('effects-filter-devices', [])

const { getEffects } = useEfx()
const list = getEffects()

function filter(efxList: IEfx[]) {
  if (selectedDevices.value.length) {
    return efxList.filter((efx:IEfx) => selectedDevices.value.includes(efx.device))
  }
  return efxList
}

</script>
<template>
  <header class="flex justify-between items-center">
    <h2 class="mb-4 placeholder:font-extrabold text-transparent text-4xl bg-clip-text bg-gradient-to-r from-purple-300 to-pink-600">
      <strong class="text-3xl text-purple-400">Effects</strong>
    </h2>  
    <v-btn @click="showFilters = !showFilters" color="purple" variant="tonal" icon="mdi-filter"></v-btn>
  </header>
  <EffectFilters v-model:show="showFilters" v-model:selected="selectedDevices"></EffectFilters>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 w-full">
    <EffectItem v-for="item in filter(list)"
      :key="item.id" :efx="item" :efxId="item.id"></EffectItem>
  </div>
</template>