<script setup lang="ts">
import type { Route } from '@repo/modules'
import { useRouter } from 'vue-router'
import PageHeader from '@/Core/UI/PageHeader.vue'
import RoutesList from '@/Routes/RoutesList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()

function handleEdit(route: Route) {
  router.push({ name: 'Edit Route', params: { routeId: route.id } })
}

function handleAdd() {
  router.push({ name: 'Add Route' })
}

</script>
<template>
  <PageHeader menu="Routes" />
  <RoutesList @edit="handleEdit">
    <template #prepend>
      <AddTile @click="handleAdd" color="purple" />
    </template>
  </RoutesList>
</template>