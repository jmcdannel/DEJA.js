<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { useDccLog } from './useDccLog'
import DCCLogItem from './DCCLogItem.vue'

const enabled = useStorage('@DEJA/pref/ws-logging', false)
const wshost = useStorage('@DEJA/pref/ws-host', 'localhost:8082')
const { log } = useDccLog(enabled.value)

</script>
<template>  
  <v-card title="DCC Logger" class="flex flex-col" color="teal">
    <v-card-actions>
      <v-switch v-model="enabled" label="Enabled" color="teal" />
      <v-text-field v-model="wshost" color="teal" />
    </v-card-actions>
    <v-card-text class="flex flex-1 flex-col-reverse gap-4 overflow-hidden">
        <ul class="flex flex-col-reverse">
          <li v-for="entry in log" :key="entry.id" class="border-b">
            <DCCLogItem :entry="entry" />
          </li>
        </ul>
    </v-card-text>
  </v-card>  
</template>