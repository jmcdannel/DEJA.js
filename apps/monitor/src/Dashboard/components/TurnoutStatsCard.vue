<script setup lang="ts">
defineProps<{
  totalCount: number
  thrownCount: number
}>()
</script>

<template>
  <v-card variant="tonal" color="green">
    <v-card-title>Turnout Information</v-card-title>
    <v-card-text class="grid grid-cols-2 gap-4">
      <div>
        <div class="text-green text-2xl font-semibold mb-1">{{ totalCount }}</div>
        <div class="text-sm font-medium text-gray-400">Turnouts</div>
      </div>
      <div>
        <div class="text-green text-2xl font-semibold mb-1">{{ thrownCount }}</div>
        <div class="text-sm font-medium text-gray-400">Turnouts Thrown</div>
      </div>
    </v-card-text>
  </v-card>
</template>