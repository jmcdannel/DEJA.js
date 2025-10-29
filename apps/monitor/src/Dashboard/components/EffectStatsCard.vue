<script setup lang="ts">
defineProps<{
  totalCount: number
  activeCount: number
  signalCount?: number
  activeSignalCount?: number
}>()
</script>

<template>
  <v-card variant="tonal" color="blue">
    <v-card-title>Effect Information</v-card-title>
    <v-card-text class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <div class="text-blue text-2xl font-semibold mb-1">{{ totalCount }}</div>
        <div class="text-sm font-medium text-gray-400">Effects</div>
      </div>
      <div>
        <div class="text-blue text-2xl font-semibold mb-1">{{ activeCount }}</div>
        <div class="text-sm font-medium text-gray-400">Effects Active</div>
      </div>
      <div v-if="signalCount !== undefined">
        <div class="text-emerald text-2xl font-semibold mb-1">{{ signalCount }}</div>
        <div class="text-sm font-medium text-gray-400">Signals</div>
      </div>
      <div v-if="activeSignalCount !== undefined">
        <div class="text-emerald text-2xl font-semibold mb-1">{{ activeSignalCount }}</div>
        <div class="text-sm font-medium text-gray-400">Signals Active</div>
      </div>
    </v-card-text>
  </v-card>
</template>