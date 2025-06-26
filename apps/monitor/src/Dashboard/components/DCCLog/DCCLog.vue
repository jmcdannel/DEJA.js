<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { useDccLog } from './useDccLog'
import DCCLogItem from './DCCLogItem.vue'

const enabled = useStorage('@DEJA/pref/ws-logging', false)
const wshost = useStorage('@DEJA/pref/ws-host', '192.168.86.249:8082')
const { log, status, data, send, open, close } = useDccLog(enabled.value)

</script>
<template>  
  <v-card title="DCC Logger" class=" flex flex-col overflow-hidden" color="teal">
    <v-card-text class="flex flex-1 flex-col-reverse gap-4 overflow-hidden">
      <div class="h-full overflow-y-auto">
        <ul class="flex flex-col-reverse">
          <li v-for="entry in log" :key="entry.id" class="border-b">
            <DCCLogItem :entry="entry" />
          </li>
        </ul>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-switch v-model="enabled" label="Enabled" color="teal" />
      <v-text-field v-model="wshost" color="teal" />
    </v-card-actions>
  </v-card>
  
</template>