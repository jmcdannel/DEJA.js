<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useLayout, type Device } from '@repo/modules/layouts'
import DeviceStatusItem from './DeviceStatusItem.vue'

dayjs.extend(relativeTime)

defineEmits(['disconnect'])
const layoutId = useStorage('@DEJA/layoutId', '')
const { getDevices, getLayout } = useLayout()
const layout = getLayout()
const devices = getDevices()

</script>
<template>
  <!-- <pre>layoutId:{{layout}}</pre> -->
  <v-card 
    color="indigo darken-4"
    variant="tonal">

    <v-card-item>
      <template v-slot:prepend>
        <v-icon size="64" :color="layoutId ? 'success' : 'error'" icon="mdi-train" />
      </template>
      <template v-slot:append>
        <v-avatar
          :color="layoutId ? 'success' : 'error'"
          size="x-large">
          <v-icon icon="mdi-lightning-bolt" />
        </v-avatar>        
      </template>
      <v-card-title class="text-h3 text-indigo-200">{{ layoutId }}</v-card-title>
      <v-card-subtitle class="text-h6 text-indigo-200">{{ layout?.name }} - DEJA.js</v-card-subtitle>
    </v-card-item>
    <v-card-text>
      <v-row align="start" justify="start" dense>
        <v-col cols="4"
          v-for="device in devices"
          :key="device.id" >
          <DeviceStatusItem :device="device" />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        color="error"
        variant="outlined"
        @click="$emit('disconnect')">
        Disconnect
      </v-btn>
    </v-card-actions>
  </v-card>
</template>