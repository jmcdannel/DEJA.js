<script setup lang="ts">
import type { Effect } from '@repo/modules'
import { useRouter } from 'vue-router'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import RoutesList from '@/Routes/RoutesList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()

function handleEdit(effect: Effect) {
  router.push({ name: 'Edit Route', params: { routeId: effect.id } })
}

function handleAdd() {
  router.push({ name: 'Add Route' })
}

</script>
<template>
  <ModuleTitle menu="Routes" />
  <RoutesList @edit="handleEdit">
    <template #prepend>
      <AddTile @click="handleAdd" color="purple" />
    </template>
  </RoutesList>
</template>