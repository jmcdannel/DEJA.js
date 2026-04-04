<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import RouteForm from '@/Routes/RouteForm.vue'
import FormPageHeader from '@/Common/FormPageHeader.vue'
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
  <div class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <FormPageHeader
      icon="mdi-map"
      title="New Route"
      subtitle="Add a route to your layout"
      color="#a855f7"
      back-label="Routes"
      :back-route="{ name: 'Routes' }"
    />

    <RouteForm :route="defaultRoute" @close="handleClose" />
  </div>
</template>
