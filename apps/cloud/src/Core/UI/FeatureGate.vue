<script setup lang="ts">
defineProps<{
  feature: string
  description?: string
}>()
</script>

<template>
  <div class="relative">
    <div class="opacity-35 pointer-events-none select-none">
      <slot />
    </div>
    <v-chip
      size="x-small"
      color="purple"
      variant="tonal"
      prepend-icon="mdi-lock-outline"
      class="absolute top-1 right-2"
    >
      {{ feature }}
    </v-chip>
  </div>
</template>
