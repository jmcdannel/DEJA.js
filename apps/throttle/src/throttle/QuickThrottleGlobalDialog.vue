<script setup lang="ts">
import { ref } from 'vue'
import { useQuickThrottle } from './useQuickThrottle'
import QuickThrottleForm from './QuickThrottleForm.vue'

const { open, globalDialogOpen, registerGlobalShortcut } = useQuickThrottle()

registerGlobalShortcut()

const error = ref<string | null>(null)

async function handleSubmit(address: number) {
  error.value = null
  globalDialogOpen.value = false
  try {
    await open(address)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to acquire throttle'
    console.error('Quick throttle failed', err)
  }
}
</script>

<template>
  <v-dialog v-model="globalDialogOpen" max-width="340">
    <v-card class="pa-4">
      <div class="text-subtitle-1 mb-3 font-weight-bold">Quick Throttle 🚂</div>
      <QuickThrottleForm @submit="handleSubmit" @cancel="globalDialogOpen = false" />
      <div v-if="error" class="text-caption text-error mt-2">{{ error }}</div>
    </v-card>
  </v-dialog>
</template>
