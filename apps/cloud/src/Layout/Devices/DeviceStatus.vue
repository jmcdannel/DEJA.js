<script setup lang="ts">
import { useLayout } from '@/Layout/useLayout'

const { getDevices } = useLayout()
const devices = getDevices()

</script>
<template>
  <template v-for="device in devices" :key="device.id">
    <v-chip size="small" class="ma-1" 
      :prepend-icon="device.type === 'dcc-ex' ? 'mdi-memory' : 'mdi-usb'" :color="device?.isConnected ? 'green' : 'red'">
      <template #append>
        <span v-if="device?.isConnected" class="ml-2 relative flex h-3 w-3">
          <span class="absolute inline-flex h-full w-full rounded-full bg-green-600 animate-ping opacity-75"></span>
          <span class="relative inline-flex h-full w-full rounded-full bg-green-600"></span>
        </span>
        <span v-else class="ml-2 relative flex h-3 w-3">
          <span class="absolute inline-flex h-full w-full rounded-full bg-red-600 animate-bounce opacity-75"></span>
          <span class="relative inline-flex h-full w-full rounded-full bg-red-600"></span>
        </span>
      </template>
      <template #default>
        <span class="hidden lg:flex">{{ device?.id || 'Device' }}</span>
      </template>
    </v-chip>
  </template>
</template>