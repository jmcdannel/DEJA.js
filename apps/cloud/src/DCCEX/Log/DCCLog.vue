<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { useDccLog } from '@/DCCEX/Log/useDccLog'
import DCCLogItem from '@/DCCEX/Log/DCCLogItem.vue'
import ViewJson from '@/Core/UI/ViewJson.vue';

const enabled = useStorage('@DEJA/pref/ws-logging', false)
const wshost = useStorage('@DEJA/pref/ws-host', '192.168.86.34:8082')
const { log, status, data, send, open, close } = useDccLog(enabled.value)

</script>
<template>  
  <v-card title="DCC Log" color="lime" variant="tonal">
    <v-card-text>
      <v-switch v-model="enabled" label="Enabled" color="lime" />
      <v-text-field v-model="wshost" color="lime"></v-text-field>
    </v-card-text>
  </v-card>
  <ul class="flex flex-col-reverse">
    <li v-for="entry in log" :key="entry.id" class="border-b">
      <DCCLogItem :entry="entry" />
    </li>
  </ul>
  <pre>{{log}}</pre>
  <pre>status: {{status}}</pre>
  <pre>{{data}}</pre>
  <ViewJson :data="log" label="DCC Log" />
</template>