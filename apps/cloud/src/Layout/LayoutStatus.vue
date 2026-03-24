<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { StatusPulse } from '@repo/ui'
import { createLogger } from '@repo/utils'
import AddLayout from '@/Layout/AddLayout.vue'
import { SelectLayout } from '@repo/ui'

const log = createLogger('LayoutStatus')

const layoutId = useStorage('@DEJA/layoutId', '')

function handleSelect(_layoutId: string) {
  log.debug('handleSelect', _layoutId)
  layoutId.value = _layoutId
  window.location.reload()
}

</script>
<template>
  <v-dialog max-width="520">
    <template v-slot:activator="{ props: activatorProps}">
      <v-sheet class="p-1" color="background">
        <v-chip  v-bind="activatorProps" size="small" class="ma-1"
          prepend-icon="mdi-home" :color="layoutId ? 'green' : 'red'">
          <template #append>
            <span class="ml-2">
              <StatusPulse :status="layoutId ? 'connected' : 'disconnected'" size="sm" />
            </span>
          </template>
          <template #default>
            <span class=" lg:flex">{{ layoutId }}</span>
          </template>
        </v-chip>
      </v-sheet>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center ga-2 pa-4">
          <v-icon size="20" color="primary">mdi-home-city-outline</v-icon>
          <span class="text-subtitle-1 font-weight-bold">Select Layout</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="isActive.value = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <SelectLayout variant="compact" :layout-id="layoutId" @selected="handleSelect" />
          <v-divider class="my-4" />
          <AddLayout />
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>
