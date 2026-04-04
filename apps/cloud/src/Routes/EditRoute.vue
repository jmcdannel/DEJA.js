<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLogger } from '@repo/utils'
import RouteForm from '@/Routes/RouteForm.vue'
import FormPageHeader from '@/Common/FormPageHeader.vue'
import { type Route } from '@repo/modules/index.ts'
import { useRoutes } from '@repo/modules/routes/useRoutes'

const log = createLogger('EditRoute')

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
    log.error(err)
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
  <div class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <FormPageHeader
      icon="mdi-map"
      :title="routeEffect?.name || 'Edit Route'"
      color="#a855f7"
      back-label="Routes"
      :back-route="{ name: 'Routes' }"
    >
      <template #subtitle>
        <span class="text-xs text-white/45">
          <template v-if="routeEffect?.point1 || routeEffect?.point2">
            {{ routeEffect?.point1 }} → {{ routeEffect?.point2 }}
          </template>
          <template v-else>Configure route settings</template>
        </span>
      </template>
    </FormPageHeader>

    <div v-if="loading" class="p-6 flex justify-center">
      <v-progress-circular indeterminate color="purple" />
    </div>
    <v-alert v-else-if="error" type="error" class="ma-4" :text="error" closable @click:close="handleClose" />
    <RouteForm v-else-if="routeEffect" :route="routeEffect" @close="handleClose" />
  </div>
</template>
