<script setup lang="ts">
defineProps<{
  totalCount: number
  activeCount: number
}>()
</script>

<template>
  <v-card variant="tonal" color="purple">
    <v-card-title>Throttle Information</v-card-title>
    <v-card-text class="grid grid-cols-2 gap-4">
      <div>
        <div class="text-purple text-2xl font-semibold mb-1">{{ totalCount }}</div>
        <div class="text-sm font-medium text-gray-400">Throttles</div>
      </div>
      <div>
        <div class="text-purple text-2xl font-semibold mb-1">{{ activeCount }}</div>
        <div class="text-sm font-medium text-gray-400">Throttles Active</div>
      </div>
    </v-card-text>
  </v-card>
</template>