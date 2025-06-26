<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { useDccLog } from './useDccLog'
import DCCLogItem from './DCCLogItem.vue'

const enabled = useStorage('@DEJA/pref/ws-logging', false)
const wshost = useStorage('@DEJA/pref/ws-host', '192.168.86.249:8082')
const { log, status, data, send, open, close } = useDccLog(enabled.value)

</script>
<template>  
  <v-card title="DCC Log" color="teal-darken-3">
    <v-card-text>
      <v-switch v-model="enabled" label="Enabled" color="teal" />
      <v-text-field v-model="wshost" color="teal" />
    </v-card-text>
  </v-card>
  <ul class="flex flex-col-reverse">
    <li v-for="entry in log" :key="entry.id" class="border-b">
      <DCCLogItem :entry="entry" />
    </li>
  </ul>
  <pre>{{log}}</pre>
  <pre>status:status{{status}}</pre>
  <pre>{{data}}</pre>
  
</template>