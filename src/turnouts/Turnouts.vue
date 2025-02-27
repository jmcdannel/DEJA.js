<script setup lang="ts">
import { ref } from 'vue'
import type { Turnout as ITurnout } from '@/turnouts/types'
import { useStorage } from '@vueuse/core'
import { useTurnouts } from '@/api/useTurnouts'
import Turnout from '@/turnouts/Turnout.vue'
import TurnoutFilters from '@/turnouts/TurnoutFilters.vue'

const showFilters = ref(false)
const selectedDevices = useStorage('turnout-filter-devices', [])
const { getTurnouts } = useTurnouts()
const turnouts = getTurnouts()

function filter(turnouts: ITurnout[]) {
  if (selectedDevices.value.length) {
    return turnouts.filter((turnout:ITurnout) => selectedDevices.value.includes(turnout.device))
  }
  return turnouts
}

</script>
<template>
  <header class="flex justify-between items-center">
    <h2 class="mb-4 placeholder:font-extrabold text-transparent text-4xl bg-clip-text bg-gradient-to-r from-purple-300 to-pink-600">
      <strong class="text-3xl text-yellow-400">Turnouts</strong>
    </h2>  
    <v-btn @click="showFilters = !showFilters" color="yellow" variant="tonal" icon="mdi-filter"></v-btn>
  </header>
  <TurnoutFilters v-model:show="showFilters" v-model:selected="selectedDevices"></TurnoutFilters>
  <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
    <Turnout v-for="item in filter(turnouts)"
      :key="item.id" :turnout="item" :turnoutId="item?.id"></Turnout>
  </div>
</template>