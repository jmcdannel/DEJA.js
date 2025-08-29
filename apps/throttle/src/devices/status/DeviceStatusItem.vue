
<script setup lang="ts">
import { type PropType } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { Device } from '@repo/modules'

dayjs.extend(relativeTime)

defineProps({
  device: {
    type: Object as PropType<Device>,
    required: true
  }
})

</script>
<template>
  <v-card 
    class="bg-gradient-to-br from-blue-700 to-red-700 bg-gradient-border rounded-2xl shadow-xl p-2 pb-5"
    :subtitle="device.type"
    :title="device.id"
    variant="text">
    <template v-slot:prepend>
      <v-icon v-if="device.type === 'dcc-ex'" :color="device.isConnected ? 'success' : 'error'" icon="mdi-memory" />
      <v-icon v-else-if="device.type === 'deja-arduino'" :color="device.isConnected ? 'success' : 'error'" icon="mdi-usb" />
      <v-icon v-else-if="device.type === 'deja-arduino-led'" :color="device.isConnected ? 'success' : 'error'" icon="mdi-led-strip" />
      <v-icon v-else-if="device.type === 'deja-mqtt'" :color="device.isConnected ? 'success' : 'error'" icon="mdi-wifi" />
    </template>
    <v-card-text>
      <!-- <pre>{{ device }}</pre> -->
      
      <template v-if="device.isConnected">
        <p class="text-success">Connected</p>
      </template>
      <template v-else>
        <p class="text-error">Disconnected</p>
      </template>
      <p>Last Connected: {{ device.timestamp ? dayjs(device.timestamp).fromNow() : 'Never' }}</p>
      <!-- <pre>{{ device }}</pre> -->
    </v-card-text>
  </v-card>
</template>