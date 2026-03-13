<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/Core/UI/PageHeader.vue'
import RouteForm from '@/Routes/RouteForm.vue'
import { routeType, type Route } from '@repo/modules'

const router = useRouter()
const defaultRoute = computed<Route>(() => ({
  id: '',
  name: '',
  color: routeType.color,
  tags: [],
  turnouts: [],
  point1: '',
  point2: '',
}))

function handleClose() {
  router.push({ name: 'Routes' })
}
</script>
<template>
  <PageHeader menu="Routes" />
  <RouteForm :route="defaultRoute" @close="handleClose" />
</template>
