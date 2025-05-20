<script setup lang="ts">
import { ref } from 'vue'
import type { Turnout as ITurnout } from '@/turnouts/types'
import { useStorage } from '@vueuse/core'
import { useTurnouts } from '@/turnouts/useTurnouts'
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
  <v-toolbar 
    class="bg-clip-text bg-gradient-to-r from-purple-300 to-pink-600"  
    color="purple" 
    variant="tonal"
  >
    <v-toolbar-title class="text-3xl text-yellow-400">Turnouts</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items color="yellow">
      <v-btn @click="showFilters = !showFilters" icon="mdi-filter"></v-btn>
    </v-toolbar-items>
  </v-toolbar>
  <TurnoutFilters v-model:show="showFilters" v-model:selected="selectedDevices"></TurnoutFilters>
  <div class="grid grid-cols-1 @[960px]:grid-cols-3 xlg:grid-cols-4 gap-2 w-full p-4">
    <Turnout v-for="item in filter(turnouts)"
      :key="item.id" :turnout="item" :turnoutId="item?.id"></Turnout>
  </div>
</template>