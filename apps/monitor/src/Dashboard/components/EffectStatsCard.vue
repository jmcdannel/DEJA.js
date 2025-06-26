<script setup lang="ts">
defineProps<{
  totalCount: number
  activeCount: number
}>()
</script>

<template>
  <v-card variant="tonal" color="blue">
    <v-card-title>Effect Information</v-card-title>
    <v-card-text class="grid grid-cols-2 gap-4">
      <div>
        <div class="text-blue text-2xl font-semibold mb-1">{{ totalCount }}</div>
        <div class="text-sm font-medium text-gray-400">Effects</div>
      </div>
      <div>
        <div class="text-blue text-2xl font-semibold mb-1">{{ activeCount }}</div>
        <div class="text-sm font-medium text-gray-400">Effects Active</div>
      </div>
    </v-card-text>
  </v-card>
</template>