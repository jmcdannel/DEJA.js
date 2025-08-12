<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { useDccLog } from '@/DCCEX/Log/useDccLog'
import DCCLogItem from '@/DCCEX/Log/DCCLogItem.vue'
import ViewJson from '@/Core/UI/ViewJson.vue';
import LcdDisplay from '@/Core/UI/LcdDisplay.vue';

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
  
  <!-- Debug LCD Displays -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    <LcdDisplay 
      :content="log.map(entry => `${entry.action}: ${JSON.stringify(entry.payload)}`)"
      title="DCC LOG"
      color="green"
      size="sm"
      :max-lines="10"
    />
    <LcdDisplay 
      :content="`status: ${status}`"
      title="STATUS"
      color="blue"
      size="sm"
      :max-lines="5"
    />
    <LcdDisplay 
      :content="data ? [data] : []"
      title="DATA"
      color="amber"
      size="sm"
      :max-lines="10"
    />
  </div>
  
  <ViewJson :data="log" label="DCC Log" />
</template>