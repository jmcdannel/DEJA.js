<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import type { Turnout } from '@repo/modules'
import { PageHeader } from '@repo/ui'
import TurnoutsList from '@/Turnouts/TurnoutsList.vue'
import Addtile from '@/Core/UI/AddTile.vue'

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
  <PageHeader title="Turnouts" icon="mdi-call-split" color="amber" />

  <TurnoutsList @edit="handleEdit" :viewAs="viewAs">
    <template #prepend>
      <Addtile @click="handleAdd" color="yellow" />
    </template>
  </TurnoutsList>
</template>
