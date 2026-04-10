<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { StatusPulse, SelectLayout } from '@repo/ui'
import { createLogger } from '@repo/utils'
import AddLayout from '@/Layout/AddLayout.vue'

const log = createLogger('LayoutStatus')

const layoutId = useStorage('@DEJA/layoutId', '')
const dialogOpen = ref(false)

function handleSelect(_layoutId: string) {
  log.debug('handleSelect', _layoutId)
  layoutId.value = _layoutId
  dialogOpen.value = false
  window.location.reload()
}
</script>

<template>
  <v-dialog v-model="dialogOpen" max-width="440">
    <template v-slot:activator="{ props: activatorProps }">
      <v-chip
        v-bind="activatorProps"
        size="small"
        class="ma-1"
        prepend-icon="mdi-home"
        :color="layoutId ? 'green' : 'red'"
      >
        <template #append>
          <span class="ml-2">
            <StatusPulse :status="layoutId ? 'connected' : 'disconnected'" size="sm" />
          </span>
        </template>
        {{ layoutId }}
      </v-chip>
    </template>

    <v-card class="rounded-xl overflow-hidden">
      <!-- Header -->
      <div class="dialog-header">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" variant="tonal" size="36" rounded="lg">
            <v-icon size="20">mdi-home-city-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold">Select Layout</div>
            <div class="text-caption text-medium-emphasis">Switch your active layout</div>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="dialogOpen = false" />
      </div>

      <v-divider />

      <!-- Layout list -->
      <v-card-text class="pa-4">
        <SelectLayout variant="compact" :layout-id="layoutId" @selected="handleSelect" />
      </v-card-text>

      <v-divider />

      <!-- Add layout -->
      <v-card-text class="pa-4">
        <AddLayout />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 16px 20px;
}
</style>
