<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useLayout, type Device } from '@repo/modules/layouts'
import DeviceStatusItem from './DeviceStatusItem.vue'

dayjs.extend(relativeTime)

const layoutId = useStorage('@DEJA/layoutId', '')
const { getDevices, getLayout } = useLayout()
const layout = getLayout()
const devices = getDevices()

</script>
<template>
  <!-- <pre>layoutId:{{layout}}</pre> -->
  <v-row align="start" justify="start"  dense>
    <v-col cols="4">
      <v-card 
        class="bg-gradient-to-br from-blue-700 to-red-700 bg-gradient-border rounded-2xl shadow-xl p-2 pb-5"
        subtitle="DEJA.js"
        :title="layoutId.toString()"
        variant="text">
        <template v-slot:prepend>
          <v-icon :color="layoutId ? 'success' : 'error'" icon="mdi-memory" />
        </template>
        <v-card-text>
          
          <template v-if="layoutId">
            <p class="text-success">Connected</p>
          </template>
          <template v-else>
            <p class="text-error">Disconnected</p>
          </template>
        <p>Last Connected: {{ layout?.timestamp ? dayjs.unix(layout?.timestamp.seconds).fromNow() : 'Never' }}</p>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="4"
      v-for="device in devices"
      :key="device.id" >
      <DeviceStatusItem  :device="device" />
    </v-col>
  </v-row>  
</template>