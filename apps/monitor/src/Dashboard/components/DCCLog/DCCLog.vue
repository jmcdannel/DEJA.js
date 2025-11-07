<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { useDccLog } from './useDccLog'
import DCCLogItem from './DCCLogItem.vue'

const enabled = useStorage('@DEJA/pref/ws-logging', false)
const wshost = useStorage('@DEJA/pref/ws-host', 'localhost:8082')
const { log } = useDccLog(enabled.value)
const router = useRouter()

function openFullScreen() {
  router.push({ name: 'log-view', params: { logType: 'dcc' } })
}

</script>
<template>
  <v-card class="flex flex-col">
    <template #title>
      <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        <span>DCC Logger</span>
        <v-spacer />
        <v-btn
          icon="mdi-arrow-expand"
          variant="text"
          size="small"
          density="comfortable"
          aria-label="Open DCC log in full screen"
          @click="openFullScreen"
        />
      </div>
    </template>
    <v-card-actions class="gap-2">
      <v-switch v-model="enabled" label="Enabled" />
      <v-text-field v-model="wshost" label="Host" hide-details density="compact" />
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