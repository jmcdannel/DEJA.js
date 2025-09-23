<script setup lang="ts">
import { computed } from 'vue'
import { useLayout } from '@repo/modules'

const { getDevices } = useLayout()
const devices = getDevices()
const allConnected = computed(() => devices.value.every(device => device.isConnected))

</script>
<template>
  <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <v-sheet class="p-1" color="background">
          <v-chip
            v-bind="props"
            size="small"
            class="ma-1"
            prepend-icon="mdi-devices"
            :color="!!allConnected ? 'green' : 'yellow'"
          >
          <template #append>
            <span v-if="allConnected" class="ml-2 relative flex h-3 w-3">
              <span class="absolute inline-flex h-full w-full rounded-full bg-green-600 animate-ping opacity-75"></span>
              <span class="relative inline-flex h-full w-full rounded-full bg-green-600"></span>
            </span>
            <span v-else class="ml-2 relative flex h-3 w-3">
              <span class="absolute inline-flex h-full w-full rounded-full bg-yellow-600 animate-ping opacity-75"></span>
              <span class="relative inline-flex h-full w-full rounded-full bg-yellow-600"></span>
            </span>
          </template>
            <span class="hidden lg:flex">Devices</span>
            <span class="lg:hidden">D</span>
          </v-chip>
        </v-sheet>
      </template>
      <v-list>
        <v-list-item
          v-for="device in devices"
          :key="device.id"
          class="cursor-pointer"
          @click="$emit('select', device.id)"
        >
          <v-list-item-title>
            <v-chip
              size="small"
              :prepend-icon="device.type === 'dcc-ex' ? 'mdi-memory' : 'mdi-usb'"
              :color="device?.isConnected ? 'green' : 'red'"
            >
              {{ device?.id || 'Device' }}
            </v-chip>
          </v-list-item-title>
        </v-list-item>
      </v-list>
  </v-menu>
  <!-- <template v-for="device in devices" :key="device.id">
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
  </template> -->
</template>