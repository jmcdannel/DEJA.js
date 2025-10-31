<script setup lang="ts">
import type { Signal } from '@repo/modules/signals'
import { useRouter } from 'vue-router'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import SignalList from '@/Signals/SignalsList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()

function handleEdit(signal: Signal) {
  router.push({ name: 'Edit Signal', params: { signalId: signal.id } })
}

function handleAdd() {
  router.push({ name: 'Add Signal' })
}

</script>
<template>
  <ModuleTitle menu="Signals" />
  <SignalList @edit="handleEdit">
    <template #prepend>
      <AddTile @click="handleAdd" color="emerald" />
    </template>
  </SignalList>
</template>


