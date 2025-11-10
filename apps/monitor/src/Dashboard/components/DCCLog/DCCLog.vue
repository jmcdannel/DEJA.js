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
      <div class="monitor-card__header w-full">
        <div class="flex flex-col gap-1">
          <span class="monitor-card__title">DCC Logger</span>
          <span class="monitor-card__subtitle">WebSocket host: {{ wshost || 'not configured' }}</span>
        </div>
        <v-spacer />
        <div class="monitor-card__toolbar">
          <v-btn
            icon="mdi-arrow-expand"
            variant="text"
            size="small"
            density="comfortable"
            class="monitor-card__icon-btn"
            aria-label="Open DCC log in full screen"
            @click="openFullScreen"
          />
        </div>
      </div>
    </template>
    <v-card-actions class="monitor-card__toolbar-row flex-wrap gap-3">
      <v-switch v-model="enabled" label="Enabled" />
      <v-text-field v-model="wshost" label="Host" hide-details density="compact" />
    </v-card-actions>
    <v-card-text class="monitor-card__body flex flex-1 flex-col overflow-hidden">
      <div class="monitor-card__scroll flex-1 overflow-y-auto">
        <ul class="monitor-card__log-list flex flex-col-reverse">
          <li v-for="entry in log" :key="entry.id">
            <DCCLogItem :entry="entry" />
          </li>
        </ul>
      </div>
    </v-card-text>
  </v-card>
</template>
