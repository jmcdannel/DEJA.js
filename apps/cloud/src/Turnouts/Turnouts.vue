<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import type { Turnout } from '@repo/modules'
import PageHeader from '@/Core/UI/PageHeader.vue'
import TurnoutsList from '@/Turnouts/TurnoutsList.vue'
import TurnoutSorter from '@/Turnouts/TurnoutSorter.vue'
import Addtile from '@/Core/UI/AddTile.vue'

const VIEW_OPTIONS = [
  { title: 'Card', value: 'card' },
  { title: 'By Device', value: 'device' },
]
const showSorter = ref(false)
const showViewMenu = ref(false)
const viewAs = useStorage('@DEJA/prefs/turnoutsView', 'card')
const router = useRouter()

function handleEdit(turnout: Turnout) {
  router.push({ name: 'Edit Turnout', params: { turnoutId: turnout.id } })
}

function handleAdd() {
  router.push({ name: 'Add Turnout' })
}
</script>
<template>
  <PageHeader menu="Turnouts">
    <v-btn @click="showViewMenu = !showViewMenu" icon="mdi-eye" size="small" variant="text" />
    <v-btn @click="showSorter = !showSorter" icon="mdi-sort-variant" size="small" variant="text" />
  </PageHeader>

  <v-dialog v-model="showViewMenu" max-width="290">
    <v-card title="View As" color="purple-darken-4" variant="elevated">
      <v-list :items="VIEW_OPTIONS" v-model:selected="viewAs" select-strategy="single-independent" />
    </v-card>
  </v-dialog>

  <v-dialog v-model="showSorter" max-width="80vw">
    <TurnoutSorter @close="showSorter = false" />
  </v-dialog>

  <TurnoutsList @edit="handleEdit" :viewAs="viewAs">
    <template #prepend>
      <Addtile @click="handleAdd" color="yellow" />
    </template>
  </TurnoutsList>
</template>
