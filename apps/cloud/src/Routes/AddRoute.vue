<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import RouteForm from '@/Routes/RouteForm.vue'
import type { Effect } from '@repo/modules'

const router = useRouter()
const defaultRoute = computed<Effect>(() => ({
  id: '',
  name: '',
  type: 'route',
  color: 'purple',
  tags: [],
  allowGuest: false,
  state: false,
}))

function handleClose() {
  router.push({ name: 'Routes' })
}
</script>
<template>
  <ModuleTitle menu="Routes" />
  <RouteForm :efx="defaultRoute" @close="handleClose" />
</template>
