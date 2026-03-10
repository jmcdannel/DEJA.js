<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4">
    <v-icon
      v-if="icon"
      :icon="icon"
      size="64"
      class="mb-4 opacity-40"
    />
    <h3 class="text-xl font-semibold mb-2 opacity-70">{{ title ?? 'No items found' }}</h3>
    <p v-if="description" class="text-sm opacity-50 text-center max-w-md">
      {{ description }}
    </p>
  </div>
</template>
