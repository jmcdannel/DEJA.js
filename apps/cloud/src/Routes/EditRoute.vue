<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import RouteForm from '@/Routes/RouteForm.vue'
import { useRoutes, type Route } from '@repo/modules'

const route = useRoute()
const router = useRouter()
const { getRoute } = useRoutes()
const routeEffect = ref<Route | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function loadRoute() {
  loading.value = true
  error.value = null
  const routeId = route.params.routeId as string
  try {
    const result = await getRoute(routeId)
    if (result) {
      routeEffect.value = result
    } else {
      error.value = 'Route not found.'
    }
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load route.'
  } finally {
    loading.value = false
  }
}

function handleClose() {
  router.push({ name: 'Routes' })
}

onMounted(loadRoute)
</script>
<template>
  <ModuleTitle menu="Routes" />
  <div v-if="loading" class="p-6 flex justify-center">
    <v-progress-circular indeterminate color="purple" />
  </div>
  <v-alert v-else-if="error" type="error" class="ma-4" :text="error" closable @click:close="handleClose" />
  <RouteForm v-else-if="routeEffect" :route="routeEffect" @close="handleClose" />
</template>
