<script setup lang="ts">
import { computed } from 'vue'

interface Device {
  id: string
  type: string
  isConnected: boolean
  connection?: string
  port?: string
  topic?: string
}

interface Props {
  devices?: Device[]
  showLabel?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  devices: () => [],
  showLabel: true,
  compact: false
})

const emit = defineEmits<{
  select: [deviceId: string]
}>()

const allConnected = computed(() => props.devices.every(device => device.isConnected))

function handleDeviceSelect(deviceId: string) {
  emit('select', deviceId)
}
</script>

<template>
  <v-menu location="bottom">
    <template v-slot:activator="{ props: activatorProps }">
      <v-sheet class="p-1" color="background">
        <v-chip
          v-bind="activatorProps"
          size="small"
          class="ma-1 shadow-md"
          prepend-icon="mdi-devices"
          :color="allConnected ? 'success' : 'warning'"
          variant="elevated"
          dark
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
          <span v-if="showLabel && !compact" class="hidden lg:flex">Devices</span>
          <span v-if="showLabel && compact" class="lg:hidden">D</span>
        </v-chip>
      </v-sheet>
    </template>
    
    <v-list>
      <v-list-item
        v-for="device in devices"
        :key="device.id"
        class="cursor-pointer"
        @click="handleDeviceSelect(device.id)"
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
</template>
