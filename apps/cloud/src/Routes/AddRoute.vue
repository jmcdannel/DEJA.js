<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
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
        <h1 class="text-xl font-bold text-white/95 tracking-tight">New Route</h1>
        <span class="text-xs text-white/45">Add a route to your layout</span>
      </div>
      <v-btn variant="outlined" size="small" class="text-none" @click="router.push({ name: 'Routes' })">
        <v-icon start size="16">mdi-arrow-left</v-icon> Routes
      </v-btn>
    </div>

    <RouteForm :route="defaultRoute" @close="handleClose" />
  </div>
</template>
