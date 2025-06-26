<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useLayout } from '@repo/modules/layouts'

const { getLayout } = useLayout()
const layoutId = useStorage('@DEJA/layoutId', '')
const layout = getLayout()
</script>

<template>
  <v-card variant="tonal" color="red">
    <v-card-title>Layout Information</v-card-title>
    <v-card-text class="grid grid-cols-2 gap-4">
      <div>
        <div class="text-red text-2xl font-semibold mb-1">{{ layoutId }}</div>
        <div class="text-sm font-medium text-gray-400">Layout ID</div>
      </div>
      <div>
        <div class="text-red text-2xl font-semibold mb-1">{{ layout?.name }}</div>
        <div class="text-sm font-medium text-gray-400">Layout Name</div>
      </div>
    </v-card-text>
  </v-card>
</template>