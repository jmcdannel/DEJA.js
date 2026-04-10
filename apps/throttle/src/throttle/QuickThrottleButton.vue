<script setup lang="ts">
import { ref } from 'vue'
import { useQuickThrottle } from './useQuickThrottle'
import QuickThrottleForm from './QuickThrottleForm.vue'

withDefaults(
  defineProps<{
    size?: 'x-small' | 'small' | 'default' | 'large'
    color?: string
    icon?: string
    label?: string
  }>(),
  {
    size: 'default',
    color: 'primary',
    icon: 'mdi-numeric',
    label: '',
  },
)

const { open } = useQuickThrottle()
const menu = ref(false)
const error = ref<string | null>(null)

async function handleSubmit(address: number) {
  error.value = null
  menu.value = false
  try {
    await open(address)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to acquire throttle'
    console.error('Quick throttle failed', err)
  }
}
</script>

<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    location="bottom end"
    offset="8"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-if="label"
        v-bind="activatorProps"
        :size="size"
        :color="color"
        :prepend-icon="icon"
        variant="tonal"
        aria-label="Quick throttle by DCC address"
      >
        {{ label }}
      </v-btn>
      <v-btn
        v-else
        v-bind="activatorProps"
        :size="size"
        :color="color"
        :icon="icon"
        aria-label="Quick throttle by DCC address"
      />
    </template>
    <v-card class="pa-3" min-width="260">
      <div class="text-subtitle-2 mb-2">Quick Throttle 🚂</div>
      <QuickThrottleForm @submit="handleSubmit" @cancel="menu = false" />
      <div v-if="error" class="text-caption text-error mt-2">{{ error }}</div>
    </v-card>
  </v-menu>
</template>
