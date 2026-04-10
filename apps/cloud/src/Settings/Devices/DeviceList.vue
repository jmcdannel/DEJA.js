<script setup lang="ts">
import type { Device } from './useDevices'
import DeviceListItem from './DeviceListItem.vue'

defineProps<{
  devices: Device[]
  loading: boolean
}>()

defineEmits<{
  (e: 'revoke', pairingId: string): void
}>()
</script>

<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <v-list v-else-if="devices.length > 0" lines="two">
      <DeviceListItem
        v-for="device in devices"
        :key="device.id"
        :device="device"
        @revoke="$emit('revoke', device.id)"
      />
    </v-list>
    <v-empty-state
      v-else
      icon="mdi-devices"
      title="No devices paired"
      text="Click 'Install on new device' to get started."
    />
  </div>
</template>
