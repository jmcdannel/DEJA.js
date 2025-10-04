<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'
import { collection, query, where } from 'firebase/firestore'
import { useCollection } from 'vuefire'
import { db } from '@repo/firebase-config'
import TourLogo from './TourLogo.vue'

const user = useCurrentUser()
const layoutId = useStorage('@DEJA/layoutId', '')
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

const showDialog = computed(() => {
  if (isDemoMode) {
    // In demo mode, auto-select demo layout
    if (!layoutId.value) {
      layoutId.value = 'demo-layout'
    }
    return false
  }
  return !layoutId.value && !!user.value
})

// Get layouts for the current user (or demo layouts)
const layoutsRef = collection(db, 'layouts')
const layoutsQuery = computed(() => {
  if (isDemoMode) return null
  return user.value?.email 
    ? query(layoutsRef, where('owner', '==', user.value.email))
    : null
})
const layouts = isDemoMode ? ref([
  { layoutId: 'demo-layout', name: 'Demo Model Train Layout' }
]) : useCollection(layoutsQuery)

const selectLayout = (selectedLayoutId: string) => {
  layoutId.value = selectedLayoutId
  console.log('Selected layout for tour:', selectedLayoutId)
}

onMounted(() => {
  console.log('LayoutSelector mounted, current layoutId:', layoutId.value)
})
</script>

<template>
  <v-dialog v-model="showDialog" persistent max-width="600">
    <v-card>
      <v-card-title class="text-h5">
        <TourLogo class="mr-3" size="small" />
        Select Layout
      </v-card-title>
      <v-card-text>
        <p class="mb-4">Choose a layout to start the tour experience:</p>        
        <v-progress-circular v-if="!layouts" indeterminate class="mb-4"></v-progress-circular>
        <v-list v-else-if="layouts.length > 0">
          <v-list-item
            v-for="layout in layouts"
            :key="layout.layoutId"
            @click="selectLayout(layout.layoutId)"
            class="mb-2"
          >
            <template #prepend>
              <v-icon icon="mdi-train" color="primary"></v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-list-item {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.3);
}
</style>
