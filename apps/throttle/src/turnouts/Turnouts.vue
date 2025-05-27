<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'
import TurnoutCmp from '@/turnouts/Turnout.vue'
import TurnoutFilters from '@/turnouts/TurnoutFilters.vue'

const VIEW_OPTIONS = [
  { title: 'List', value: 'list' },
  { title: 'Button', value: 'button' },
]

const showViewMenu = ref(false)
const showFilters = ref(false)
const viewAs = useStorage('@DEJA/prefs/turnoutsView', ['button'])
const selectedDevices = useStorage<string[]>('turnout-filter-devices', [])
const { getTurnouts } = useTurnouts()
const turnouts = getTurnouts()

function filter(turnouts: Turnout[]) {
  if (selectedDevices.value.length) {
    return turnouts.filter((turnout:Turnout) => selectedDevices.value.includes(turnout.device))
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
  <TurnoutFilters v-model:show="showFilters" v-model:selected="selectedDevices"></TurnoutFilters>
  <div class="grid grid-cols-1 @[960px]:grid-cols-3 xlg:grid-cols-4 gap-2 w-full p-4">
    <TurnoutCmp 
      v-for="item in filter(turnouts as Turnout[])"
      :key="item.id" 
      :turnout="item" 
      :turnoutId="item?.id"
      :viewAs="viewAs"
    />
  </div>
</template>