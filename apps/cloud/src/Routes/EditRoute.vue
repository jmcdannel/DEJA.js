<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLogger } from '@repo/utils'
import RouteForm from '@/Routes/RouteForm.vue'
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
    <!-- ═══ HERO HEADER ═══ -->
    <div
      class="flex items-center gap-4 p-5 rounded-[14px] border"
      style="background: linear-gradient(135deg, rgba(168,85,247,0.08), transparent); border-color: rgba(168,85,247,0.15);"
    >
      <div class="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0 bg-purple-500/80">
        <v-icon size="28" color="white">mdi-map</v-icon>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-white/95 tracking-tight">
          {{ routeEffect?.name || 'Edit Route' }}
        </h1>
        <span class="text-xs text-white/45">
          <template v-if="routeEffect?.point1 || routeEffect?.point2">
            {{ routeEffect?.point1 }} → {{ routeEffect?.point2 }}
          </template>
          <template v-else>Configure route settings</template>
        </span>
      </div>
      <v-btn variant="outlined" size="small" class="text-none" @click="router.push({ name: 'Routes' })">
        <v-icon start size="16">mdi-arrow-left</v-icon> Routes
      </v-btn>
    </div>

    <div v-if="loading" class="p-6 flex justify-center">
      <v-progress-circular indeterminate color="purple" />
    </div>
    <v-alert v-else-if="error" type="error" class="ma-4" :text="error" closable @click:close="handleClose" />
    <RouteForm v-else-if="routeEffect" :route="routeEffect" @close="handleClose" />
  </div>
</template>
