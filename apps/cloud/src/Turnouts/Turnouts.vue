<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import type { Turnout } from '@repo/modules/turnouts'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import TurnoutsList from '@/Turnouts/TurnoutsList.vue'
import TurnoutSorter from '@/Turnouts/TurnoutSorter.vue'
import TurnoutForm from '@/Turnouts/TurnoutForm.vue'
import Addtile from '@/Core/UI/AddTile.vue'

const VIEW_OPTIONS = [
  { title: 'Card', value: 'card' },
  { title: 'By Device', value: 'device' },
]
const showForm = ref(false)
const showSorter = ref(false)
const showViewMenu = ref(false)
const showFilters = ref(false)
const viewAs = useStorage('@DEJA/prefs/turnoutsView', 'card')
const editTurnout = ref<Turnout | null>(null)

function handleEdit(turnout: Turnout | null) {
  console.log('handleEdit', turnout)
  editTurnout.value = turnout ? { ...turnout, id: turnout.id } : null
  showForm.value = true
}
function handleClose() {
  showForm.value = false
  editTurnout.value = null
}

</script>
<template>
  <ModuleTitle menu="Turnouts" />

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
      <v-btn @click="showSorter = !showSorter" icon="mdi-sort-variant" ></v-btn>
    </v-toolbar-items>
  </v-toolbar>
  <v-dialog v-model="showViewMenu" max-width="290">
    <v-card title="View As" color="purple-darken-4" variant="elevated">
      <v-list :items="VIEW_OPTIONS" v-model:selected="viewAs" select-strategy="single-independent">
      </v-list>
    </v-card>
  </v-dialog>
  
  <v-dialog v-model="showSorter" max-width="80vw">
    <TurnoutSorter @close="showSorter = false" />
  </v-dialog>
  <v-divider class="my-2" />
  <TurnoutForm v-if="showForm" v-show="showForm" @close="handleClose" :turnout="editTurnout" />
  <TurnoutsList v-else @edit="handleEdit" :viewAs="viewAs">
    <template #prepend>
      <Addtile @click="showForm = true" color="yellow" />
    </template>
  </TurnoutsList>
</template>